import {
  CommonModule,
  isPlatformBrowser,
  isPlatformServer,
} from '@angular/common';
import {
  Component,
  Inject,
  makeStateKey,
  PLATFORM_ID,
  signal,
  TransferState,
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  forkJoin,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ExploreSectionResponse,
  IMoneyInfoRes,
} from '../../../core/models/interfaces';
import { IULB } from '../../../core/models/ulb';
import { CommonService } from '../../../core/services/common.service';
import { CitySearch } from '../../../shared/components/city-search/city-search';
import { GridView } from '../../../shared/components/grid-view/grid-view';
import { InfoCards } from '../../../shared/components/info-cards/info-cards';
import { Map } from '../../../shared/components/map/map';
import { PreLoader } from '../../../shared/components/pre-loader/pre-loader';
import { StateSearch } from '../../../shared/components/state-search/state-search';
import { DashboardService } from '../dashboard-service';
import { BalancesheetIncomestatement } from './balancesheet-incomestatement/balancesheet-incomestatement';
import { BorrowingCreditRating } from './borrowing-credit-rating/borrowing-credit-rating';
import { FinancialIndicator } from './financial-indicator/financial-indicator';
import { Slb } from './slb/slb';

// --- TransferState Keys ---
const CITY_DETAILS_KEY = makeStateKey<any>('cityDetailsKey');
const SELECTED_LEDGER_YEAR = makeStateKey<string>('selectedLedgerYear');
const LEDGER_YEARS_KEY = makeStateKey<string[]>('ledgerYearsKey');
const SLB_YEARS_KEY = makeStateKey<string[]>('slbYearsKey');
const MONEY_INFO_KEY = makeStateKey<IMoneyInfoRes>('moneyInfoKey');

@Component({
  selector: 'app-city',
  imports: [
    CommonModule,
    StateSearch,
    Map,
    MatTabsModule,
    MatTooltipModule,
    InfoCards,
    GridView,
    CitySearch,
    PreLoader,
    BorrowingCreditRating,
    Slb,
    BalancesheetIncomestatement,
    FinancialIndicator,
  ],
  templateUrl: './city.html',
  styleUrl: './city.scss',
})
export class City {
  v1Url = environment.v1Url;
  loadedTabs: boolean[] = [true, false, false, false];
  ulbIdSignal = signal('');
  ulbSlugName = signal('');
  isLoading = signal(true);
  isMoneyInfoLoading = signal(false);
  private destroy$ = new Subject<void>();

  hasError = signal(false);
  errorMessage = signal('');

  cityDetails = signal<any>({});
  moneyInfoRes = signal<IMoneyInfoRes | null>(null);
  ledgerYears = signal<string[]>([]);
  slbYears = signal<string[]>([]);
  selectedLedgerYear = signal<string>('');

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _commonService: CommonService,
    private _dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const citySlugName = params.get('cityId') || '';
        this.selectedLedgerYear.set('');

        if (citySlugName && citySlugName !== this.ulbSlugName()) {
          this.ulbSlugName.set(citySlugName);
          this.loadData(citySlugName);
        } else if (!citySlugName) this.isLoading.set(false);
      });
  }

  // Consolidated method to load all necessary data for the city.
  // Handles TransferState logic to prevent redundant API calls on the client.
  private loadData(citySlugName: string): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    // TransferState check for client-side hydration
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(CITY_DETAILS_KEY) &&
      this.transferState.hasKey(LEDGER_YEARS_KEY) &&
      this.transferState.hasKey(SLB_YEARS_KEY) &&
      this.transferState.hasKey(MONEY_INFO_KEY) &&
      this.transferState.hasKey(SELECTED_LEDGER_YEAR)
    ) {
      // Retrieve and set all data from TransferState
      this.cityDetails.set(this.transferState.get(CITY_DETAILS_KEY, null));
      this.ledgerYears.set(this.transferState.get(LEDGER_YEARS_KEY, []));
      this.slbYears.set(this.transferState.get(SLB_YEARS_KEY, []));
      this.moneyInfoRes.set(this.transferState.get(MONEY_INFO_KEY, null));
      this.selectedLedgerYear.set(
        this.transferState.get(SELECTED_LEDGER_YEAR, '')
      );

      // Set ulb id.
      this.ulbIdSignal.set(this.cityDetails().ulbId);
      // this.setDerivedCityProperties(this.cityDetails());

      // Remove keys from TransferState to prevent memory leaks for subsequent client-side navigations
      this.transferState.remove(CITY_DETAILS_KEY);
      this.transferState.remove(SLB_YEARS_KEY);
      this.transferState.remove(LEDGER_YEARS_KEY);
      this.transferState.remove(SELECTED_LEDGER_YEAR);
      this.transferState.remove(MONEY_INFO_KEY);

      this.isLoading.set(false);
      return;
    }

    // --- Server-side or Client-side (no TransferState) API Calls ---
    this.getCityDetailsObservable(citySlugName).subscribe({
      next: (res) => {
        this.cityDetails.set(res);
        this.ulbIdSignal.set(res.ulbId);
        // console.log(res);
      },
      error: (error: Error) => {
        console.error(`${this.getPlatForm()}: Failed to get cityData: `, error);
        this.handleLoadingAndError(error);
        this.isLoading.set(false);
      },
      complete: () => {
        // Use forkJoin to fetch independent data in parallel.
        // getMoneyInfoObservable() needs year so use switchMap.
        forkJoin({
          distinctYearsRes: this.getLedgerYearsObservable(this.ulbIdSignal()),
          distinctSlbYearsRes: this.getSlbYearsObservable(this.ulbIdSignal()),
          // cityDetailsRes: this.getCityDetailsObservable(cityId),
        })
          .pipe(
            catchError((error) => {
              console.error(`${this.getPlatForm()}: Error in API calls`, error);
              this.handleLoadingAndError(error);
              return throwError(() => error);
            }),
            // Once distinctYearsRes is available, update selectedLedgerYear()
            // Use switchMap to fetch moneyInfoRes based on the updated year.
            switchMap((initialResults) => {
              // Update ledgerYears and selectedLedgerYear immediately
              this.ledgerYears.set(initialResults.distinctYearsRes.ledgerYears);
              this.selectedLedgerYear.set(this.ledgerYears()[0] || '');

              // City details: grid view data, State data.
              // this.cityDetails.set(initialResults.cityDetailsRes);

              // If no ledger year, no need to fetch money info, return empty observable
              if (!this.selectedLedgerYear()) {
                console.warn(`${this.getPlatForm()}: Ledger year unavailable`);
                return forkJoin({
                  initialData: of(initialResults),
                  moneyInfoRes: of(null),
                });
              }

              // Return an observable that also contains the result of getMoneyInfoObservable
              return forkJoin({
                initialData: of(initialResults),
                moneyInfoRes: this.getMoneyInfoObservable(
                  this.selectedLedgerYear(),
                  this.ulbIdSignal()
                ),
              });
            }),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (finalRes) => {
              const { initialData, moneyInfoRes } = finalRes;

              // Ledger Years
              this.ledgerYears.set(initialData.distinctYearsRes.ledgerYears);
              this.selectedLedgerYear.set(this.ledgerYears()[0] || '');

              // SLB years
              this.slbYears.set(initialData.distinctSlbYearsRes.slbYears);

              // Money info: info cards.
              this.moneyInfoRes.set(moneyInfoRes);

              // --- Store in TransferState on Server ---
              if (isPlatformServer(this.platformId)) {
                // Store all fetched data in TransferState only if on the server
                this.transferState.set(CITY_DETAILS_KEY, this.cityDetails());
                this.transferState.set(LEDGER_YEARS_KEY, this.ledgerYears());
                this.transferState.set(SLB_YEARS_KEY, this.slbYears());
                this.transferState.set(MONEY_INFO_KEY, this.moneyInfoRes());
                this.transferState.set(
                  SELECTED_LEDGER_YEAR,
                  this.selectedLedgerYear()
                );
              }

              this.isLoading.set(false);
            },
            error: (error: Error) => {
              console.error(
                `${this.getPlatForm()}: Uncaught Error in loadData(): `,
                error
              );
              this.handleLoadingAndError(error);
              this.isLoading.set(false);
            },
          });
      },
    });
  }

  getPlatForm(): 'SERVER' | 'CLIENT' {
    return isPlatformServer(this.platformId) ? 'SERVER' : 'CLIENT';
  }

  private getCityDetailsObservable(
    citySlugName: string
  ): Observable<ExploreSectionResponse> {
    return this._commonService.getCityData(citySlugName);
  }

  private getLedgerYearsObservable(cityId: string) {
    return this._commonService.getLedgerYears('', cityId);
  }

  private getSlbYearsObservable(cityId: string) {
    return this._commonService.slbYears(cityId);
  }

  private getMoneyInfoObservable(year: string, cityId: string) {
    return this._dashboardService.getMoneyInfo(year, '', cityId);
  }

  // Unified error handling method
  private handleLoadingAndError(error: Error): void {
    this.isLoading.set(false);
    this.hasError.set(true);
    this.errorMessage.set(
      'An error occurred while loading data. Please try again.'
    );
    // TODO add snackbar;
  }

  // Drop down selection.
  public onMoneyInfoYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) {
      this.selectedLedgerYear.set(yearSelected);
      this.fetchMoneyInfoForYear(yearSelected, this.ulbIdSignal());
    }
  }

  //  Dedicated method to fetch money info based on the selected year.
  //  Called when year is selected from drop down.
  private fetchMoneyInfoForYear(year: string, ulbId: string): void {
    this.isMoneyInfoLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    this.getMoneyInfoObservable(year, ulbId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('CLIENT-SIDE: Error fetching money info: ', error);
          this.isMoneyInfoLoading.set(false);
          this.hasError.set(true);
          this.errorMessage.set(`Failed to load money info for ${year}.`);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (res: IMoneyInfoRes) => {
          this.moneyInfoRes.set(res);
          this.isMoneyInfoLoading.set(false);
          // console.log(`CLIENT-SIDE: Money info loaded for year ${year}.`);
        },
        error: () => {
          this.isMoneyInfoLoading.set(false);
        },
      });
  }

  // Callback: From child when ULB/city is selected
  onUlbSelected = (ulbObj: IULB): void => {
    // console.log('Value of ULB sent by child to parent: onUlbSelected()');
    // console.log(ulbObj, this.platformId);
    if (ulbObj.slug) this.updateUlbIdAndNavigate(ulbObj.slug);
  };

  // ----- Map Section -----

  public selectedUlbObjChange(ulbObj: IULB): void {
    // console.log('Ulb clicked on map: ', ulbObj);
    if (ulbObj.slug) this.updateUlbIdAndNavigate(ulbObj.slug);
    else {
      console.error('ULB slug not found');
    }
  }

  // Navigate to other ulb.
  private updateUlbIdAndNavigate(newUlbId: string): void {
    this.router.navigate(['/dashboard/city', newUlbId]);
  }

  // On tab changes call the chid components.
  public onTabChange(idx: number): void {
    this.loadedTabs[idx] = true;
  }

  ngDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

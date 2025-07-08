import {
  CommonModule,
  isPlatformBrowser,
  isPlatformServer,
} from '@angular/common';
import {
  Component,
  effect,
  Inject,
  makeStateKey,
  PLATFORM_ID,
  signal,
  TransferState
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, Observable, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { IMoneyInfoRes } from '../../../core/models/interfaces';
import { IState } from '../../../core/models/state/state';
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
  // Reactive Signals for stateId and cityName
  // selectedStateIdSignal = signal<string>('');
  // selectedStateNameSignal = signal<string>('');
  // stateCodeSignal = signal<string>('');
  // selectedCityNameSignal = signal<string>('');
  // ulbIdSignal = signal<string>('');

  // exploreData!: ExploresectionTable[];
  // popCat: string = '';
  // lastModifiedAt: string | null = null;

  // Money info cards.
  // moneyInfoSignal = signal<ExploresectionTable[]>([]);
  // audit_status: string = '';
  // isActive: boolean = true;
  slbYears = signal<string[]>([]);
  // borrowingYears = signal<string[]>([]);

  isLoading1: boolean = true;
  isLoading2: boolean = true;

  loadedTabs: boolean[] = [true, false, false, false];
  isSlbDisabled: boolean = true;
  // isLedgerDisabled: boolean = true;
  // isBorrowingDisabled: boolean = true;
  // isCreditDisabled: boolean = false;

  private destroy$ = new Subject<void>();

  // isLoading is now a single, component-wide flag
  isLoading = signal(true);
  isMoneyInfoLoading = signal(false);
  ulbIdSignal = signal('');
  // selectedLedgerYear = signal('');

  // distinctYearsList = signal<string[]>([]);

  hasError = signal(false);
  errorMessage = signal('');

  // Signals for the data specific to getCityDetails()
  cityDetails = signal<any>({});
  moneyInfoRes = signal<IMoneyInfoRes | null>(null);

  ledgerYears = signal<string[]>([]);
  selectedLedgerYear = signal<string>('');

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _commonService: CommonService,
    private _dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState
  ) {
    // // --- Setup Effects ---
    // // This effect will run ONLY on the client-side and react to changes in selectedLedgerYear
    // effect(() => {
    //   const currentSelectedYear = this.selectedLedgerYear();
    //   const currentUlbId = this.ulbIdSignal();

    //   // This effect will run on initial hydration (client-side).
    //   // We only want to re-fetch if the year actually changes *after* the initial load.
    //   if (currentSelectedYear && currentUlbId && !this.isLoading()) {
    //     console.log(`${this.getPlatForm()}: selectedLedgerYear changed to ${currentSelectedYear}. Fetching money info.`);
    //     this.fetchMoneyInfoForYear(currentSelectedYear, currentUlbId);
    //   }
    // });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const cityId = params.get('cityId') || '';
        this.selectedLedgerYear.set('');

        if (cityId && cityId !== this.ulbIdSignal()) {
          this.ulbIdSignal.set(cityId);
          this.loadData(cityId);
        } else if (!cityId) this.isLoading.set(false);
      });
  }

  /**
   * Consolidated method to load all necessary data for the city.
   * Handles TransferState logic to prevent redundant API calls on the client.
   */
  private loadData(cityId: string): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    // --- TransferState check for client-side hydration ---
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(CITY_DETAILS_KEY) &&
      this.transferState.hasKey(LEDGER_YEARS_KEY) &&
      this.transferState.hasKey(MONEY_INFO_KEY) &&
      this.transferState.hasKey(SELECTED_LEDGER_YEAR)
    ) {
      console.log('CLIENT-SIDE: Hydrating all data from TransferState...');

      // Retrieve and set all data from TransferState
      this.cityDetails.set(this.transferState.get(CITY_DETAILS_KEY, null));
      this.ledgerYears.set(this.transferState.get(LEDGER_YEARS_KEY, []));
      this.selectedLedgerYear.set(this.transferState.get(SELECTED_LEDGER_YEAR, ''));
      this.moneyInfoRes.set(this.transferState.get(MONEY_INFO_KEY, null));

      // this.setDerivedCityProperties(this.cityDetails());

      // Remove keys from TransferState to prevent memory leaks for subsequent client-side navigations
      this.transferState.remove(CITY_DETAILS_KEY);
      this.transferState.remove(LEDGER_YEARS_KEY);
      this.transferState.remove(SELECTED_LEDGER_YEAR);
      this.transferState.remove(MONEY_INFO_KEY);

      this.isLoading.set(false);
      return;
    }

    // --- Server-side or Client-side (no TransferState) API Calls ---
    console.log(`${this.getPlatForm()}: making api calls for: ${cityId}`);

    // Use forkJoin to fetch independent data in parallel.
    // getMoneyInfoObservable() needs year so use switchMap.
    forkJoin({
      distinctYearsRes: this.getLedgerYearsObservable(cityId),
      cityDetailsRes: this.getCityDetailsObservable(cityId),
    })
      .pipe(
        catchError(error => {
          console.error(`${this.getPlatForm()}: Error in initial API calls for City ID ${cityId}:`, error);
          this.handleLoadingAndError(error);
          return throwError(() => error);
        }),
        // Once distinctYearsRes is available, update selectedLedgerYear()
        // and then use switchMap to fetch moneyInfoRes based on the updated year.
        switchMap(initialResults => {
          // Update ledgerYears and selectedLedgerYear immediately
          this.ledgerYears.set(initialResults.distinctYearsRes.ledgerYears);
          this.selectedLedgerYear.set(this.ledgerYears()[0] || '');

          // City details: grid view data, State data.
          this.cityDetails.set(initialResults.cityDetailsRes);
          // this.setDerivedCityProperties(this.cityDetails())

          if (!this.selectedLedgerYear()) {
            console.warn(`${this.getPlatForm()}: No ledger year available to fetch money info for City ID: ${cityId}`);
            // If no ledger year, no need to fetch money info, return empty observable
            return forkJoin({
              initialData: of(initialResults),
              moneyInfoRes: of(null)
            });
          }

          // Return an observable that also contains the result of getMoneyInfoObservable
          return forkJoin({
            initialData: of(initialResults),
            moneyInfoRes: this.getMoneyInfoObservable(this.selectedLedgerYear(), this.ulbIdSignal()),
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

          // City details: grid view data, State data.
          // this.cityDetails.set(initialData.cityDetailsRes);
          // this.setDerivedCityProperties(this.cityDetails());

          // Money info: info cards.
          this.moneyInfoRes.set(moneyInfoRes);

          // --- Store in TransferState on Server ---
          if (isPlatformServer(this.platformId)) {
            // Store all fetched data in TransferState only if on the server
            this.transferState.set(CITY_DETAILS_KEY, this.cityDetails());
            this.transferState.set(LEDGER_YEARS_KEY, this.ledgerYears());
            this.transferState.set(MONEY_INFO_KEY, this.moneyInfoRes());
            this.transferState.set(SELECTED_LEDGER_YEAR, this.selectedLedgerYear());
            console.log('SERVER-SIDE: Stored all data in TransferState.');
          }

          this.isLoading.set(false);
        },
        error: (error: Error) => {
          console.error(`${this.getPlatForm()}: Uncaught Error in loadData() subscribe for City ID ${cityId}: `, error);
          this.handleLoadingAndError(error);
          this.isLoading.set(false);
        },
      });
  }

  // // Helper method to set derived properties from cityDetails
  // private setDerivedCityProperties(cityDetails: CityDetailsResponse | null): void {
  //   if (cityDetails) {
  //     this.exploreData.set(cityDetails.gridDetails);
  //     this.popCat.set(cityDetails.popCat);
  //     this.stateInfo.set(cityDetails.state);
  //     this.ulbName.set(cityDetails.ulbName);
  //   } else {
  //     // Clear derived properties if cityDetails is null
  //     this.exploreData.set(null);
  //     this.popCat.set(null);
  //     this.stateInfo.set(null);
  //     this.ulbName.set('');
  //   }
  // }

  getPlatForm(): 'SERVER' | 'CLIENT' {
    return isPlatformServer(this.platformId) ? 'SERVER' : 'CLIENT';
  }

  private getCityDetailsObservable(cityId: string): Observable<any> {
    return this._commonService.getCityData(cityId);
  }

  private getLedgerYearsObservable(cityId: string) {
    return this._commonService.getLedgerYears('', cityId);
  }

  private getMoneyInfoObservable(year: string, cityId: string) {
    return this._dashboardService.getMoneyInfo(year, '', cityId)
  }

  get isLedgerDisabled() {
    return this.ledgerYears().length === 0;
  }

  // Unified error handling method
  private handleLoadingAndError(error: Error): void {
    this.isLoading.set(false);
    this.hasError.set(true);
    this.errorMessage.set('An error occurred while loading data. Please try again.');
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

  /**
   * Dedicated method to fetch money info based on the selected year.
   * This is called by the effect for client-side updates.
   */
  private fetchMoneyInfoForYear(year: string, ulbId: string): void {
    this.isMoneyInfoLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set('');

    this.getMoneyInfoObservable(year, ulbId).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('CLIENT-SIDE: Error fetching money info for year', year, error);
        this.isMoneyInfoLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set(`Failed to load money info for ${year}.`);
        return throwError(() => error);
      })
    ).subscribe({
      next: (res: IMoneyInfoRes) => {
        this.moneyInfoRes.set(res);
        this.isMoneyInfoLoading.set(false);
        // console.log(`CLIENT-SIDE: Money info loaded for year ${year}.`);
      },
      error: () => {
        this.isMoneyInfoLoading.set(false);
      }
    });
  }

  // ----- Search Section -----
  // Callback: From child when state is selected
  onStateSelected = (stateObj: IState): void => {
    console.log(
      'Value of state sent by child to parent: onStateSelected()',
      stateObj,
      this.platformId
    );
    this.setCityName('');
    this.setStateData(stateObj.name, stateObj._id, stateObj.code);
  };

  // Callback: From child when ULB/city is selected
  onUlbSelected = (ulbObj: IULB): void => {
    console.log(
      'Value of ULB sent by child to parent: onUlbSelected()',
      ulbObj,
      this.platformId
    );
    if (ulbObj._id) this.updateUlbIdAndNavigate(ulbObj._id);
  };

  // Helper: Set state ID signal
  setStateData(name: string = '', _id: string = '', code: string = ''): void {
    // // --- TransferState check for client-side hydration ---
    // if (
    //   isPlatformBrowser(this.platformId) &&
    //   this.transferState.hasKey(STATE_CODE_KEY) &&
    //   this.transferState.hasKey(STATE_ID_KEY) &&
    //   this.transferState.hasKey(STATE_NAME_KEY)
    // ) {
    //   console.log('CLIENT-SIDE: - setStateData - Hydrating all data from TransferState...');

    //   // Retrieve and set all data from TransferState
    //   this.stateCodeSignal.set(this.transferState.get(STATE_CODE_KEY, ''));
    //   this.selectedStateIdSignal.set(this.transferState.get(STATE_ID_KEY, ''));
    //   this.selectedStateNameSignal.set(this.transferState.get(STATE_NAME_KEY, ''));

    //   // Remove keys from TransferState to prevent memory leaks for subsequent client-side navigations
    //   this.transferState.remove(STATE_CODE_KEY);
    //   this.transferState.remove(STATE_ID_KEY);
    //   this.transferState.remove(STATE_NAME_KEY);

    //   return;
    // }

    // this.selectedStateNameSignal.set(name);
    // this.selectedStateIdSignal.set(_id);
    // this.stateCodeSignal.set(code);

    // // --- Store in TransferState on Server ---
    // if (isPlatformServer(this.platformId)) {
    //   // Store all fetched data in TransferState only if on the server
    //   this.transferState.set(LEDGER_YEARS_KEY, this.ledgerYears());
    //   console.log('SERVER-SIDE: - setStateData - Stored all data in TransferState.');
    // }

  }

  // Helper: Set city/ULB name signal
  setCityName(ulbName: string): void {
    console.log('setCityName(): ', this.platformId);
    // this.selectedCityNameSignal.set(ulbName);
  }

  // ----- Map Section -----
  public selectedCityIdChange($event: string): void {
    if ($event) this.updateUlbIdAndNavigate($event);
    // console.log('ulbIdChange from map', this.ulbIdSignal(), $event);
  }

  // ----- Get necessary data -----
  // private getCityDetails(): void {
  //   this.isLoading1 = true;
  //   this._commonService
  //     .getCityData(this.ulbIdSignal())
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (res) => {
  //         console.log('getCityDetails(): ', this.platformId);
  //         // console.log(res);
  //         this.exploreData = res.gridDetails;
  //         this.popCat = res.popCat;
  //         // this.lastModifiedAt = res.lastModifiedAt;

  //         this.setStateData(
  //           res.state.name,
  //           res.state._id,
  //           res.state.code || ''
  //         );
  //         this.setCityName(res.ulbName);
  //         this.isLoading1 = false;
  //       },
  //       error: (error) => {
  //         this.isLoading2 = false;
  //         console.error('Error in fetching city details', error);
  //       },
  //     });
  // }

  // Navigate to other ulb.
  private updateUlbIdAndNavigate(newUlbId: string): void {
    this.router.navigate(['/dashboard/city', newUlbId]);
  }

  // // ----- Get money info -----
  // private getMoneyInfo(): void {
  //   this.isLoading2 = true;
  //   this._dashboardService
  //     .getMoneyInfo(this.selectedLedgerYear(), '', this.ulbIdSignal())
  //     .subscribe({
  //       next: (res) => {
  //         // console.log('Money info cards(): ', res);
  //         console.log('Money info cards(): ', this.platformId);
  //         this.audit_status =
  //           res.audit_status === 'Audited' ? 'Audited' : 'Provisional';
  //         this.isActive = res.isActive;
  //         this.moneyInfoSignal.set(res.result);
  //         this.lastModifiedAt = res.lastModifiedAt;
  //         this.isLoading2 = false;
  //       },
  //       error: (error: Error) =>
  //         console.error('Error in fetching money info: ', error),
  //     });
  // }

  // TODO: fix this
  // readonly moneyInfoYearChange = effect(() => {
  //   if (this.selectedLedgerYear()) this.getMoneyInfo();
  // });


  // Get distinct years list.
  private getDistinctYearsList(): void {
    // // Distinct ledger years.
    // this._commonService.getLedgerYears('', this.ulbIdSignal()).subscribe({
    //   next: (res) => {
    //     this.isLedgerDisabled = false;
    //     if (res.ledgerYears.length === 0) this.isLedgerDisabled = true;
    //     this.ledgerYears.set(res.ledgerYears);
    //     this.selectedLedgerYear.set(this.ledgerYears()?.[0]);

    //     // console.log('Ledger years: ', res.ledgerYears, this.isLedgerDisabled);
    //   },
    //   error: (error) =>
    //     console.error(
    //       'Failed to fetch years list: getDistinctYearsList()',
    //       error
    //     ),
    // });

    // Distinct slb years.
    this._commonService.slbYears(this.ulbIdSignal()).subscribe({
      next: (res) => {
        this.isSlbDisabled = false;
        if (res.slbYears.length === 0) this.isSlbDisabled = true;
        this.slbYears.set(res.slbYears);

        // console.log('slb years: ', res.slbYears, this.isSlbDisabled);
      },
      error: (error: Error) => console.error('Failed to get slbYears: ', error),
    });

    // // Distinct bonds years.
    // this._commonService.borrowingYears(this.ulbIdSignal(), this.selectedStateIdSignal()).subscribe({
    //   next: (res) => {
    //     this.isBorrowingDisabled = false;
    //     if (res.borrowingYears.length === 0) this.isBorrowingDisabled = true;
    //     this.borrowingYears.set(res.borrowingYears);
    //     console.log('bonds years: ', res.borrowingYears, this.isBorrowingDisabled);
    //   },
    //   error: (error) => console.log('Failed to get borrowingYears: ', error),
    // });
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

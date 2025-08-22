import { DatePipe, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CreditRatingMap, ICreditRatingData } from '../../../core/models/creditRating/creditRatingResponse';
import { ExploreSectionResponse, ExploresectionTable } from '../../../core/models/interfaces';
import { AssetsService } from '../../../core/services/assets/assets.service';
import { CommonService } from '../../../core/services/common.service';
import { SeoService } from '../../../core/services/seo/seo.service';
import { GridView } from '../../../shared/components/grid-view/grid-view';
import { InfoCards } from '../../../shared/components/info-cards/info-cards';
import { PreLoader } from '../../../shared/components/pre-loader/pre-loader';
import { DashboardService } from '../dashboard-service';
import { DataAvailability } from "./data-availability/data-availability";
import { FinancialIndicators } from "./financial-indicators/financial-indicators";
import { Resources } from "./resources/resources";
import { NationalService } from './national.service';
import { environment } from '../../../../environments/environment';

const GRID_DATA_KEY = makeStateKey<any>('fetchExploreSectionData');
const CREDIT_RATINGS_KEY = makeStateKey<any>('creditRatings');


@Component({
  selector: 'app-national',
  imports: [
    PreLoader,
    GridView,
    RouterModule,
    InfoCards,
    MatTabsModule,
    DatePipe,
    DataAvailability,
    Resources,
    FinancialIndicators
  ],
  templateUrl: './national.html',
  styleUrl: './national.scss'
})
export class National implements OnInit {

  readonly v1Url = environment.v1Url;

  selectedIndex = 0;
  isLoading = signal(false);
  loadedTabs: boolean[] = [true, false, false, false];
  moneyInfo = signal<any[]>([]);
  exploreData = signal<{
    gridDetails: ExploresectionTable[];
    lastModifiedAt: string | null;
  }>({ gridDetails: [], lastModifiedAt: null });

  creditRating = signal<CreditRatingMap>({});
  totalCreditRating: number = 0;
  cr_above_BBB_minus: number = 0;
  private readonly ELIGIBLE_RATINGS = [
    'A',
    'A+',
    'AA',
    'AA+',
    'AA-',
    'AAA',
    'AAA+',
    'AAA-',
    'A-',
    'BBB',
    'BBB+',
    'BBB-',
  ];

  ledgerYears = signal<string[]>([]);
  selectedLedgerYear = signal<string>('');

  private destroy$ = new Subject<void>();

  dashboardTabs = signal<any[]>([]);


  constructor(
    private _commonService: CommonService,
    private dashboardService: DashboardService,
    private seoService: SeoService,
    private assetService: AssetsService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState,
    private nationalService: NationalService
  ) { }

  ngOnInit() {
    this.setSeo();
    this.getDashboardTabData();
    this.fetchCreditRatingsData();
    this.getLedgerYears();
  }

  private loadData() {
    this.getMoneyInfo();
    this.fetchExploreSectionData();
  }

  setSeo() {
    this.seoService.updateTitle('Municipal Financial Data of Indian Cities | City Finance ');

    this.seoService.updateMetaTags([
      { name: 'description', content: `View aggregated data availability for municipal finance across Indian cities. Explore revenue and expenditure trends and benchmark performance.` },
      { name: 'keywords', content: '' },
      { property: 'og:title', content: 'Municipal Financial Data of Indian Cities | City Finance ' },
      { property: 'og:description', content: 'View aggregated data availability for municipal finance across Indian cities. Explore revenue and expenditure trends and benchmark performance.' },
      { property: 'og:url', content: `https://cityfinance.in/dashboard/national/61e150439ed0e8575c881028` },
      { property: 'og:type', content: 'website' },
      //{ property: 'robotsrobots', content: 'index, follow' }
    ]);

    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "City Finance",
      "url": `https://cityfinance.in/dashboard/national/61e150439ed0e8575c881028`

    });
  }

  private getLedgerYears() {
    return this._commonService.getLedgerYears().subscribe({
      next: (res) => {
        this.ledgerYears.set(res.ledgerYears);
        this.selectedLedgerYear.set(this.ledgerYears()[1]);
      },
      error: () => console.error('Failed to get years'),
      complete: () => this.loadData()
    });
  }

  // TODO: Reuse code/ add service - dashboard-map-section.ts
  // Explore section data - State + National.
  private fetchExploreSectionData(): void {
    this.isLoading.set(true);

    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(GRID_DATA_KEY)
    ) {
      this.exploreData.set(this.transferState.get(GRID_DATA_KEY, []));
      this.transferState.remove(GRID_DATA_KEY);
      this.isLoading.set(false);
    } else {
      this._commonService
        .getExploreSectionData()
        .subscribe({
          next: (res: ExploreSectionResponse) => {
            this.exploreData.set(res);
          },
          error: (error: any) =>
            console.error('Error in loading explore section data: ', error),
          complete: () => {
            // Combine all the data - grid section (National and state filter)
            this.exploreData().gridDetails = [
              ...this.exploreData().gridDetails,
              {
                sequence: 3,
                label: 'ULBs Credit Rating Reports',
                value: `${this.totalCreditRating}`,
                info: '',
                src: '',
              },
              {
                sequence: 4,
                label: 'ULBs With Investment Grade Rating',
                value: `${this.cr_above_BBB_minus}`,
                info: '',
                src: '',
              },
            ];

            this.exploreData().gridDetails.sort(
              (a, b) => a.sequence - b.sequence
            );

            // TODO: make this dynamic.
            const obj = {
              sequence: 5,
              label: 'ULBs With Rating A & Above',
              value: 22,
              info: '',
              src: ''
            }

            this.exploreData().gridDetails[4] = obj;

            this.isLoading.set(false);

            if (isPlatformServer(this.platformId)) {
              this.transferState.set(GRID_DATA_KEY, this.exploreData());
            }
          },
        });
    }
  }

  // Get credit rating data - Card 3, 4.
  private fetchCreditRatingsData(): void {
    this.isLoading.set(true);

    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(CREDIT_RATINGS_KEY)
    ) {
      const data = this.transferState.get(CREDIT_RATINGS_KEY, []);
      this.creditRating.set(data);
      this.transferState.remove(CREDIT_RATINGS_KEY);
      this.isLoading.set(false);
    } else {
      this.assetService
        .fetchCreditRatingReport()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: ICreditRatingData[]) => {
            const computedData = this.computeRatings(res);
            this.creditRating.set(computedData);

            if (isPlatformServer(this.platformId)) {
              this.transferState.set(CREDIT_RATINGS_KEY, computedData);
            }

            this.isLoading.set(false);
          },
          error: (error: any) => {
            console.error('Error fetching credit rating report:', error);
            this.isLoading.set(false);
          },
          complete: () => this.updateRatingSummary(),
        });
    }
  }

  // Helper: Compute total, creditRatingAboveBBB_Minus count.
  private computeRatings(res: ICreditRatingData[]): CreditRatingMap {
    const computedData: CreditRatingMap = {
      India: { total: 0, creditRatingAboveBBB_Minus: 0 },
    };

    for (const data of res) {
      const stateName = data.state;
      const rating = data.creditrating;

      if (!computedData[stateName]) {
        computedData[stateName] = { total: 0, creditRatingAboveBBB_Minus: 0 };
      }

      computedData[stateName]['total'] += 1;
      computedData['India']['total'] += 1;

      if (this.ELIGIBLE_RATINGS.includes(rating)) {
        computedData[stateName]['creditRatingAboveBBB_Minus'] += 1;
        computedData['India']['creditRatingAboveBBB_Minus'] += 1;
      }
    }

    return computedData;
  }

  // Helper: Update credit ratings summary.
  private updateRatingSummary(): void {
    // const selected = this.selectedStateNameSignal() || 'India';
    const ratingData = this.creditRating()['India'] || {
      total: 0,
      creditRatingAboveBBB_Minus: 0,
    };

    this.totalCreditRating = ratingData['total'];
    this.cr_above_BBB_minus = ratingData['creditRatingAboveBBB_Minus'];
  }

  // Drop down selection.
  public onMoneyInfoYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) {
      this.selectedLedgerYear.set(yearSelected);
      this.getMoneyInfo();
    }
  }

  // Money info cards.
  private getMoneyInfo() {
    if (this.selectedLedgerYear()) {
      this.dashboardService.getMoneyInfo(this.selectedLedgerYear()).subscribe({
        next: (res: any) => this.moneyInfo.set(res.result),
        error: () => console.error('Failed to get money info'),
      });
    }
  }

  // Add tabs dynamically.
  private getDashboardTabData() {
    this.dashboardService
      .getDashboardTabData('619cc10e6abe7f5b80e45c6d')
      .subscribe({
        next: (tabs: any) => {
          this.dashboardTabs.set(tabs);
          this.nationalService.selectedTabName.set(this.dashboardTabs()[0].name);
        },
        error: (error: any) => console.log(error)
      }
      );
  }

  public onTabChange(idx: number): void {
    this.loadedTabs[idx] = true;
    this.nationalService.selectedTabName.set(this.dashboardTabs()[idx].name);
  }

  // Unsubscribe.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
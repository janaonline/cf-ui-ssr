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
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import {
  CreditRatingMap,
  ICreditRatingData,
} from '../../../core/models/creditRating/creditRatingResponse';
import {
  BondIssuances,
  ExploreSectionResponse,
  ExploresectionTable,
} from '../../../core/models/interfaces';
import { IState } from '../../../core/models/state/state';
import { IULB } from '../../../core/models/ulb';
import { AssetsService } from '../../../core/services/assets/assets.service';
import { CommonService } from '../../../core/services/common.service';
import { CitySearch } from '../../../shared/components/city-search/city-search';
import { GridView } from '../../../shared/components/grid-view/grid-view';
import { Map } from '../../../shared/components/map/map';
import { PreLoader } from '../../../shared/components/pre-loader/pre-loader';
import { StateSearch } from '../../../shared/components/state-search/state-search';

const CREDIT_RATINGS_KEY = makeStateKey<any>('creditRatings');
const STATE_LIST_KEY = makeStateKey<any>('stateList');
const BONDS_KEY = makeStateKey<any>('fetchBondIssuances');
const ULB_DATA_KEY = makeStateKey<any>('fetchUlbData');
const GRID_DATA_KEY = makeStateKey<any>('fetchExploreSectionData');

@Component({
  selector: 'app-dashboard-map-section',
  imports: [CommonModule, PreLoader, GridView, StateSearch, CitySearch, Map],
  templateUrl: './dashboard-map-section.html',
  styleUrl: './dashboard-map-section.scss',
})
export class DashboardMapSection {
  @ViewChild('map') mapComponent!: Map;

  myForm!: FormGroup;
  noDataFound: boolean = true;
  isLoading = signal<boolean>(true);
  showMap: boolean = false;

  selectedStateCodeSignal = signal<string>('');
  selectedStateIdSignal = signal<string>('');
  selectedStateNameSignal = signal<string>('');

  // stateList!: IState[];
  stateList = signal<IState[]>([]);
  filteredStates: Observable<IState[]> = of([]);

  selectedCityNameSignal = signal<string>('');
  selectedCityIdSignal = signal<string>('');
  cityData: any = []; // TODO: Avoid API call to get this data.
  filteredUlbs!: Observable<any[]>;

  // creditRating: CreditRatingMap = {};
  creditRating = signal<CreditRatingMap>({});
  totalCreditRating: number = 0;
  cr_above_BBB_minus: number = 0;

  lastModifiedDate: string | null = '';

  bondIssuances = signal<BondIssuances>({
    bondIssueAmount: 0,
    totalMunicipalBonds: 0,
    inProgress: true,
  });
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
  financialYearTexts = {
    startYear: '2015-16',
    endYear: '2022-23',
  };
  // exploreData!: ExploresectionTable[];
  exploreData = signal<{
    gridDetails: ExploresectionTable[];
    lastModifiedAt: string | null;
  }>({ gridDetails: [], lastModifiedAt: null });

  // exploreData = [
  //   { label: 'ULBs with atleast 1 Year of Financial Data', value: '4,309', info: '' },
  //   { label: 'Financial Statements for FYs 2015-16 to 22-23', value: '15,384', info: 'test' },
  //   { label: 'ULBs Credit Rating Reports', value: '223', info: '' },
  //   { label: 'ULBs With Investment Grade Rating', value: '95', info: '' },
  //   { label: 'Highest Financial Data Availability is in FY 2021-22', value: '77%', info: '' },
  //   { label: 'Municipal Bond Issuances Of Rs. 6,833 Cr With Details', value: '50', info: '' },
  // ];

  private destroy$ = new Subject<void>();

  constructor(
    protected _commonService: CommonService,
    private assetService: AssetsService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState,
  ) {}

  // One time functions.
  ngOnInit(): void {
    this.fetchCreditRatingsData();
    this.fetchStateList();
    this.loadData('state');
  }

  // On filter - API calls.
  private loadData(getUlbData: string = 'state'): void {
    this.fetchBondIssuances();
    this.updateRatingSummary();
    getUlbData === 'ulb' ? this.fetchUlbData() : this.fetchExploreSectionData();
  }

  // Get municipal bonds data - card 5.
  private fetchBondIssuances(): void {
    this.isLoading.set(true);

    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(BONDS_KEY)
    ) {
      const data = this.transferState.get(BONDS_KEY, []);
      this.bondIssuances.set(data);
      this.transferState.remove(BONDS_KEY);

      this.isLoading.set(false);
    } else {
      this._commonService
        .getBondIssuerItemAmount(this.selectedStateIdSignal())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: BondIssuances) => {
            const data = { ...res, inProgress: false };
            this.bondIssuances.set(data);
            this.isLoading.set(false);

            if (isPlatformServer(this.platformId)) {
              this.transferState.set(BONDS_KEY, data);
            }
          },
          error: (error: any) =>
            console.error('Error in fetching bonds data: ', error),
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
    const selected = this.selectedStateNameSignal() || 'India';
    const ratingData = this.creditRating()[selected] || {
      total: 0,
      creditRatingAboveBBB_Minus: 0,
    };

    this.totalCreditRating = ratingData['total'];
    this.cr_above_BBB_minus = ratingData['creditRatingAboveBBB_Minus'];
  }

  // Get states list.
  private fetchStateList() {
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(STATE_LIST_KEY)
    ) {
      const data = this.transferState.get(STATE_LIST_KEY, []);
      this.stateList.set(data);
      this.transferState.remove(STATE_LIST_KEY);
    } else {
      this._commonService
        .fetchStateList()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: IState[]) => {
            this.stateList.set(res);

            if (isPlatformServer(this.platformId)) {
              this.transferState.set(STATE_LIST_KEY, res);
            }
          },
        });
    }
  }

  // Get all the ulbs for selected state.
  private updateUlbsOfSelectedState(): void {
    if (this.selectedStateCodeSignal()) {
      this._commonService
        .getUlbByState(this.selectedStateCodeSignal())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            const ulbsData = res;
            this.cityData = ulbsData?.data?.ulbs;
          },
          error: (error: any) => console.error('Failed to fetch ulbs: ', error),
        });
    }
  }

  // Explore section data - ULB filter.
  private fetchUlbData(): void {
    this.isLoading.set(true);

    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(ULB_DATA_KEY)
    ) {
      this.exploreData.set({ gridDetails: [], lastModifiedAt: null });
      const data = this.transferState.get(ULB_DATA_KEY, []);
      this.exploreData.set(data);
      this.transferState.remove(ULB_DATA_KEY);

      this.isLoading.set(false);
    } else {
      if (this.selectedCityIdSignal()) {
        this.isLoading.set(true);
        this._commonService
          .getCityData(this.selectedCityIdSignal())
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res: ExploreSectionResponse) => {
              this.exploreData.set(res);
              this.isLoading.set(false);

              if (isPlatformServer(this.platformId)) {
                this.transferState.set(ULB_DATA_KEY, res);
              }
            },
            error: (error: Error) =>
              console.error('Error in fetching ulbData: ', error),
          });
      }
    }
  }

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
      this.showMap = true;
    } else {
      this._commonService
        .getExploreSectionData(
          this.selectedStateCodeSignal(),
          this.selectedStateIdSignal(),
        )
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
              {
                sequence: 6,
                label: `Municipal Bond Issuances Of Rs. ${this.bondIssuances().bondIssueAmount} Cr With Details`,
                value: `${this.bondIssuances().totalMunicipalBonds}`,
                info: '',
                src: '',
              },
            ];

            this.exploreData().gridDetails.sort(
              (a, b) => a.sequence - b.sequence,
            );

            // Ticker above search bar - homepage.
            this._commonService.setDataForVisualizationCount(
              this.exploreData().gridDetails[0].value?.toString(),
            );

            this.isLoading.set(false);
            this.showMap = true;

            if (isPlatformServer(this.platformId)) {
              this.transferState.set(GRID_DATA_KEY, this.exploreData());
            }
          },
        });
    }
  }

  // State object sent by child - Drop down selection.
  public onStateSelected = (stateObj: IState) => {
    // console.log('State obj sent by child to parent', stateObj);
    this.setStateData(stateObj.code, stateObj._id, stateObj.name);
    this.setUlbData();
  };

  // Helper: Update signal values with latest state data.
  private setStateData(
    code: string = '',
    _id: string = '',
    name: string = '',
  ): void {
    this.selectedStateCodeSignal.set(code);
    this.selectedStateIdSignal.set(_id);
    this.selectedStateNameSignal.set(name);

    this.updateUlbsOfSelectedState();
    this.loadData('state');
  }

  // ulb object sent by child - Drop down selection.
  public onUlbSelected = (ulbObj: IULB) => {
    // console.log('Ulb obj received from child to parent', ulbObj);
    this.setUlbData(ulbObj._id, ulbObj.name);
  };

  // Helper: Update signal values with latest ulb data.
  private setUlbData(_id: string = '', name: string = ''): void {
    this.selectedCityIdSignal.set(_id);
    this.selectedCityNameSignal.set(name);

    this.loadData('ulb');
  }

  // ----- Map changes -----
  // Update data when state is changed from map.
  public selectedStateCodeChange(stateCode: string) {
    // console.log('state clicked on map:', stateCode);
    const stateData = this.stateList().find((ele) => ele.code === stateCode);

    if (stateData)
      this.setStateData(stateData.code, stateData._id, stateData.name);
  }

  // Update data when ulb is changed from map.
  public selectedCityIdChange(ulbId: string): void {
    // console.log('Ulb clicked on map: ', ulbId);
    const ulbData = this.cityData?.find(
      (e: { _id: string }) => e?._id === ulbId,
    );
    if (ulbData) this.setUlbData(ulbData._id, ulbData.name);
  }

  // Reset map to india.
  public resetMap(): void {
    this.mapComponent?.resetMap();
    this.setStateData();
    this.setUlbData();
  }

  // View state/ city dashboard.
  public viewDashboard(): void {
    if (this.selectedCityIdSignal())
      this.router.navigateByUrl(
        `/dashboard/city/${this.selectedCityIdSignal()}`,
      );
    else
      this.router.navigateByUrl(
        `/dashboard/state/${this.selectedStateIdSignal()}`,
      );
  }

  checkIfBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Unsubscribe.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

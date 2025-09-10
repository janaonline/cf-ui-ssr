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
import { environment } from '../../../../environments/environment';
import {
  CreditRatingMap
} from '../../../core/models/creditRating/creditRatingResponse';
import {
  BondIssuances,
  ExploreSectionResponse,
  ExploresectionTable,
} from '../../../core/models/interfaces';
import { IState } from '../../../core/models/state/state';
import { IULB } from '../../../core/models/ulb';
import { CommonService } from '../../../core/services/common.service';
import { CitySearch } from '../../../shared/components/city-search/city-search';
import { GridView } from '../../../shared/components/grid-view/grid-view';
import { Map } from '../../../shared/components/map/map';
import { PreLoader } from '../../../shared/components/pre-loader/pre-loader';
import { StateSearch } from '../../../shared/components/state-search/state-search';
import { NationalDashboard } from '../../../shared/services/national-dashboard';

const STATE_LIST_KEY = makeStateKey<any>('stateList');
const ULB_DATA_KEY = makeStateKey<any>('fetchUlbData');

@Component({
  selector: 'app-dashboard-map-section',
  imports: [CommonModule, PreLoader, GridView, StateSearch, CitySearch, Map],
  templateUrl: './dashboard-map-section.html',
  styleUrl: './dashboard-map-section.scss',
})
export class DashboardMapSection {
  @ViewChild('map') mapComponent!: Map;

  v1Url = environment.v1Url;

  myForm!: FormGroup;
  noDataFound: boolean = true;
  showMap = signal<boolean>(false);

  selectedState = signal<IState>({ _id: '', name: '' });
  selectedStateCodeSignal = signal<string>('');
  selectedStateIdSignal = signal<string>('');
  selectedStateNameSignal = signal<string>('');

  // stateList!: IState[];
  stateList = signal<IState[]>([]);
  filteredStates: Observable<IState[]> = of([]);

  selectedCityNameSignal = signal<string>('');
  selectedCityIdSignal = signal<string>('');
  ulbSlugName = signal<string>('');
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
  private destroy$ = new Subject<void>();

  constructor(
    protected _commonService: CommonService,
    public nationalDashboardService: NationalDashboard,
    private router: Router,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  // One time functions.
  ngOnInit(): void {
    this.nationalDashboardService.fetchCreditRatingsData('home', true);
    this.fetchStateList();
  }

  ngAfterViewInit() {
    this.showMap.set(true);
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
    this.nationalDashboardService.isLoading.set(true);

    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(ULB_DATA_KEY)
    ) {
      this.nationalDashboardService.exploreData.set({ gridDetails: [], lastModifiedAt: null });
      const data = this.transferState.get(ULB_DATA_KEY, []);
      this.nationalDashboardService.exploreData.set(data);
      this.transferState.remove(ULB_DATA_KEY);

      this.nationalDashboardService.isLoading.set(false);
    } else {
      if (this.ulbSlugName()) {
        // this.nationalDashboardService.isLoading.set(true);
        this._commonService
          .getCityData(this.ulbSlugName())
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res: ExploreSectionResponse) => {
              this.nationalDashboardService.exploreData.set(res);
              this.nationalDashboardService.isLoading.set(false);

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

  // State object sent by child - Drop down selection.
  public onStateSelected = (stateObj: IState) => {
    // console.log('State obj sent by child to parent', stateObj);
    this.selectedState.set(stateObj);
    this.setStateData(stateObj.code, stateObj._id, stateObj.name);
    this.setUlbData();
  };

  // Helper: Update signal values with latest state data.
  private setStateData(
    code: string = '',
    _id: string = '',
    name: string = ''
  ): void {
    this.selectedStateCodeSignal.set(code);
    this.selectedStateIdSignal.set(_id);
    this.selectedStateNameSignal.set(name);

    this.updateUlbsOfSelectedState();
    this.nationalDashboardService.updateRatingSummary(
      this.selectedStateCodeSignal(),
      this.selectedStateIdSignal(),
      this.selectedStateNameSignal()
    );
  }

  // ulb object sent by child - Drop down selection.
  public onUlbSelected = (ulbObj: IULB) => {
    // console.log('Ulb obj received from child to parent', ulbObj);
    this.setUlbData(ulbObj._id, ulbObj.name, ulbObj.slug);
  };

  // Helper: Update signal values with latest ulb data.
  private setUlbData(
    _id: string = '',
    name: string = '',
    slug: string = ''
  ): void {
    this.selectedCityIdSignal.set(_id);
    this.selectedCityNameSignal.set(name);
    this.ulbSlugName.set(slug);

    this.fetchUlbData()
  }

  // ----- Map changes -----
  // Update data when state is changed from map.
  public selectedStateCodeChange(stateCode: string) {
    // console.log('state clicked on map:', stateCode);
    const stateData = this.stateList().find((ele) => ele.code === stateCode);

    if (stateData) {
      this.setStateData(stateData.code, stateData._id, stateData.name);
      this.selectedState.set(stateData);
    }
  }

  // Update data when ulb is changed from map.
  public selectedUlbObjChange(ulbObj: IULB): void {
    // console.log('Ulb clicked on map: ', ulbObj);
    if (ulbObj) this.setUlbData(ulbObj._id, ulbObj.name, ulbObj.slug);
  }

  // Reset map to india.
  public resetMap(): void {
    this.mapComponent?.resetMap();
    this.setStateData();
    this.setUlbData();
  }

  // View state/ city dashboard.
  public viewDashboard(): void {
    if (this.ulbSlugName()) {
      this.router.navigateByUrl(`/municipal-data/city/${this.ulbSlugName()}`);
    } else {
      this.router.navigateByUrl(`/municipal-data/state/${this.selectedState().slug}`);
    }
  }

  checkIfBrowser(): boolean {
    return !isPlatformServer(this.platformId);
  }

  // Unsubscribe.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { Component, signal, ViewChild } from '@angular/core';
import { PreLoader } from '../../../shared/components/pre-loader/pre-loader';
import { IULB } from '../../../core/models/ulb';
import { IState } from '../../../core/models/state/state';
import { BondIssuances, ExploreSectionResponse, ExploresectionTable } from '../../../core/models/interfaces';
import { FormGroup } from '@angular/forms';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { CreditRatingMap, ICreditRatingData } from '../../../core/models/creditRating/creditRatingResponse';
import { AssetsService } from '../../../core/services/assets/assets.service';
import { CommonService } from '../../../core/services/common.service';
import { Router } from '@angular/router';
import { Map } from '../../../shared/components/map/map';
import { GridView } from '../../../shared/components/shared-ui/grid-view';
import { StateSearch } from '../../../shared/components/shared-ui/state-search';
import { CitySearch } from '../../../shared/components/shared-ui/city-search';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-map-section',
  imports: [
    CommonModule,
    PreLoader,
    GridView,
    StateSearch,
    CitySearch,
    Map],
  templateUrl: './dashboard-map-section.html',
  styleUrl: './dashboard-map-section.scss'
})
export class DashboardMapSection {
  @ViewChild('map') mapComponent!: Map;

  myForm!: FormGroup;
  noDataFound: boolean = true;
  isLoading: boolean = true;
  showMap: boolean = false;

  selectedStateCodeSignal = signal<string>('');
  selectedStateIdSignal = signal<string>('');
  selectedStateNameSignal = signal<string>('');

  stateList!: IState[];
  filteredStates: Observable<IState[]> = of([]);

  selectedCityNameSignal = signal<string>('');
  selectedCityIdSignal = signal<string>('');
  cityData: any = []; // TODO: Avoid API call to get this data.
  filteredUlbs!: Observable<any[]>;

  creditRating: CreditRatingMap = {};
  totalCreditRating: number = 0;
  cr_above_BBB_minus: number = 0;

  lastModifiedDate: string | null = '';

  bondIssuances: BondIssuances = {
    bondIssueAmount: 0,
    totalMunicipalBonds: 0,
    inProgress: true,
  };
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
  exploreData!: ExploresectionTable[];

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
  ) { }

  ngOnInit(): void {
    this.fetchCreditRatingsData();
    this.fetchStateList();
    this.loadData('state');
  }

  private loadData(getUlbData: string = 'state'): void {
    this.fetchBondIssuances();
    this.updateRatingSummary();
    getUlbData === 'ulb' ? this.fetchUlbData() : this.fetchExploreSectionData();
  }

  // ----- Get data -----
  // Get municipal bonds data.
  private fetchBondIssuances(): void {
    this._commonService
      .getBondIssuerItemAmount(this.selectedStateIdSignal())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: BondIssuances) => (this.bondIssuances = { ...res, inProgress: false }),
        error: (error: any) => console.error('Error in fetching bonds data: ', error),
        complete: () => (this.bondIssuances['inProgress'] = false),
      });
  }

  // Get credit rating data.
  private fetchCreditRatingsData(): void {
    this.assetService
      .fetchCreditRatingReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ICreditRatingData[]) => {
          const computedData = this.computeRatings(res);
          this.creditRating = computedData;
          this.updateRatingSummary();
        },
        error: (error: any) => console.error('Error fetching credit rating report:', error),
      });
  }

  // Compute total, creditRatingAboveBBB_Minus count.
  private computeRatings(res: ICreditRatingData[]): CreditRatingMap {
    const computedData: CreditRatingMap = { India: { total: 0, creditRatingAboveBBB_Minus: 0 } };

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

  // Update credit ratings summary.
  private updateRatingSummary(): void {
    const selected = this.selectedStateNameSignal() || 'India';
    const ratingData = this.creditRating[selected] || { total: 0, creditRatingAboveBBB_Minus: 0 };

    this.totalCreditRating = ratingData['total'];
    this.cr_above_BBB_minus = ratingData['creditRatingAboveBBB_Minus'];
  }

  // Get states list.
  private fetchStateList() {
    this._commonService
      .fetchStateList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: IState[]) => (this.stateList = res),
      });
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

  // Explore section data - ULB.
  private fetchUlbData(): void {
    if (this.selectedCityIdSignal()) {
      this.isLoading = true;
      this._commonService
        .getCityData(this.selectedCityIdSignal())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: ExploreSectionResponse) => {
            this.exploreData = [];
            this.exploreData = res.gridDetails;
            this.lastModifiedDate = res.lastModifiedAt;
            this.isLoading = false;
          },
          error: (error: Error) => console.error('Error in fetching ulbData: ', error),
        });
    }
  }

  // Explore section data - State + National.
  private fetchExploreSectionData(): void {
    this.isLoading = true;
    this._commonService
      .getExploreSectionData(this.selectedStateCodeSignal(), this.selectedStateIdSignal())
      .subscribe({
        next: (res: ExploreSectionResponse) => {
          this.exploreData = [];
          this.exploreData = res.gridDetails;
          this.lastModifiedDate = res.lastModifiedAt;
        },
        error: (error: any) => console.error('Error in loading explore section data: ', error),
        complete: () => {
          this.exploreData = [
            ...this.exploreData,
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
              label: `Municipal Bond Issuances Of Rs. ${this.bondIssuances.bondIssueAmount} Cr With Details`,
              value: `${this.bondIssuances.totalMunicipalBonds}`,
              info: '',
              src: '',
            },
          ];

          this.exploreData.sort((a, b) => a.sequence - b.sequence);
          this._commonService.setDataForVisualizationCount(this.exploreData[0].value?.toString());
          this.isLoading = false;
          this.showMap = true;
        },
      });
  }

  // ----- Search section -----
  // State object sent by child - Drop down selection.
  public onStateSelected = (stateObj: IState) => {
    // console.log('State obj sent by child to parent', stateObj);
    this.setStateData(stateObj.code, stateObj._id, stateObj.name);
    this.setUlbData();
  };

  // Helper: Update signal values with latest state data.
  private setStateData(code: string = '', _id: string = '', name: string = ''): void {
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
    const stateData = this.stateList.find((ele) => ele.code === stateCode);

    if (stateData) this.setStateData(stateData.code, stateData._id, stateData.name);
  }

  // Update data when ulb is changed from map.
  public selectedCityIdChange(ulbId: string): void {
    // console.log('Ulb clicked on map: ', ulbId);
    const ulbData = this.cityData?.find((e: { _id: string }) => e?._id === ulbId);
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
      this.router.navigateByUrl(`/dashboard/city/${this.selectedCityIdSignal()}`);
    else this.router.navigateByUrl(`/dashboard/state/${this.selectedStateIdSignal()}`);
  }

  // Unsubscribe.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

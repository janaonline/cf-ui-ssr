import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, computed, effect, inject, Inject, input, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import { Subject, takeUntil } from 'rxjs';
import { ButtonObj, CalcType, IFinancialIndicatorInfo, IFinancialIndicatorsChart, LineItemType } from '../../../../core/models/interfaces';
import { IULB } from '../../../../core/models/ulb';
import { MaterialModule } from '../../../../material.module';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../shared/components/charts/constants';
import { CitySearch } from "../../../../shared/components/city-search/city-search";
import { NoDataFound } from '../../../../shared/components/no-data-found/no-data-found';
import { PreLoader } from '../../../../shared/components/pre-loader/pre-loader';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { compraeByOptions, IndicatorDetails } from '../../city/financial-indicator/constants';
import { DashboardService } from '../../dashboard-service';
import { ChartService } from './chart-service';
import { CompareByDialog } from './compare-by-dialog/compare-by-dialog';
import { stateDashboardSubTabsList } from './constant';
import { PopulationTable } from "./population-table/population-table";
import { MixChart } from "./mix-chart/mix-chart";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from "@angular/material/select";
import { CommonService } from '../../../../core/services/common.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-financial-indicator',
  imports: [Charts,
    // MaterialModule,
    FormsModule, MatFormFieldModule, MatTooltipModule,
    TabButtons, PreLoader, CitySearch, PopulationTable, MixChart, MatSelectModule],
  templateUrl: './financial-indicator.html',
  styleUrl: './financial-indicator.scss'
})
export class FinancialIndicator {
  readonly items = [
    // { icon: 'bi bi-arrows-fullscreen', label: 'Expand' },
    // { icon: 'bi bi-share-fill', label: 'Share' },
    // { icon: 'bi bi-arrow-clockwise', label: 'Reset' },
    { icon: 'bi bi-download', label: 'Download' },
  ];
  buttons: any[] = [];
  readonly compraeByOptions = compraeByOptions;

  readonly stateIdSignal = signal('');
  readonly ulbIdSignal = signal('');
  readonly stateDetails = input.required<any>();
  readonly dashboardTabData = input.required<any>();
  readonly tabName = input.required<any>();
  selectedLedgerYear = signal('');
  // @Input() tabName = 'Financial Indicators';

  currentSelectedButtonKey = signal<string>('Revenue');
  subButton = signal<string>('');
  currentSelectedButton: any = signal<any>({});

  myForm!: FormGroup;
  years = input.required<string[]>();
  yearList = signal<string[]>([]);

  infoMsg = signal<IFinancialIndicatorInfo>({ msg: '', text: 'success' });
  isChartDataAvailable = signal<boolean>(true);
  isLoading = signal<boolean>(true);
  isChartLoading = signal<boolean>(false);
  isChartDownloading = signal<boolean>(false);

  compareUlbsFromPopup!: IULB[] | undefined;
  compareTypeFromPopup!: string;
  dialogResult!: IFinancialIndicatorsChart;
  readonly dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  barChart = signal<ChartConfig>({
    chartId: 'barChart0',
    chartType: 'barChart',
    labels: [],
    datasets: [],
    options: {}
  });
  scatterChart = signal<ChartConfig>({
    chartId: 'scatterChart0',
    chartType: 'scatterChart',
    labels: [],
    datasets: [],
    options: {}
  });

  activeButtonList: any = stateDashboardSubTabsList;
  isBarChartLoading = signal(false);
  sortBy: string = 'top';
  serviceTabList: any[] = [];
  stateServiceLabel: boolean = false;
  serviceTab: string = '';
  filterName: string = '';

  responseData: any;
  compareType = '';
  chartType = 'scatter';
  compareUlbs: string[] = [];
  compareCategory: string = '';

  compareTypeButtons = signal<ButtonObj[]>([
    { label: 'State Average', key: '' },
    { label: 'Population Category', key: 'popType' },
    { label: 'ULB Type', key: 'ulbType' },
  ]);

  categoryAvgArray = [
    { value: "nationalAvg", title: "National Avg", isDisabled: false },
    { value: "ulbTypeAvg", title: "ULB Type Avg", isDisabled: false },
    { value: "populationAvg", title: "Population Category Avg", isDisabled: false, },
  ];

  isPerCapita: any;
  isDataInCrore: boolean = false;
  isMixBtn = false;
  code: any;

  constructor(
    // private fb: FormBuilder,
    private commonService: CommonService,
    private dashboardService: DashboardService,
    private chartService: ChartService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit() {
    if (this.tabName() === 'Service Level Benchmark') {
      this.stateServiceLabel = true;
      // this.getSLBYears();
      // this.getServiceDropDown();
    }

    this.yearList.set(this.years());
    this.selectedLedgerYear.set(this.years()[1]);
    this.getCurrentBtn();
    this.stateIdSignal.set(this.stateDetails().state._id);

    // this.myForm = this.fb.group({ year: [this.years()[0]] });

    this.isLoading.set(false);

    // this.myForm.get('year')?.valueChanges
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: () => this.getChartData()
    //   })
    // this.getStateGroupPopulation();

  }

  readonly canFetchChart = computed(() => {
    return !!this.stateIdSignal() &&
      !!this.years().length &&
      !!this.subButton() &&
      !!this.currentSelectedButtonKey()
  });

  lastSubButtonValue: string | null = null;
  readonly stateIdChangeEffect = effect(() => {
    if (!isPlatformBrowser(this.platformId)) return;
    const canFetch = this.canFetchChart();
    // console.log("canFetchChart:", canFetch);

    if (canFetch && this.subButton() !== this.lastSubButtonValue) {
      // console.log("Fetching for subButton:", this.subButton());
      this.lastSubButtonValue = this.subButton();
      this.getChartData();
    }
  })

  resetFilter() {
    this.selectedLedgerYear.set(this.years()[0]);
    this.ulbIdSignal.set('');
    this.getChartData();
  }

  onYearChange(event: any) {
    this.getChartData();
  }

  onChangeCategory(event: any) {
    this.compareCategory = event.target.value;
    // this.getChartData();
    this.getRevenueChart();
  }

  onUlbSelect(ulbObj: any) {
    this.ulbIdSignal.set(ulbObj._id);
    this.compareUlbs.push(ulbObj._id);
    this.getRevenueChart();
  }

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    this.currentSelectedButtonKey.set(key as LineItemType);
    this.getCurrentBtn();
    if (this.stateServiceLabel) {
      this.getServiceDropDown();
    }
  }

  getSLBBtn() {
    // this.reset();
    // if (changes.stateServiceLabel) {
    //   this.stateFilterDataService.getYearListSLB().subscribe(
    //     (res) => {
    //       this.yearList = res["data"];
    //     },
    //     (err) => {
    //       console.log(err.message);
    //     }
    //   );
    // }

    const btn = this.currentSelectedButton().label;
    // this.createDynamicChartTitle(this.currentActiveTab);
    if (btn == "Water Supply") {
      this.serviceTab = "water supply";
      this.stateServiceLabel = true;
    } else if (btn == "Waste Water Management") {
      this.serviceTab = "sanitation";
      this.stateServiceLabel = true;
    } else if (btn == "Solid Waste Management") {
      this.serviceTab = "solid waste";
      this.stateServiceLabel = true;
    } else if (btn == "Storm Water Drainage") {
      this.serviceTab = "storm water";
    }

    console.log("serviceTab", this.serviceTab?.toLocaleLowerCase(), btn);
    // this.getDropDownValue();
    // this.changeActiveBtn(0);
  }

  getServiceDropDown() {
    this.getSLBBtn()
    this.dashboardService.getServiceDropDown(this.serviceTab).subscribe({
      next: (res: any) => {
        this.serviceTabList = [...new Set(res?.data?.names)];
        this.filterName = this.serviceTabList[0];
        this.getChartData();
        // this.getRevenueChart();
      }, error: (err) => {
        console.error(err);
      }
    });
  }

  getCurrentBtn() {
    this.currentSelectedButton.set(this.dashboardTabData().find((btn: any) => btn.key === this.currentSelectedButtonKey()));
  }

  // Output emitted by child to parent
  onSelectedSubButtonChange(key: string): void {
    this.isMixBtn = key.includes('Mix');
    this.subButton.set(key);
  }

  // Type Guard Function
  isIndicatorDetails(
    value: string | ButtonObj[] | IndicatorDetails
  ): value is IndicatorDetails {
    return (
      (value as IndicatorDetails).aboutIndicator !== undefined &&
      Array.isArray((value as IndicatorDetails).aboutIndicator)
    );
  }

  // Retrieves the label from a list of Arrray based on the provided key.
  private getLabelByKey(arr: ButtonObj[], key: string): string | undefined {
    if (!Array.isArray(arr) || typeof key !== 'string') {
      console.warn('Invalid arguments passed to getLabelByKey');
      return undefined;
    }

    return arr.find(e => e.key === key)?.label;
  }

  // Get calcType based on sub button selected.
  private getcalcType(): CalcType {
    const subBtn = this.subButton();

    if (['totRev', 'totOwnRev', 'totRevex', 'capex',].includes(subBtn)) return 'total';
    else if (['revPerCapita', 'ownRevPerCapita', 'revexPerCapita', 'capexPerCapita',].includes(subBtn)) return 'perCapita';
    // else if (['revMix', 'ownRevMix', 'revexMix'].includes(subBtn)) return 'mix';
    return 'mix';
  }

  updateBarChartData(data: any): void {
    let countKey = 'sum';

    switch (this.subButton()) {
      case 'Capital Expenditure Per Capita':
        countKey = 'capexPerCapita';
        break;
      case 'Revenue Per Capita':
      case 'Own Revenue per Capita':
        countKey = 'revenuePerCapita';
        break;
      case 'Total Surplus/Deficit':
        countKey = 'deficitOrSurplus';
        break;
    }

    if (this.stateServiceLabel) {
      countKey = 'value';
    }

    const { labels, values } = data.reduce(
      (acc: { labels: any[]; values: any[] }, item: any) => {
        // console.log('item', item, 'countKey', countKey, 'item[countKey]', item[countKey]);
        const value = item[countKey]; // 🔹 dynamic key
        let sumCr = Math.round(value); // per capita
        if (!this.stateServiceLabel && !countKey.includes('PerCapita')) {
          this.isDataInCrore = true;
          sumCr = value > 0 ? Math.round(value / 10000000) : 0;
        } else {
          this.isDataInCrore = false;
        }
        acc.labels.push(item.ulbName);
        acc.values.push(sumCr);
        return acc;
      },
      { labels: [], values: [] }
    );

    // console.log('labels', labels);
    // console.log('values---', values);
    const options = baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Cities', `Amount ${this.isDataInCrore ? '(in Cr.)' : '(in INR)'}`);
    options.plugins!.legend!.display = false;
    let config: ChartConfig = {
      chartId: 'populationChart',
      chartType: 'barChart',
      labels,
      datasets: [
        {
          type: 'bar',
          label: this.isDataInCrore ? 'CR' : 'INR',
          data: values,
          backgroundColor: '#1E44AD',
          barThickness: 50,
          // borderRadius: 5
        }],
      options
      // options: {
      //   plugins: {
      //     legend: {
      //       display: false
      //     }
      //   }

      // }
      // options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Cities', 'Amount in ₹ Cr')
    };
    this.barChart.set(config);
  }

  updateScatterChartData(data: any): void {
    const scatterData = this.chartService.setScatterData(data, this.subButton(), this.stateServiceLabel, this.compareCategory);

    const options = baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Population(in Thousands)', `Total Revenue ${this.isDataInCrore ? '(in Cr.)' : ''}`);
    options.plugins!.legend!.labels!.usePointStyle = true;
    options.plugins!.legend!.labels!.padding = 20;
    options.plugins!.legend!.position = 'bottom';

    let config: ChartConfig = {
      chartId: 'scatterChart0',
      chartType: 'scatterChart',
      datasets: scatterData,
      options
      // options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Population(in Thousands)', 'Total Revenue (in Cr.)')
    }
    this.scatterChart.set(config);
  }

  getTabType() {
    let findTabType = this.activeButtonList.find((tabName: any) => tabName.name == this.subButton());
    return findTabType ? findTabType.code : '';
  }

  getFilterName() {
    if (this.stateServiceLabel) {
      // return this.serviceTab;
      return this.filterName;
    } else {
      let newName = this.subButton().toLocaleLowerCase();
      let filterName = 'revenue';

      if (newName?.includes("mix")) {
        filterName = newName;
      } else if (newName?.includes("revenue") && !newName?.includes("own")) {
        filterName = "revenue";
      } else if (newName?.includes("own") && newName?.includes("revenue")) {
        filterName = newName;
      } else {
        filterName = newName;
      }
      return filterName;
    }
  }

  //  changeActiveBtn(i) {

  // }
  onChangeFilterName() {
    // this.filterName = event.target.value;
    this.getRevenueChart();
  }

  getSortBy() {
    if (this.stateServiceLabel) {
      return this.sortBy === 'top' ? 'top10' : 'bottom10'
    }
    return this.sortBy;
  }
  onChangeLinteItem(event: any) {
    this.code = event.target.value;
    // console.log('this.code', this.code);
    this.getPopulationChart();
  }
  getPopulationChart(sortBy = 'top', csv: boolean = false) {
    this.sortBy = sortBy;
    this.isBarChartLoading.set(true);
    const payload: {
      chartType: string;
      stateId: string;
      financialYear: any;
      activeButton: string;
      tabType: string;
      csv?: boolean;
      sortBy: string;
      filterName: string;
      code?: string;
    } = {
      chartType: 'bar',
      tabType: this.getTabType(),
      financialYear: this.selectedLedgerYear(),
      stateId: this.stateIdSignal(),
      activeButton: this.subButton(),
      sortBy: this.getSortBy(),
      filterName: this.filterName,
      // code: this.code ? this.code.join(',') : undefined
      code: this.code
    };

    // let p = {
    //   "financialYear": "2019-20",
    //   "stateId": "5dcf9d7416a06aed41c748f0",
    //   "sortBy": "top10",
    //   "filterName": "Extent of non-revenue water (NRW)",
    //   "apiEndPoint": "state-slb",
    //   "apiMethod": "get", "chartType": "bar",
    //   "stateServiceLabel": true,
    //   "chartTitle": "Top 10 performing ULBs on Extent Of Non-revenue Water (nrw) in Maharashtra"
    // }

    if (csv) payload['csv'] = true;
    else if ('csv' in payload) delete payload['csv'];
    let subscribe;
    if (this.stateServiceLabel) {
      subscribe = this.dashboardService.getSlbPopulation(payload);
    } else {
      subscribe = this.dashboardService.getStatePopulation(payload);
    }

    return subscribe.subscribe({
      next: (res) => {
        let data = [];
        if (this.stateServiceLabel) {
          data = res.data.scatterData.tenData
        } else {
          data = res.data;
        }
        if (csv) {
          this.commonService.downloadExcel(res, this.currentSelectedButton().label);
        } else {
          this.updateBarChartData(data);
        }
        this.isBarChartLoading.set(false);

      }, error: (err) => {
        this.isBarChartLoading.set(false);
        console.error(err);
      }
    });
  }

  // getSlb(chartType = 'scatter', sortBy = 'top10') {
  //   const params = {
  //     stateId: this.stateIdSignal(),
  //     financialYear: this.selectedLedgerYear(),
  //     headOfAccount: this.currentSelectedButtonKey(),
  //     filterName: this.getFilterName(),
  //     'chartType': chartType,
  //     'isPerCapita': '',
  //     'compareType': '',
  //     'compareCategory': '',
  //     ulb: this.dialogResult?.compareUlbs || [],
  //     sortBy,
  //     // 'ulb': this.dialogResult.ulbId,
  //   };
  //   // console.log('this.dialogResult', this.dialogResult)
  //   const apiEndpoint = this.tabName() === 'Financial Indicators' ? 'state-revenue' : 'state-slb';
  //   // const apiEndpoint = 'state-revenue';
  //   return this.dashboardService.getStateRevenue(params, apiEndpoint).subscribe({
  //     next: (res) => {
  //       console.log('res', res);
  //       // this.updateScatterChartData(res.data);
  //       this.isChartLoading.set(false);
  //     }, error: (err) => {
  //       this.isChartLoading.set(false);
  //       console.error(err);
  //     }
  //   });
  // }

  onSelectCompareType(type: string) {
    this.compareType = type;
    this.getRevenueChart();
  }
  getPerCapita() {
    this.isPerCapita = this.subButton().toLocaleLowerCase().split(" ").join("").includes('percapita');
    return this.isPerCapita;
  }
  getRevenueChart() {
    this.isChartLoading.set(true);
    const params = {
      state: this.stateIdSignal(),
      stateId: this.stateIdSignal(),
      financialYear: this.selectedLedgerYear(),
      headOfAccount: this.currentSelectedButtonKey(),
      filterName: this.getFilterName(),
      chartType: this.chartType, // 'scatter',
      isPerCapita: this.getPerCapita(),
      compareType: this.compareType,
      compareCategory: this.compareCategory,
      which: this.compareCategory,
      // ulb: this.dialogResult?.compareUlbs || []
      ulb: this.compareUlbs,
      // 'ulb': this.dialogResult.ulbId,
    };

    let apiEndpoint = 'state-slb';

    // console.log('this.dialogResult', this.dialogResult)
    if (this.tabName() === 'Financial Indicators') {
      apiEndpoint = 'state-revenue';
      if (this.compareCategory) {
        params.isPerCapita = true;
        apiEndpoint = 'state-dashboard-averages';
      }

    }

    // const apiEndpoint = 'state-revenue';
    return this.dashboardService.getStateRevenue(params, apiEndpoint).subscribe({
      next: (res) => {
        if (this.isMixBtn) {
          this.responseData = res.data;
          this.code = this.responseData[0].code.length ? this.responseData[0].code.join(',') : undefined;
          this.getPopulationChart();
          // this.updateDoughnutChartData(res.data);
        } else {
          this.updateScatterChartData(res.data);
        }
        this.isChartLoading.set(false);
      }, error: (err) => {
        this.isChartLoading.set(false);
        console.error(err);
      }
    });
  }


  // getAverageScatterData() {
  //   const tabType = this.getTabType();
  //   this.multiChart = false;
  //   this._loaderService.showLoader();

  //   // this.initializeScatterData();
  //   let apiEndPoint = "state-dashboard-averages";

  //   this.scatterChartPayload = {
  //     state: this.stateId,
  //     financialYear: this.financialYear ? this.financialYear : "",
  //     headOfAccount: this.stateServiceLabel ? undefined : this.headOfAccount,
  //     filterName: this.filterName ? this.filterName : "",
  //     isPerCapita: this.isPerCapita ? this.isPerCapita : "",
  //     compareType: this.compType ? this.compType : "",
  //     compareCategory: this.selectedRadioBtnValue
  //       ? this.selectedRadioBtnValue
  //       : "",
  //     ulb: this.ulbId ? [this.ulbId] : this.ulbArr ? this.ulbArr : "",
  //     chartType: !this.filterName.includes("mix") ? "scatter" : "doughnut",
  //     apiEndPoint: apiEndPoint,
  //     apiMethod: "post",
  //     stateServiceLabel: this.stateServiceLabel,
  //     sortBy: "",
  //     chartTitle: "",
  //     which: this.selectedRadioBtnValue ? this.selectedRadioBtnValue : "",
  //     TabType: tabType ? tabType?.code : "",
  //   };

  //   if (this.selectedRadioBtnValue == "nationalAvg") {
  //     this.scatterData.data.datasets.push(
  //       this.stateFilterDataService.nationLevelScatterDataSet
  //     );
  //   }
  //   console.log("scatterChartPayload", this.scatterChartPayload);

  //   this.stateFilterDataService
  //     .getAvgScatterdData(this.scatterChartPayload, apiEndPoint)
  //     .subscribe(
  //       (res) => {
  //         this.notfound = false;
  //         console.log("response data", res);
  //         //scatter plots center

  //         if (!this.filterName.includes("mix")) {
  //           this._loaderService.stopLoader();
  //           this.notfound = false;
  //           // if (this.selectedRadioBtnValue == "populationAvg") {
  //           //   this.scatterData = this.stateFilterDataService.populationWiseScatterData(res['data']);
  //           //   console.log(this.scatterData);
  //           // } else {
  //           let scatterChartObj: any = {
  //             // cluster of ULBs under these 3 categories
  //             mCorporation:
  //               res["data"] && res["data"]["mCorporation"]
  //                 ? res["data"]["mCorporation"]
  //                 : [],
  //             municipality:
  //               res["data"] && res["data"]["municipality"]
  //                 ? res["data"]["municipality"]
  //                 : [],
  //             townPanchayat:
  //               res["data"] && res["data"]["townPanchayat"]
  //                 ? res["data"]["townPanchayat"]
  //                 : [],
  //             // average of ULBs, state, national
  //             mCorporationAvg:
  //               res["data"] && res["data"]["Municipal Corporation"]
  //                 ? parseFloat(res["data"]["Municipal Corporation"])
  //                 : 0,
  //             municipalityAvg:
  //               res["data"] && res["data"]["Municipality"]
  //                 ? parseFloat(res["data"]["Municipality"])
  //                 : 0,
  //             townPanchayatAvg:
  //               res["data"] && res["data"]["Town Panchayat"]
  //                 ? parseFloat(res["data"]["Town Panchayat"])
  //                 : 0,
  //             stateAvg:
  //               res["data"] && res["data"]["stateAvg"]
  //                 ? parseFloat(res["data"]["stateAvg"])
  //                 : 0,
  //             nationalAvg:
  //               res["data"] && res["data"]["national"]
  //                 ? parseFloat(res["data"]["national"])
  //                 : 0,
  //             // average of population under these categories
  //             lessThan100k:
  //               res["data"] && res["data"]["< 100 Thousand"]
  //                 ? parseFloat(res["data"]["< 100 Thousand"])
  //                 : 0,
  //             bwt100kTo500k:
  //               res["data"] && res["data"]["100 Thousand - 500 Thousand"]
  //                 ? parseFloat(res["data"]["100 Thousand - 500 Thousand"])
  //                 : 0,
  //             bwt500kTo1m:
  //               res["data"] && res["data"]["500 Thousand - 1 Million"]
  //                 ? parseFloat(res["data"]["500 Thousand - 1 Million"])
  //                 : 0,
  //             bwt1mTo4m:
  //               res["data"] && res["data"]["1 Million - 4 Million"]
  //                 ? parseFloat(res["data"]["1 Million - 4 Million"])
  //                 : 0,
  //             greaterThan4m:
  //               res["data"] && res["data"]["4 Million+"]
  //                 ? parseFloat(res["data"]["4 Million+"])
  //                 : 0,
  //           };
  //           scatterChartObj["stateLevelMaxPopuCount"] =
  //             this.stateFilterDataService.getMaximumPopulationCount(
  //               scatterChartObj?.mCorporation,
  //               scatterChartObj?.townPanchayat,
  //               scatterChartObj?.municipality
  //             );

  //           this.scatterData = this.stateFilterDataService.plotScatterChart(
  //             scatterChartObj,
  //             this.selectedRadioBtnValue
  //           );

  //           console.log(this.scatterData);
  //           this.generateRandomId("scatterChartId123");
  //           // }
  //         }
  //       },
  //       (err:any) => {
  //         console.log(err.message);
  //       }
  //     );
  // }

  getChartData(): void {
    this.getRevenueChart();
    // if (!this.stateServiceLabel && !this.subButton().includes('Mix')) {
    if (!this.isMixBtn) {
      this.getPopulationChart();
    }
    // forkJoin({
    //   revenue: this.getRevenueChart(),
    //   population: this.getPopulationChart()
    // }).subscribe({
    //   next: ({ revenue, population }) => {
    //     this.isChartLoading.set(false);
    //     this.updateScatterChartData(revenue.data);
    //     this.updateBarChartData(population.data);
    //   },
    //   error: (err) => {
    //     this.isChartLoading.set(false);
    //     console.error(err);
    //   }
    // });
  }

  // Open compare by dialog 
  openCompareByDialog() {
    if (isPlatformServer(this.platformId)) return;

    const dialogRef = this.dialog.open(CompareByDialog, {
      width: '700px',
      maxWidth: '70vw',
      // data: { ulbType: this.ulbType(), compareUlbsFromParent: this.compareUlbsFromPopup, compareType: this.compareTypeFromPopup }
      data: { ulbType: '', stateId: this.stateDetails().state._id }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        // this.dialogResult = result;
        this.compareUlbs = result.compareUlbs;
        if (result) this.getChartData();
      });
  }

  takeAction(selectedIcon: string) {
    this.isChartDownloading.set(true);

    if (selectedIcon === 'Download') {
      setTimeout(() => {
        const chartElement = document.getElementById('chartContainer');
        if (!chartElement) return;

        const mainBtn = this.getLabelByKey(this.buttons, this.currentSelectedButtonKey());
        // const subBtn = this.getLabelByKey(this.subButtons[this.currentSelectedButtonKey()].buttons, this.subButton());
        const subBtn = this.getLabelByKey(this.currentSelectedButton().subButtons.buttons, this.subButton());
        const imgName = `${mainBtn}_${subBtn}.png`;
        const chartContainer = document.getElementById('chartContainer');
        const elementsToHide = chartContainer?.querySelectorAll('.hide-while-download');

        // Hide elements
        elementsToHide?.forEach(el => {
          (el as HTMLElement).style.visibility = 'hidden';
        });

        if (!chartContainer) return;

        html2canvas(chartContainer).then(canvas => {
          // Re-show hidden elements
          elementsToHide?.forEach(el => {
            (el as HTMLElement).style.visibility = 'visible';
          });

          // Save the image
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = imgName;
          link.click();

          this.isChartDownloading.set(false);
        }).catch(err => {
          // Restore elements in case of error
          elementsToHide?.forEach(el => {
            (el as HTMLElement).style.visibility = 'visible';
          });
          console.error('Error capturing chart:', err);
          this.isChartDownloading.set(false);
        });
      }, 0);

    }
  }

  downloadData() {
    this.getPopulationChart('top', true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stateIdChangeEffect.destroy();
  }
}

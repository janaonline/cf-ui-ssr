import { isPlatformBrowser, isPlatformServer, TitleCasePipe } from '@angular/common';
import { Component, computed, effect, inject, Inject, input, PLATFORM_ID, signal } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from '@angular/material/tooltip';
import html2canvas from 'html2canvas';
import { Subject, takeUntil } from 'rxjs';
import { ButtonObj, IFinancialIndicatorInfo, IFinancialIndicatorsChart, LineItemType } from '../../../../core/models/interfaces';
import { IULB } from '../../../../core/models/ulb';
import { CommonService } from '../../../../core/services/common.service';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../shared/components/charts/constants';
import { CitySearch } from "../../../../shared/components/city-search/city-search";
import { NoDataFound } from "../../../../shared/components/no-data-found/no-data-found";
import { PreLoader } from '../../../../shared/components/pre-loader/pre-loader';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { compraeByOptions, IndicatorDetails } from '../../city/financial-indicator/constants';
import { DashboardService } from '../../dashboard-service';
import { ChartService } from './chart-service';
import { CompareByDialog } from './compare-by-dialog/compare-by-dialog';
import { stateDashboardSubTabsList } from './constant';
import { MixChart } from "./mix-chart/mix-chart";
import { PopulationTable } from "./population-table/population-table";

@Component({
  selector: 'app-financial-indicator',
  imports: [Charts,
    // MaterialModule,
    TitleCasePipe,
    FormsModule, MatFormFieldModule, MatTooltipModule,
    TabButtons, PreLoader, CitySearch, PopulationTable, MixChart, MatSelectModule, NoDataFound],
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
  readonly stateDetails = input.required<any>();
  readonly dashboardTabData = input.required<any>();
  readonly tabName = input.required<any>();
  selectedLedgerYear = signal('');

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
  stateServiceLabel: any = false;
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
  subButtonIdx = signal(0);
  isDataInCrore: boolean = false;
  isMixBtn = false;
  code: any;
  compareTypeList: any[] = [];
  compareUlbsObj: any;
  mixChartObj: { key: string; label: string; }[] = [];
  ulbObj = signal<IULB | undefined>(undefined);
  isPercentage: boolean = false;
  barDataNotFound: boolean = false;

  constructor(
    private commonService: CommonService,
    private dashboardService: DashboardService,
    private chartService: ChartService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit() {
    if (this.tabName() === 'Service Level Benchmark') {
      this.stateServiceLabel = true;
    }

    this.yearList.set(this.years());
    this.selectedLedgerYear.set(this.years()[1]);
    this.getCurrentBtn();
    this.stateIdSignal.set(this.stateDetails().state._id);
    this.mixChartObj.push({ key: 'state', label: this.stateDetails().state.name });

    // this.myForm = this.fb.group({ year: [this.years()[0]] });

    this.isLoading.set(false);

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
      //  console.log("Fetching for subButton:", this.subButton());
      this.lastSubButtonValue = this.subButton();
      this.getChartData();
    }
  })

  resetFilter(callApi: boolean = true) {
    this.selectedLedgerYear.set(this.years()[1]);
    this.ulbObj.set(undefined);
    this.compareUlbs = [];
    this.compareCategory = '';
    this.compareType = '';
    if (this.mixChartObj.length > 1) this.mixChartObj.pop();
    if (callApi) {
      this.getChartData();
    }
    // this.getChartData();
  }

  onYearChange(event: any) {
    this.getChartData();
  }

  onChangeCategory(event: any) {
    this.getRevenueChart();
  }

  onUlbSelect(ulbObj: any) {
    this.ulbObj.set(ulbObj);
    this.compareUlbs.push(ulbObj._id);
    this.mixChartObj.push({ key: 'ulb', label: ulbObj.name });
    this.getRevenueChart();
  }

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    // console.log('Selected Button Key11:', key);
    this.resetFilter(false);
    this.currentSelectedButtonKey.set(key as LineItemType);
    // console.log('Selected Button Key:', this.currentSelectedButtonKey());
    this.getCurrentBtn();
    const firstSubButtonKey = this.currentSelectedButton()?.subButtons?.buttons?.[0]?.key;
    // console.log('First sub button of selected parent:', firstSubButtonKey);
    if (firstSubButtonKey) {
    this.onSelectedSubButtonChange(firstSubButtonKey);
    this.subButtonIdx.set(0);
    }
    // console.log('Current Selected Button after button change:', this.currentSelectedButton().subButtons.buttons[0].key);
    if (this.stateServiceLabel) {
      this.getServiceDropDown();
    }
  }

  getSLBBtn() {
    const btn = this.currentSelectedButton().label;
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
    console.log('Current Selected Button:', this.currentSelectedButton());
  }

  // Output emitted by child to parent
  onSelectedSubButtonChange(key: string): void {

    // console.log('Selected Sub Button Key22:', key);
    this.resetFilter(false);
    this.isMixBtn = key.includes('Mix');
    this.subButton.set(key);
    this
    console.log('Current Sub Button33:', this.subButton()); 
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
  // private getcalcType(): CalcType {
  //   const subBtn = this.subButton();

  //   if (['totRev', 'totOwnRev', 'totRevex', 'capex',].includes(subBtn)) return 'total';
  //   else if (['revPerCapita', 'ownRevPerCapita', 'revexPerCapita', 'capexPerCapita',].includes(subBtn)) return 'perCapita';
  //   // else if (['revMix', 'ownRevMix', 'revexMix'].includes(subBtn)) return 'mix';
  //   return 'mix';
  // }

  getLabel(data: any, label: string) {
    if (this.stateServiceLabel) {
      label = `${(data).toLocaleString()} ${this.isPercentage ? '%' : ''}`;
    } else {
      label = `₹ ${(data).toLocaleString()} ${label}`;
    }
    return label;
  }

  updateBarChartData(data: any, unitType: string = 'Percent'): void {
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

    const yAxisLabel = this.stateServiceLabel ? unitType : `Amount ${this.isDataInCrore ? '(in Cr.)' : '(in INR)'}`;
    const options = JSON.parse(JSON.stringify(baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Cities', yAxisLabel)));

    options.plugins!.legend!.display = false;
    options.plugins!.datalabels!.display = true;
    options.plugins!.datalabels!.formatter = (value: any, ctx: any) => {
      const label = this.isDataInCrore ? 'Cr' : '';
      return this.getLabel(value, label);
    }
    options.plugins!.tooltip!.callbacks = {
      label: (tooltipItem: any) => {
        let label = tooltipItem.dataset.label || '';
        return this.getLabel(tooltipItem.parsed.y, label);
      }
    };

    let config: ChartConfig = {
      chartId: 'populationChart',
      chartType: 'barChart',
      labels,
      datasets: [
        {
          type: 'bar',
          label: this.isDataInCrore ? 'Cr' : '',
          data: values,
          backgroundColor: '#1E44AD',
          barThickness: 50,
          // borderRadius: 5
        }],
      options
    };
    this.barChart.set(config);
  }

  updateScatterChartData(data: any): void {
    let config: any = this.chartService.setScatterConfig(data, this.subButton(), this.stateServiceLabel, this.compareCategory);
    this.scatterChart.set(config);
  }

  getTabType() {
    let findTabType = this.activeButtonList.find((tabName: any) => tabName.name == this.subButton());
    return findTabType ? findTabType.code : '';
  }

  getFilterName() {
    if (this.stateServiceLabel) {
      this.stateServiceLabel = this.filterName;
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

  onChangeFilterName() {
    this.getChartData();
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
        let unitType = 'Percent';
        if (this.stateServiceLabel) {
          data = res.data.scatterData.tenData
          unitType = res.data.scatterData.unitType || 'Percent';
          this.isPercentage = unitType === 'Percent';
        } else {
          data = res.data;
        }
        if (csv) {
          const fileName = `CityFinance_${this.stateDetails().state.name}_${this.currentSelectedButton().label}`;
          this.commonService.downloadExcel(res, fileName);
        } else {
          this.barDataNotFound = data.length === 0;
          this.updateBarChartData(data, unitType);
        }
        this.isBarChartLoading.set(false);

      }, error: (err) => {
        this.barDataNotFound = true;
        this.isBarChartLoading.set(false);
        console.error(err);
      }
    });
  }

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
    const params: any = {
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
      stateServiceLabel: this.stateServiceLabel,
      // ulb: this.dialogResult?.compareUlbs || []
      ulb: this.compareUlbs,
      TabType: this.getTabType(),
      // 'ulb': this.dialogResult.ulbId,
    };

    let apiEndpoint = 'state-slb';

    // console.log('this.dialogResult', this.dialogResult)
    if (this.tabName() === 'Financial Indicators') {
      apiEndpoint = 'state-revenue';
      if (this.compareCategory) {
        params.isPerCapita = params.isPerCapita || '';
        delete params['stateId'];
        // params["TabType"] = "TotalRevenue";
        apiEndpoint = 'state-dashboard-averages';
      }
    }

    return this.dashboardService.getStateRevenue(params, apiEndpoint).subscribe({
      next: (res) => {
        if (this.isMixBtn) {
          if (this.compareType) { // if compareType is selected
            this.responseData = res.data;
            // const firstKey = Object.keys(this.responseData)[0];
            const firstKey = 'state'; // default to state if compareType is not set
            const firstObj = this.responseData[firstKey];
            this.compareTypeList = firstObj;
          } else {
            if (this.mixChartObj.length === 2) { // if state and ulb are selected
              this.responseData = res;
              this.compareTypeList = this.responseData.state;
            } else {
              this.responseData = res.data;
              this.compareTypeList = this.responseData;
            }
          }
          // console.log('compareTypeList', this.compareTypeList);
          if (this.compareTypeList[0].code) {
            this.code = Array.isArray(this.compareTypeList[0].code) ? this.compareTypeList[0].code.join(',') : this.compareTypeList[0].code;
          }
          this.getPopulationChart();
          // this.updateDoughnutChartData(res.data);
        } else {
          this.updateScatterChartData(res.data);
        }
        this.isChartLoading.set(false);
      }, error: (err) => {
        this.updateScatterChartData(false);
        this.isChartLoading.set(false);
        console.error(err);
      }
    });
  }

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
      data: {
        ulbType: '', stateId: this.stateDetails().state._id, compareUlbsObj: this.compareUlbsObj,
        compareUlbs: this.compareUlbs,
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        // console.log('Dialog result:', result);
        // this.dialogResult = result;
        this.compareUlbs = result.compareUlbs;
        this.compareUlbsObj = result.compareUlbsObj;
        if (result) this.getChartData();
      });
  }

  takeAction(selectedIcon: string, containerId: string) {
    this.isChartDownloading.set(true);

    if (selectedIcon === 'Download') {
      setTimeout(() => {
        const chartElement = document.getElementById(containerId);
        if (!chartElement) return;

        // const mainBtn = this.getLabelByKey(this.buttons, this.currentSelectedButtonKey());
        // const subBtn = this.getLabelByKey(this.subButtons[this.currentSelectedButtonKey()].buttons, this.subButton());
        // const subBtn = this.getLabelByKey(this.currentSelectedButton().subButtons.buttons, this.subButton());
        const imgName = `${this.currentSelectedButton().label}_${this.selectedLedgerYear()}_${this.stateDetails().state.name} Chart.png`;
        const chartContainer = chartElement;
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

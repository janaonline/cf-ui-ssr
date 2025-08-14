import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, computed, effect, inject, Inject, input, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

@Component({
  selector: 'app-financial-indicator',
  imports: [NoDataFound, Charts, MaterialModule, TabButtons, PreLoader, CitySearch, PopulationTable, MixChart],
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
  serviceTabList: string[] = [];
  stateServiceLabel: boolean = false;
  serviceTab: string = '';
  filterName: string = '';

  responseData: any;
  compareType = '';
  chartType = 'scatter';
  compareUlbs = [];

  compareTypeButtons = signal<ButtonObj[]>([
    { label: 'State Average', key: '' },
    { label: 'Population Category', key: 'popType' },
    { label: 'ULB Type', key: 'ulbType' },
  ]);

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private chartService: ChartService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit() {
    if (this.tabName() === 'Service Level Benchmark') {
      this.stateServiceLabel = true;
      // this.getServiceDropDown();
    }
    this.getCurrentBtn();
    this.stateIdSignal.set(this.stateDetails().state._id);
    this.selectedLedgerYear.set(this.years()[0])

    this.myForm = this.fb.group({ year: [this.years()[0]] });

    this.selectedLedgerYear.set(this.years()[0]);
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
    console.log('event---', event.target.value)
    this.selectedLedgerYear.set(event.target.value);
    this.getChartData();
  }
  onUlbSelect(ulbObj: any) {
    console.log('event---', ulbObj)
    this.ulbIdSignal.set(ulbObj._id);
    this.getChartData();
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
        this.serviceTabList = res?.data?.names;
        this.filterName = this.serviceTabList[0];
        // this.getChartData();
        this.getRevenueChart();
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

  // Get selected button(s) label.
  // buttonType(): string {
  //   // return this.getLabelByKey(this.buttons, this.currentSelectedButtonKey()) || 'Revenue';
  //   const subBtnArr = this.subButtons[this.currentSelectedButtonKey()].buttons;
  //   return this.getLabelByKey(subBtnArr, this.subButton()) || 'Total Revenue';
  // }

  // Return selected year.
  private getYear() {
    // return this.myForm.get('year')?.value;
    return this.selectedLedgerYear();
  }

  // Get calcType based on sub button selected.
  private getcalcType(): CalcType {
    const subBtn = this.subButton();

    if (['totRev', 'totOwnRev', 'totRevex', 'capex',].includes(subBtn)) return 'total';
    else if (['revPerCapita', 'ownRevPerCapita', 'revexPerCapita', 'capexPerCapita',].includes(subBtn)) return 'perCapita';
    // else if (['revMix', 'ownRevMix', 'revexMix'].includes(subBtn)) return 'mix';
    return 'mix';
  }

  // Displayed above graph.
  getCompType() {
    const compType = this.dialogResult?.compareType || 'state';
    // if (compType === 'ulbs') return 'Selected ULB(s)'
    // return this.getLabelByKey(compraeByOptions(this.ulbType()), compType);
  }

  updateBarChartData(data: any): void {

    const { labels, values } = data.reduce((acc: { labels: any[]; values: any[]; }, { ulbName, sum }: any) => {
      // const sumRs = "INR " + (sum > 0 ? Math.round(sum / 10000000) : "0") + " Cr";
      const sumCr = (sum > 0 ? Math.round(sum / 10000000) : "0");
      acc.labels.push(ulbName);
      acc.values.push(sumCr);
      return acc;
    }, { labels: [], values: [] });
    const options = baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Cities', 'Amount in ₹ Cr');
    options.plugins!.legend!.display = false;
    let config: ChartConfig = {
      chartId: 'populationChart',
      chartType: 'barChart',
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'CR',
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
    const scatterData = this.chartService.setScatterData(data);
    const options = baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Population(in Thousands)', 'Total Revenue (in Cr.)');
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
  getPopulationChart(sortBy = 'top') {
    this.sortBy = sortBy;
    this.isBarChartLoading.set(true);
    const payload = {
      chartType: 'scatter',
      tabType: this.getTabType(),
      financialYear: this.getYear(),
      stateId: this.stateIdSignal(),
      sortBy,
      activeButton: this.subButton(),
    }
    return this.dashboardService.getStatePopulation(payload).subscribe({
      next: (res) => {
        this.updateBarChartData(res.data);
        this.isBarChartLoading.set(false);
      }, error: (err) => {
        this.isBarChartLoading.set(false);
        console.error(err);
      }
    });
  }

  getSlb(chartType = 'scatter', sortBy = 'top10') {
    const params = {
      stateId: this.stateIdSignal(),
      financialYear: this.getYear(),
      headOfAccount: this.currentSelectedButtonKey(),
      filterName: this.getFilterName(),
      'chartType': chartType,
      'isPerCapita': '',
      'compareType': '',
      'compareCategory': '',
      ulb: this.dialogResult?.compareUlbs || [],
      sortBy,
      // 'ulb': this.dialogResult.ulbId,
    };
    // console.log('this.dialogResult', this.dialogResult)
    const apiEndpoint = this.tabName() === 'Financial Indicators' ? 'state-revenue' : 'state-slb';
    // const apiEndpoint = 'state-revenue';
    return this.dashboardService.getStateRevenue(params, apiEndpoint).subscribe({
      next: (res) => {
        console.log('res', res);
        // this.updateScatterChartData(res.data);
        this.isChartLoading.set(false);
      }, error: (err) => {
        this.isChartLoading.set(false);
        console.error(err);
      }
    });
  }
  onSelectCompareType(type: string) {
    this.compareType = type;
    this.getRevenueChart();
  }
  getRevenueChart() {
    this.isChartLoading.set(true);
    const params = {
      state: this.stateIdSignal(),
      stateId: this.stateIdSignal(),
      financialYear: this.getYear(),
      headOfAccount: this.currentSelectedButtonKey(),
      filterName: this.getFilterName(),
      chartType: this.chartType, // 'scatter',
      'isPerCapita': '',
      compareType: this.compareType,
      'compareCategory': '',
      ulb: this.dialogResult?.compareUlbs || []
      // 'ulb': this.dialogResult.ulbId,
    };
    // console.log('this.dialogResult', this.dialogResult)
    const apiEndpoint = this.tabName() === 'Financial Indicators' ? 'state-revenue' : 'state-slb';
    // const apiEndpoint = 'state-revenue';
    return this.dashboardService.getStateRevenue(params, apiEndpoint).subscribe({
      next: (res) => {
        if (this.subButton().includes('Mix')) {
          this.responseData = res.data;
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

  getChartData(): void {
    this.getRevenueChart();
    if (!this.stateServiceLabel && !this.subButton().includes('Mix')) {
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
        this.dialogResult = result;

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stateIdChangeEffect.destroy();
  }
}

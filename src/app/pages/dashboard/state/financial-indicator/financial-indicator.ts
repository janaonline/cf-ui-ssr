import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, computed, effect, inject, Inject, Input, input, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ButtonObj, CalcType, IFinancialIndicatorInfo, IFinancialIndicatorsChart, LineItemType } from '../../../../core/models/interfaces';
import { IULB } from '../../../../core/models/ulb';
import { MaterialModule } from '../../../../material.module';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../shared/components/charts/constants';
import { NoDataFound } from '../../../../shared/components/no-data-found/no-data-found';
import { PreLoader } from '../../../../shared/components/pre-loader/pre-loader';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { CompareByDialog } from './compare-by-dialog/compare-by-dialog';
import { compraeByOptions, IndicatorDetails } from '../../city/financial-indicator/constants';
import { DashboardService } from '../../dashboard-service';
import { ChartService } from './chart-service';
import { stateDashboardSubTabsList } from './constant';

@Component({
  selector: 'app-financial-indicator',
  imports: [NoDataFound,
    Charts,
    MaterialModule,
    TabButtons,
    PreLoader,],
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
  readonly selectedLedgerYear = input.required<string>();
  // @Input() tabName = 'Financial Indicators';

  currentSelectedButtonKey = signal<string>('Revenue');
  subButton = signal<string>('');
  currentSelectedButton: any = signal<any>({});

  myForm!: FormGroup;
  years = signal<string[]>([]);

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
  stateUlbsPopulation = signal<any>({});

  objectKeys = Object.keys;
  // dashboardTabData: any = {};

  activeButtonList: any = stateDashboardSubTabsList;
  isBarChartLoading = signal(false);
  sortBy: string = 'top';

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private chartService: ChartService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit() {
    console.log('dashboardTabData:', this.dashboardTabData());
    console.log('tabName:', this.tabName());
    this.getCurrentBtn();
    // this.setButtons();
    // console.log('Buttons:', this.buttons);
    // console.log('Sub Buttons:', this.subButtons);
    // this.subButtons = this.dashboardTabData()[0].subButtons;
    this.stateIdSignal.set(this.stateDetails().state._id);
    this.years.set(this.stateDetails().yearsList);

    this.myForm = this.fb.group({ year: [this.years()[1]] });
    this.isLoading.set(false);

    this.myForm.get('year')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.getChartData()
      })
    this.getStateGroupPopulation();

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

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    this.currentSelectedButtonKey.set(key as LineItemType);
    this.getCurrentBtn();
    if (this.tabName() === 'Service Level Benchmark') {
      this.getChartData();
    }
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
    return this.myForm.get('year')?.value;
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

  //  changeActiveBtn(i) {

  // }
  getPopulationChart(sortBy = 'top') {
    this.sortBy = sortBy;
    this.isBarChartLoading.set(true);
    const payload = {
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
  getRevenueChart() {
    this.isChartLoading.set(true);
    const params = {
      state: this.stateIdSignal(),
      financialYear: this.getYear(),
      headOfAccount: this.currentSelectedButtonKey(),
      filterName: this.getFilterName(),
      'chartType': 'scatter',
      'isPerCapita': '',
      'compareType': '',
      'compareCategory': '',
      ulb: this.dialogResult?.compareUlbs || []
      // 'ulb': this.dialogResult.ulbId,
    };
    // console.log('this.dialogResult', this.dialogResult)
    const apiEndpoint = this.tabName() === 'Financial Indicators' ? 'state-revenue' : 'state-slb';
    // const apiEndpoint = 'state-revenue';
    return this.dashboardService.getStateRevenue(params, apiEndpoint).subscribe({
      next: (res) => {
        this.updateScatterChartData(res.data);
        this.isChartLoading.set(false);
      }, error: (err) => {
        this.isChartLoading.set(false);
        console.error(err);
      }
    });
  }
  getChartData(): void {
    this.getRevenueChart();
    if (this.tabName() !== 'Service Level Benchmark') {
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

  getStateGroupPopulation() {
    const params = {
      stateId: this.stateIdSignal(),
    };
    this.dashboardService.getStateGroupPopulation(params).subscribe({
      next: (res: any) => {
        if (res["data"]?.length) {
          this.stateUlbsPopulation.set(res["data"][0]);
        }
      },
      error: (error: Error) => {
        console.error('Failed to get state group population data', error);
      }
    });
  }
  // Helper: Consolidate all the data - payload/ body for the API.
  // private createBodyStructure(): IFinancialIndicatorsChart {
  //   const { compareType = 'state', calcType = this.getcalcType(), compareUlbs = [], compareUlbsObj } = this.dialogResult ?? {};
  //   this.compareUlbsFromPopup = compareUlbsObj;
  //   this.compareTypeFromPopup = compareType;

  //   // If 'mix' then only one year data has to be fetched.
  //   const body: IFinancialIndicatorsChart = {
  //     years: this.getcalcType() === 'mix' ? [this.getYear()] : this.createYearsArr(),
  //     compareType,
  //     stateId: this.stateIdSignal(),
  //     lineItem: untracked(() => this.currentSelectedButtonKey()),
  //     calcType,
  //     compareUlbs
  //   };

  //   return body;
  // }

  // Helper: Based on current year selected create years array with T, T-2, T-1.
  private createYearsArr(): string[] {
    const yearStr: string = this.myForm.get('year')?.value;

    if (!yearStr || !/^\d{4}-\d{2}$/.test(yearStr)) {
      // console.warn('Invalid year format. Expected format: YYYY-YY');
      return [];
    }

    const endYear = parseInt(yearStr.slice(0, 4), 10);

    const minYear = 2015;
    const years: string[] = [];

    for (let i = 2; i >= 0; i--) {
      const start = endYear - i;
      if (start < minYear) {
        continue;
      }
      const end = (start + 1).toString().slice(-2);
      years.push(`${start}-${end}`);
    }

    return years;
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

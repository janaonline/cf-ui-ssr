import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, computed, effect, inject, Inject, input, PLATFORM_ID, signal, untracked, viewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import html2canvas from 'html2canvas';
import { Subject, takeUntil } from 'rxjs';
import { ButtonObj, CalcType, IFinancialIndicatorInfo, IFinancialIndicatorRes, IFinancialIndicatorsChart, LineItemType } from '../../../../core/models/interfaces';
import { IULB } from '../../../../core/models/ulb';
import { MaterialModule } from '../../../../material.module';
import { ChartConfig, ChartResStruct } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../shared/components/charts/constants';
import { NoDataFound } from '../../../../shared/components/no-data-found/no-data-found';
import { PreLoader } from '../../../../shared/components/pre-loader/pre-loader';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { CompareByDialog } from '../../city/financial-indicator/compare-by-dialog/compare-by-dialog';
import { buttons, compraeByOptions, IndicatorDetails, subButtons } from '../../city/financial-indicator/constants';
import { resStruct } from '../../city/financial-indicator/temp';
import { DashboardService } from '../../dashboard-service';
import { state } from '@angular/animations';
import { ChartService } from './chart-service';

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
  readonly buttons: ButtonObj[] = buttons;
  readonly subButtons = subButtons;
  readonly compraeByOptions = compraeByOptions;
  // readonly accordions = accordions;

  // readonly ulbIdSignal = input.required<string>();
  readonly stateIdSignal = signal('');
  readonly stateDetails = input.required<any>();
  // readonly ulbName = input.required<string>();
  // readonly ulbType = input.required<string>();

  currentSelectedButtonKey = signal<LineItemType>('revenue');
  subButton = signal<string>('');

  myForm!: FormGroup;
  years = signal<string[]>([]);

  infoMsg = signal<IFinancialIndicatorInfo>({ msg: '', text: 'success' });
  isChartDataAvailable = signal<boolean>(true);
  isLoading = signal<boolean>(true);
  isChartLoading = signal<boolean>(false);
  isChartDownloading = signal<boolean>(false);

  output = signal<resStruct | undefined>(undefined);

  compareUlbsFromPopup!: IULB[] | undefined;
  compareTypeFromPopup!: string;
  dialogResult!: IFinancialIndicatorsChart;
  readonly dialog = inject(MatDialog);

  // accordion = viewChild.required(MatAccordion);

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



  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private chartService: ChartService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit() {
    this.stateIdSignal.set(this.stateDetails().state._id);
    this.years.set(this.stateDetails().yearsList);

    this.myForm = this.fb.group({ year: [this.years()[1]] });
    this.isLoading.set(false);

    this.myForm.get('year')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.getChartData()
      })
  }

  readonly canFetchChart = computed(() => {
    // console.log(!!this.ulbIdSignal(), !!this.years().length, !!this.currentSelectedButtonKey(), !!this.subButton(), !isPlatformBrowser(this.platformId))
    return !!this.stateIdSignal() &&
      !!this.years().length &&
      !!this.currentSelectedButtonKey() &&
      !!this.subButton();
  });

  readonly ulbIdChangeEffect = effect(() => {
    if (!isPlatformBrowser(this.platformId)) return;
    const canFetch = this.canFetchChart();
    // console.log("canFetchChart:", canFetch);

    if (canFetch) this.getChartData();
  })

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    // console.log('Button key sent from child to parent:', key);
    this.currentSelectedButtonKey.set(key as LineItemType);
  }

  // Output emitted by child to parent
  onSelectedSubButtonChange(key: string): void {
    // console.log('Sub button key sent from child to parent:', key);
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
  buttonType(): string {
    // return this.getLabelByKey(this.buttons, this.currentSelectedButtonKey()) || 'Revenue';
    const subBtnArr = this.subButtons[this.currentSelectedButtonKey()].buttons;
    return this.getLabelByKey(subBtnArr, this.subButton()) || 'Total Revenue';
  }

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
    // console.log('Revenue Chart Data:', res);
    // console.log('Scatter Data:', scatterData);
    // this.chartDatas[1].datasets = scatterData;
    const options = baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Population(in Thousands)', 'Total Revenue (in Cr.)');
    options.plugins!.legend!.labels!.usePointStyle = true;
    options.plugins!.legend!.labels!.padding = 20;

    let config: ChartConfig = {
      chartId: 'scatterChart0',
      chartType: 'scatterChart',
      datasets: scatterData,
      // options: {
      //   plugins: {
      //     legend: {
      //       position: 'bottom',
      //       labels: {
      //         padding: 20,
      //         color: "#000000",
      //         usePointStyle: true,
      //         // pointStyle: 'circle'
      //       },
      //     },
      //   }
      // }
      options
      // options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Population(in Thousands)', 'Total Revenue (in Cr.)')
    }
    this.scatterChart.set(config);
  }
  getPopulationChart() {
    const params = {
      stateId: this.stateIdSignal(),
      year: this.getYear(),
      // ulbId: this.stateDetails().state.ulbId || ''
    };
    this.dashboardService.getStatePopulation(params).subscribe({
      next: (res) => {
        this.updateBarChartData(res.data);
      },
      error: (error: Error) => {
        console.error('Failed to get population chart data', error);
      }
    });
  }
  getRevenueChart() {
    const params = {
      stateId: this.stateIdSignal(),
      year: this.getYear(),
      // ulbId: this.stateDetails().state.ulbId || ''
    };
    this.dashboardService.getStateRevenue(params).subscribe({
      next: (res) => {
        this.updateScatterChartData(res.data);
      },
      error: (error: Error) => {
        console.error('Failed to get population chart data', error);
      }
    });
  }

  private getChartData(): void {
    this.getPopulationChart();
    this.getRevenueChart();
    this.getStateGroupPopulation();
    return;
    // this.chartsData.set(this.chartDatas);    // this.isChartLoading.set(true);

    // Create body/ payload structure.
    const body = this.createBodyStructure();
    // console.log("body: ", body)

  }

  getStateGroupPopulation() {
    const params = {
      stateId: this.stateIdSignal(),
      year: this.getYear(),
    };
    this.dashboardService.getStateGroupPopulation(params).subscribe({
      next: (res: any) => {
        console.log('State Group Population Data:', res);
        if (res["data"]?.length) {
          // const tableData = {
          //   tableHeading: Object.keys(res["data"][0]),
          //   tableDataSource: res["data"][0]
          // }
          this.stateUlbsPopulation.set(res["data"][0]);
        }
        // this.stateUlbsPopulation.set(res.data);
      },
      error: (error: Error) => {
        console.error('Failed to get state group population data', error);
      }
    });
  }
  // Helper: Consolidate all the data - payload/ body for the API.
  private createBodyStructure(): IFinancialIndicatorsChart {
    const { compareType = 'state', calcType = this.getcalcType(), compareUlbs = [], compareUlbsObj } = this.dialogResult ?? {};
    this.compareUlbsFromPopup = compareUlbsObj;
    this.compareTypeFromPopup = compareType;

    // If 'mix' then only one year data has to be fetched.
    const body: IFinancialIndicatorsChart = {
      years: this.getcalcType() === 'mix' ? [this.getYear()] : this.createYearsArr(),
      compareType,
      stateId: this.stateIdSignal(),
      lineItem: untracked(() => this.currentSelectedButtonKey()),
      calcType,
      compareUlbs
    };

    return body;
  }

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
      data: { ulbType: '', compareUlbsFromParent: this.compareUlbsFromPopup, compareType: this.compareTypeFromPopup }
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
        const subBtn = this.getLabelByKey(this.subButtons[this.currentSelectedButtonKey()].buttons, this.subButton());
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
    this.ulbIdChangeEffect.destroy()
  }
}

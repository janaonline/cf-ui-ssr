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
  isChartLoading = signal<boolean>(true);
  isChartDownloading = signal<boolean>(false);

  chartsData = signal<ChartConfig[]>([]);
  output = signal<resStruct | undefined>(undefined);

  compareUlbsFromPopup!: IULB[] | undefined;
  compareTypeFromPopup!: string;
  dialogResult!: IFinancialIndicatorsChart;
  readonly dialog = inject(MatDialog);

  accordion = viewChild.required(MatAccordion);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
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
  // chartDat: ChartResStruct = {

  //   chartType: 'barChart',
  //   labels: ['2020-21', '2021-22', '2022-23'],
  //   legendColors: [],
  //   axes: { x: 'Years', y: 'Amt in ₹ Cr' },
  //   data: [
  //     {
  //       type: 'line',
  //       label: 'Y-o-Y Growth',
  //       data: [2937, 3524, 3883],
  //       backgroundColor: ['#f43f5e'],
  //     },
  //     {
  //       type: 'bar',
  //       label: 'ULB Name',
  //       data: [2937, 3524, 3883],
  //       backgroundColor: ["#62b6cb"],
  //     },
  //     {
  //       type: 'bar',
  //       label: 'National Avg',
  //       data: [1576, 1946, 3037],
  //       backgroundColor: ["#1b4965"],
  //     },
  //     // {
  //     //     type: 'bar',
  //     //     label: 'National Avg',
  //     //     data: [1576, 1946, 3037],
  //     //     backgroundColor: ["#bee9e8"],
  //     // },
  //   ]
  // }
  // Create chart.
  chartDatas: ChartConfig[] = [
    {
      "chartId": "barChart_0",
      "chartType": "barChart",
      "labels": [
        "2020-21",
        "2021-22",
        "2022-23"
      ],
      "datasets": [
        // {
        //   "type": "line",
        //   "label": "Y-o-Y Growth",
        //   "data": [
        //     2937,
        //     3524,
        //     3883
        //   ],
        //   "borderColor": "#f43f5e",
        //   "pointBackgroundColor": "#f43f5e",
        //   "borderWidth": 2,
        //   "fill": false,
        //   "tension": 0.3
        // },
        {
          "type": "bar",
          "label": "Greater Hyderabad Municipal Corporation",
          "data": [
            2937,
            3524,
            3883
          ],
          "backgroundColor": "#62b6cb",
          "borderRadius": 5
        },
        // {
        //   "type": "bar",
        //   "label": "State Avg",
        //   "data": [
        //     1576,
        //     1946,
        //     3883
        //   ],
        //   "backgroundColor": "#1b4965",
        //   "borderRadius": 5
        // }
      ],
      "options": {
        "responsive": true,
        "maintainAspectRatio": false,
        "font": {
          "family": "Montserrat",
          "size": 11
        },
        "interaction": {
          "mode": "index",
          "intersect": false
        },
        "plugins": {
          "customDataLabel": {
            "enabled": false,
            "format": ""
          },
          "legend": {
            "labels": {
              "font": {
                "family": "Montserrat",
                "size": 12
              }
            }
          },
          "tooltip": {
            "titleFont": {
              "family": "Montserrat"
            },
            "bodyFont": {
              "family": "Montserrat"
            }
          }
        },
        "layout": {
          "padding": 5
        },
        "scales": {
          "x": {
            "axis": "x",
            "display": true,
            "ticks": {
              "font": {
                "family": "Montserrat"
              },
              "minRotation": 0,
              "maxRotation": 50,
              "mirror": false,
              "textStrokeWidth": 0,
              "textStrokeColor": "",
              "padding": 3,
              "display": true,
              "autoSkip": true,
              "autoSkipPadding": 3,
              "labelOffset": 0,
              // "minor": {},
              "major": {},
              "align": "center",
              "crossAlign": "near",
              "showLabelBackdrop": false,
              "backdropColor": "rgba(255, 255, 255, 0.75)",
              "backdropPadding": 2,
              "color": "#666"
            },
            "title": {
              "display": true,
              "text": "Years",
              "font": {
                "family": "Montserrat",
                "size": 11,
                "weight": "bold"
              },
              "color": "#374151",
              "padding": {
                "top": 4,
                "bottom": 4
              }
            },
            "type": "category",
            "offset": true,
            "grid": {
              "offset": true,
              "display": true,
              "lineWidth": 1,
              "drawOnChartArea": true,
              "drawTicks": true,
              "tickLength": 8,
              "color": "rgba(0,0,0,0.1)"
            },
            "reverse": false,
            // "beginAtZero": false,
            "bounds": "ticks",
            "clip": true,
            // "grace": 0,
            "border": {
              "display": true,
              "dash": [],
              "dashOffset": 0,
              "width": 1,
              "color": "rgba(0,0,0,0.1)"
            },
            // "id": "x",
            "position": "bottom"
          },
          "y": {
            "axis": "y",
            "display": true,
            "ticks": {
              "font": {
                "family": "Montserrat"
              },
              "minRotation": 0,
              "maxRotation": 50,
              "mirror": false,
              "textStrokeWidth": 0,
              "textStrokeColor": "",
              "padding": 3,
              "display": true,
              "autoSkip": true,
              "autoSkipPadding": 3,
              "labelOffset": 0,
              // "minor": {},
              "major": {},
              "align": "center",
              "crossAlign": "near",
              "showLabelBackdrop": false,
              "backdropColor": "rgba(255, 255, 255, 0.75)",
              "backdropPadding": 2,
              "color": "#666"
            },
            "title": {
              "display": true,
              "text": "Amt in ₹ Cr",
              "font": {
                "family": "Montserrat",
                "size": 11,
                "weight": "bold"
              },
              "color": "#374151",
              "padding": {
                "top": 4,
                "bottom": 4
              }
            },
            "type": "linear",
            "beginAtZero": true,
            "offset": false,
            "reverse": false,
            "bounds": "ticks",
            "clip": true,
            "grace": 0,
            "grid": {
              "display": true,
              "lineWidth": 1,
              "drawOnChartArea": true,
              "drawTicks": true,
              "tickLength": 8,
              "offset": false,
              "color": "rgba(0,0,0,0.1)"
            },
            "border": {
              "display": true,
              "dash": [],
              "dashOffset": 0,
              "width": 1,
              "color": "rgba(0,0,0,0.1)"
            },
            // "id": "y",
            "position": "left"
          }
        }
      }
    }
  ];
  chartData = signal<ChartConfig>({
    chartId: 'bar0',
    chartType: 'barChart',
    labels: ['2020-21', '2021-22', '2022-23'],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        // title: {
        //   display: true,
        //   text: 'Total Expenditure'
        // }
      }
    },
    datasets: [
      {
        label: 'Capital Expenditure',
        data: [30, 50, 20],
        backgroundColor: '#42A5F5'
      }
    ]
  });
  getPopulationChart() {
    const params = {
      stateId: this.stateIdSignal(),
      year: this.getYear(),
      // ulbId: this.stateDetails().state.ulbId || ''
    };
    this.dashboardService.getStatePopulation(params).subscribe({
      next: (res) => {
        console.log('Population Chart Data:', res);
        const { labels, values } = res.data.reduce((acc: { labels: any[]; values: any[]; }, { ulbName, sum }: any) => {
          // const sumRs = "INR " + (sum > 0 ? Math.round(sum / 10000000) : "0") + " Cr";
          const sumCr = (sum > 0 ? Math.round(sum / 10000000) : "0");
          acc.labels.push(ulbName);
          acc.values.push(sumCr);
          return acc;
        }, { labels: [], values: [] });

        console.log("Labels:", labels);
        console.log("Data:", values);
        this.chartDatas = [{
          chartId: 'populationChart',
          chartType: 'barChart',
          labels,
          datasets: [
            {
              type: 'bar',
              label: '',
              data: values,
              backgroundColor: '#1b4965',
              barThickness: 50,

              // borderRadius: 5
            }],
          options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'ULBs', 'Amount in ₹ Cr')
        }];
        this.chartsData.set(this.chartDatas);
      },
      error: (error: Error) => {
        console.error('Failed to get population chart data', error);
      }
    });
  }
  private getChartData(): void {
    this.getPopulationChart();
    // this.chartsData.set(this.chartDatas);    // this.isChartLoading.set(true);

    // Create body/ payload structure.
    const body = this.createBodyStructure();
    // console.log("body: ", body)

    // Don't call API if year is unavailable.
    if (body.years.length > 0) {

      this.dashboardService.getFinancialIndicatorsChartData(body)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (apiRes: IFinancialIndicatorRes) => {
            // console.log(apiRes)
            const res = apiRes.data;

            // Check if data is available.
            if (!apiRes.success) { this.isChartDataAvailable.set(false) }
            else {
              this.infoMsg.set(apiRes.data.info);

              this.isChartDataAvailable.set(true);
              if (res.chartType === 'barChart') {
                const structureData = this.buildBarChartConfigurations(res);
                this.chartsData.set(structureData);
              }
              else if (res.chartType === 'gaugeChart' && this.getcalcType() === 'mix') {
                const structureData = this.buildGaugeChartConfigurations(res);
                this.chartsData.set(structureData);
              }
            }

            this.isChartLoading.set(false);
          },
          error: () => {
            console.error('Failed to create chart.');
            this.isChartLoading.set(false);
          },
        })

    }
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

  // Helper: Add additional options to the API res - Bar chart.
  private buildBarChartConfigurations(chartData: ChartResStruct): ChartConfig[] {
    // Set chart output state
    this.output.set(chartData);
    // console.log('chart data', chartData)

    // Initialize chart config object
    const config: ChartConfig = {
      chartId: `${chartData.chartType}_0`,
      chartType: chartData.chartType,
      labels: chartData.labels,
      datasets: [],
      options: baseChartOptions(DEFAULT_FONT_FAMILY, true, chartData.axes?.x, chartData.axes?.y),
    };

    // Populate datasets based on type
    for (const chart of chartData.data) {
      const barThickness = chart.data.length < 3 ? { barThickness: 60 } : {}

      const dataset: any = {
        type: chart.type,
        label: chart.label,
        data: chart.data,
      };

      if (chart.type === 'line') {
        Object.assign(dataset, {
          borderColor: chart.backgroundColor?.[0],
          pointBackgroundColor: chart.backgroundColor?.[0],
          borderWidth: 2,
          fill: false,
          tension: 0.3,
        });
      } else {
        Object.assign(dataset, {
          backgroundColor: chart.backgroundColor?.[0],
          borderRadius: 5,
          ...barThickness
        });
      }

      config.datasets.push(dataset);
    }

    return [config];
  }

  // Helper: Add additional options to the API res - Gauge chart.
  private buildGaugeChartConfigurations(res: ChartResStruct): ChartConfig[] {
    this.chartsData.set([]);
    this.output.set(res);

    const config: ChartConfig[] = res.data.map((chart, idx) => {
      return {
        chartId: `${res.chartType}_${idx}`,
        chartType: `${res.chartType}`,
        datasets: [
          {
            label: chart.label,
            data: chart.data,
            backgroundColor: res.legendColors,
            borderRadius: 3,
            borderWidth: 1,
          },
        ],
        options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
      }
    })

    return config;
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

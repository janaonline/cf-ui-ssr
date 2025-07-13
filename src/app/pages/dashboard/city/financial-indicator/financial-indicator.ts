import { isPlatformServer } from '@angular/common';
import { Component, Inject, inject, input, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import html2canvas from 'html2canvas';
import { ButtonObj, CalcType, IFinancialIndicatorsChart, LineItemType } from '../../../../core/models/interfaces';
import { MaterialModule } from '../../../../material.module';
import { ChartConfig, ChartResStruct } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import {
  baseChartOptions,
  DEFAULT_FONT_FAMILY,
} from '../../../../shared/components/charts/constants';
import { NoDataFound } from '../../../../shared/components/no-data-found/no-data-found';
import { PreLoader } from '../../../../shared/components/pre-loader/pre-loader';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { DashboardService } from '../../dashboard-service';
import { CompareByDialog } from './compare-by-dialog/compare-by-dialog';
import { accordions, buttons, IndicatorDetails, subButtons } from './constants';
import { resStruct } from './temp';

export interface ChartResponse {
  success: boolean;
  data: ChartData;
}

export interface ChartData {
  chartType: 'gaugeChart' | string;
  labels: string[];
  legendColors: string[];
  data: ChartSeries[];
}

export interface ChartSeries {
  label: string;
  data: number[];
}


@Component({
  selector: 'app-financial-indicator',
  imports: [
    NoDataFound,
    Charts,
    MatAccordion,
    MaterialModule,
    TabButtons,
    PreLoader,
  ],
  templateUrl: './financial-indicator.html',
  styleUrl: './financial-indicator.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialIndicator {
  readonly graphColors = [
    "#62b6cb",
    "#1b4965",
    "#bee9e8",
    "#43B5A0",
    "#F4A261",
    "#5885AF",
    "#F6D743"
  ]

  readonly disabledColor = '#e9ecef';
  // readonly primaryColor = '#1b4965';
  // readonly secondaryColor = '#62b6cb';
  // readonly accentColor = '#bee9e8';
  readonly lineColor = '#f43f5e';
  readonly items = [
    // { icon: 'bi bi-arrows-fullscreen', label: 'Expand' },
    // { icon: 'bi bi-share-fill', label: 'Share' },
    // { icon: 'bi bi-arrow-clockwise', label: 'Reset' },
    { icon: 'bi bi-download', label: 'Download' },
  ];
  readonly buttons: ButtonObj[] = buttons;
  readonly subButtons = subButtons;
  readonly accordions = accordions;

  readonly ulbIdSignal = input.required<string>();

  currentSelectedButtonKey = signal<LineItemType>('revenue');
  subButton = signal<string>('');

  myForm!: FormGroup;
  years = input.required<string[]>();
  accordion = viewChild.required(MatAccordion);

  isLoading = signal<boolean>(true);

  chartsData = signal<ChartConfig[]>([]);
  output = signal<resStruct | undefined>(undefined);
  dialogResult!: IFinancialIndicatorsChart;
  readonly dialog = inject(MatDialog);

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  ngOnInit() {
    this.myForm = this.fb.group({ year: [this.years()[0]] });
    this.isLoading.set(false);

    this.myForm.get('year')?.valueChanges.subscribe({
      next: (newYearValue) => {
        this.getChartData();
      }
    })
  }

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    console.log('Button key sent from child to parent:', key);
    this.currentSelectedButtonKey.set(key as LineItemType);
  }

  // Output emitted by child to parent
  onSelectedSubButtonChange(key: string): void {
    console.log('Sub button key sent from child to parent:', key);
    this.subButton.set(key);
    this.getChartData();
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

  getButtonLabel(arr: ButtonObj[], key: string) {
    return arr.find(e => e.key === key)?.label;
  }

  get year() {
    return this.myForm.get('year')?.value;
  }

  get getcalcType(): CalcType {
    const subBtn = this.subButton();

    if (['totRev', 'totOwnRev', 'totRevex', 'capex',].includes(subBtn)) return 'total';
    else if (['revPerCapita', 'ownRevPerCapita', 'revexPerCapita', 'capexPerCapita',].includes(subBtn)) return 'perCapita';
    return 'mix';
  }

  createBodyStructure(): IFinancialIndicatorsChart {
    // if (!this.dialogResult) {
    //   console.warn('createBodyStructure: dialogResult is undefined, using defaults');
    // }

    const {
      compareType = 'state',
      calcType = this.getcalcType,
      compareUlbs = []
    } = this.dialogResult ?? {};

    console.log('calc type: ', calcType)

    const body: IFinancialIndicatorsChart = {
      // years: this.createYearsArr(),
      years: [this.year],
      compareType,
      ulbId: this.ulbIdSignal(),
      lineItem: this.currentSelectedButtonKey(),
      calcType,
      compareUlbs
    };

    return body;
  }


  createYearsArr(): string[] {
    const yearStr: string = this.myForm.get('year')?.value;

    if (!yearStr || !/^\d{4}-\d{2}$/.test(yearStr)) {
      console.warn('Invalid year format. Expected format: YYYY-YY');
      return [];
    }

    const endYear = parseInt(yearStr.slice(0, 4), 10);

    const years: string[] = [];
    for (let i = 2; i >= 0; i--) {
      const start = endYear - i;
      const end = (start + 1).toString().slice(-2);
      years.push(`${start}-${end}`);
    }

    return years;
  }

  isChartLoading = signal<boolean>(true);
  // Create chart.
  private getChartData() {
    this.isChartLoading.set(true);
    const body = this.createBodyStructure();
    console.log("body = ", body)

    this.dashboardService.getFinancialIndicatorsChartData(body).subscribe({
      next: (apiRes: { data: ChartResStruct }) => {
        console.log("chart data: ", apiRes);
        const res = apiRes.data;

        if (res.chartType === 'barChart') {
          this.output.set(res);
          const obj: ChartConfig = {
            chartId: `${res.chartType}_0`,
            chartType: res.chartType,
            labels: res.labels,
            datasets: [],
            options: baseChartOptions(DEFAULT_FONT_FAMILY, true, res.axes?.x, res.axes?.y),
          };

          const barThickness = res.data.length > 4 ? { barThickness: 60 } : {};

          res.data.forEach((chart) => {
            if (chart.type === 'line') {
              obj.datasets.push({
                type: 'line',
                label: chart.label,
                data: chart.data,
                borderColor: chart.backgroundColor?.[0],
                pointBackgroundColor: chart.backgroundColor?.[0],
                borderWidth: 2,
                fill: false,
                tension: 0.3,
              });
            } else {
              obj.datasets.push({
                type: 'bar',
                label: chart.label,
                data: chart.data,
                backgroundColor: chart.backgroundColor?.[0],
                borderRadius: 5,
                ...barThickness
              });
            }
          });

          this.chartsData.set([obj]);
          // console.log(this.chartsData)
        }

        if (res.chartType === 'gaugeChart' && this.getcalcType === 'mix') {
          this.chartsData.set([]);
          this.output.set(res);

          const modifiedChartData: ChartConfig[] = res.data.map((chart, idx) => {
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
              options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', ''),
            }
          })

          this.chartsData.set(modifiedChartData);
        }

        this.isChartLoading.set(false);
      },
      error: () => {
        console.error('Failed to create chart.');
        this.isChartLoading.set(false);
      },
    })
  }

  // Open compare by dialog 
  openCompareByDialog() {
    if (isPlatformServer(this.platformId)) return;

    const dialogRef = this.dialog.open(CompareByDialog, {
      width: '700px',
      maxWidth: '70vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result: ', result);
      this.dialogResult = result;
      this.getChartData();
    });
  }

  // isExpanded: boolean = false;
  showLoader = signal<boolean>(false);
  takeAction(selectedIcon: string) {
    console.log("Clicked icon: ", selectedIcon)
    this.showLoader.set(true);
    // if (selectedIcon === 'Expand') this.isExpanded = !this.isExpanded;

    if (selectedIcon === 'Download') {
      setTimeout(() => {
        const chartElement = document.getElementById('chartContainer');
        if (!chartElement) return;

        // html2canvas(chartElement).then(canvas => {
        //   const link = document.createElement('a');
        //   link.download = 'chart-snapshot.png';
        //   link.href = canvas.toDataURL('image/png');
        //   link.click();
        // });

        const mainBtn = this.getButtonLabel(this.buttons, this.currentSelectedButtonKey());
        const subBtn = this.getButtonLabel(this.subButtons[this.currentSelectedButtonKey()].buttons, this.subButton());
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

          this.showLoader.set(false);
        }).catch(err => {
          // Restore elements in case of error
          elementsToHide?.forEach(el => {
            (el as HTMLElement).style.visibility = 'visible';
          });
          console.error('Error capturing chart:', err);
          this.showLoader.set(false);
        });
      }, 0);

    }
  }
}

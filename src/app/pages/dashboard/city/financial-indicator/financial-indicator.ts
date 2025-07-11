import { Component, input, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { ButtonObj } from '../../../../core/models/interfaces';
import { MaterialModule } from '../../../../material.module';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import {
  baseChartOptions,
  DEFAULT_FONT_FAMILY,
} from '../../../../shared/components/charts/constants';
import { NoDataFound } from '../../../../shared/components/no-data-found/no-data-found';
import { PreLoader } from '../../../../shared/components/pre-loader/pre-loader';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { accordions, buttons, IndicatorDetails, subButtons } from './constants';
import { res, resStruct } from './temp';

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
    { icon: 'bi bi-arrows-fullscreen', label: 'Expand' },
    { icon: 'bi bi-download', label: 'Download' },
    { icon: 'bi bi-share-fill', label: 'Share' },
  ];
  readonly buttons: ButtonObj[] = buttons;
  readonly subButtons = subButtons;
  readonly accordions = accordions;

  currentSelectedButtonKey = signal<string>('');
  subButton = signal<string>('');

  myForm!: FormGroup;
  years = input.required<string[]>();
  accordion = viewChild.required(MatAccordion);

  isLoading = signal<boolean>(true);

  chartsData: ChartConfig[] = [];
  output = signal<resStruct | undefined>(undefined);

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.myForm = this.fb.group({ year: [this.years()[0]] });
    this.isLoading.set(false);
  }

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    console.log('Button key sent from child to parent:', key);
    this.currentSelectedButtonKey.set(key);
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
  // Create chart.
  private getChartData() {
    console.log('Sub button, Curr button: ', this.subButton(), this.currentSelectedButtonKey());
    setTimeout(() => {


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

        this.chartsData = [obj];
        // console.log(this.chartsData)
      }

      if (res.chartType === 'gaugeChart') {
        this.output.set(res);
        this.chartsData = res.data.map((chart, idx) => {
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
      }

    }, 2000);
  }
}

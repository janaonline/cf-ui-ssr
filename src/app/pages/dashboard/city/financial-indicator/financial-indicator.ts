import { Component, input, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
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
import { buttons, subButtons } from './constants';
import { ButtonObj } from '../../../../core/models/interfaces';

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
  readonly disabledColor = '#e9ecef';
  readonly primaryColor = '#1b4965';
  readonly secondaryColor = '#62b6cb';
  readonly accentColor = '#bee9e8';
  readonly lineColor = '#f43f5e';
  readonly items = [
    { icon: 'bi bi-arrows-fullscreen', label: 'Expand' },
    { icon: 'bi bi-download', label: 'Download' },
    { icon: 'bi bi-share-fill', label: 'Share' },
  ];
  readonly buttons: ButtonObj[] = buttons;
  readonly subButtons = subButtons;

  currentSelectedButtonKey = signal<string>('');
  subButton = signal<string>('');

  myForm!: FormGroup;
  years = input.required<string[]>();
  accordion = viewChild.required(MatAccordion);

  isLoading = signal<boolean>(true);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.myForm = this.fb.group({ year: [this.years()[0]] });
    this.isLoading.set(false);
  }

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    console.log('Button key sent from child to parent:', key);
    this.currentSelectedButtonKey.set(key);
    this.subButton.set(
      subButtons[this.currentSelectedButtonKey()].buttons[0].key
    );
  }

  // Output emitted by child to parent
  onSelectedSubButtonChange(key: string): void {
    console.log('Sub button key sent from child to parent:', key);
    this.subButton.set(key);
  }

  chartData: ChartConfig = {
    chartId: 'mixed0',
    chartType: 'mixedChart',
    labels: ['2020-21', '2021-22', '2022-23'],
    data: {
      labels: ['2020-21', '2021-22', '2022-23'],
      datasets: [
        {
          type: 'line',
          label: 'Y-o-Y Growth',
          data: [-20, -10, 0],
          borderWidth: 2,
          borderColor: this.lineColor,
          pointBackgroundColor: this.lineColor,
          fill: false,
          tension: 0.3,
        },
        {
          type: 'bar',
          label: 'ULB Name',
          data: [2937, 3524, 3883],
          backgroundColor: [this.secondaryColor],
          borderRadius: 5,
          barThickness: 60,
        },
        {
          type: 'bar',
          label: 'National Avg',
          data: [1576, 1946, 3037],
          backgroundColor: [this.primaryColor],
          borderRadius: 5,
          barThickness: 60,
        },
        // {
        //   type: 'bar',
        //   label: 'National Avg',
        //   data: [1576, 1946, 3037],
        //   backgroundColor: [this.primaryColor],
        //   borderRadius: 5,
        //   // barThickness: 60,
        // },
        // {
        //   type: 'bar',
        //   label: 'National Avg',
        //   data: [1576, 1946, 3037],
        //   backgroundColor: [this.primaryColor],
        //   borderRadius: 5,
        //   // barThickness: 60,
        // },
      ],
    },
    options: baseChartOptions(
      DEFAULT_FONT_FAMILY,
      true,
      'Years',
      'Amt in ₹ Cr'
    ),
  };
}

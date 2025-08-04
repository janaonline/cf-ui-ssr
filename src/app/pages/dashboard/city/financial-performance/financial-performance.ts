import { Component, computed, input, signal } from '@angular/core';
import { ButtonObj } from '../../../../core/models/interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { TreeTable } from './tree-table/tree-table';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financial-performance',
  imports: [
    TabButtons,
    TreeTable,
    Charts,
    CommonModule,

  ],
  templateUrl: './financial-performance.html',
  styleUrl: './financial-performance.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialPerformance {
  onDownload() {
    throw new Error('Method not implemented.');
  }
  buttons: ButtonObj[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'expenditure', label: 'Expenditure' },
    { key: 'debtassets', label: 'Debt and Assets' }
  ];
  ulbIdSignal = input.required<string>();
  ulbName = input.required<string>();
  ulbType = input.required<string>();
  ulbPopulation = input.required<string>();
  currentSelectedButtonKey = signal<string>('overview');
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
  selectedButton: ButtonObj | null = null;
  readonlyButtons = computed<ButtonObj[]>(() => {
    return this.ulbPopulation() == '4M+'
      ? this.buttons
      : this.buttons.filter(btn =>
        ['revenue', 'expenditure'].includes(btn.key)
      );
  });

  // Main Button Change Handler
  onSelectedButtonChange(btnKey: string) {
    this.selectedButton = this.buttons.find(button => button.key === btnKey) || null;
    this.currentSelectedButtonKey.set(btnKey);
  }



  isTooltipVisible = signal<boolean>(false);
  toggleTooltip() {
    this.isTooltipVisible.set(!this.isTooltipVisible());
  }

}

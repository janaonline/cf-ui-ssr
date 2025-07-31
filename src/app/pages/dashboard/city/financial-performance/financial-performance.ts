import { Component, input, signal } from '@angular/core';
import { ButtonObj } from '../../../../core/models/interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { TreeTable } from './tree-table/tree-table';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';

@Component({
  selector: 'app-financial-performance',
  imports: [
    TabButtons,
    TreeTable,
    Charts,
  ],
  templateUrl: './financial-performance.html',
  styleUrl: './financial-performance.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialPerformance {
  readonly buttons: ButtonObj[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'expenditure', label: 'Expenditure' },
    { key: 'debtassets', label: 'Debt and Assets' }
  ];


  readonly ulbIdSignal = input.required<string>();
  readonly ulbName = input.required<string>();
  readonly ulbType = input.required<string>();

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

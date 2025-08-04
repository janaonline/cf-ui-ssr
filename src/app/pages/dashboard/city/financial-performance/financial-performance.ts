import { Component, computed, input, signal } from '@angular/core';
import { ButtonObj } from '../../../../core/models/interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { TreeTable } from './tree-table/tree-table';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import html2canvas from 'html2canvas';
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

  readonly items = [
    { icon: 'bi bi-download', label: 'Download' },
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

  // takeAction(selectedIcon: string) {
  //   // this.isChartDownloading.set(true);

  //   if (selectedIcon === 'Download') {
  //     setTimeout(() => {
  //       const chartElement = document.getElementById('chartContainer');
  //       if (!chartElement) return;

  //       // const mainBtn = this.getLabelByKey(this.buttons, this.currentSelectedButtonKey());
  //       // const subBtn = this.getLabelByKey(this.subButtons[this.currentSelectedButtonKey()].buttons, this.subButton());
  //       const imgName = 'chart.png';
  //       const chartContainer = document.getElementById('chartContainer');
  //       const elementsToHide = chartContainer?.querySelectorAll('.hide-while-download');

  //       // Hide elements
  //       elementsToHide?.forEach(el => {
  //         (el as HTMLElement).style.visibility = 'hidden';
  //       });

  //       if (!chartContainer) return;

  //       html2canvas(chartContainer).then(canvas => {
  //         // Re-show hidden elements
  //         elementsToHide?.forEach(el => {
  //           (el as HTMLElement).style.visibility = 'visible';
  //         });

  //         // Save the image
  //         const link = document.createElement('a');
  //         link.href = canvas.toDataURL('image/png');
  //         link.download = imgName;
  //         link.click();

  //         // this.isChartDownloading.set(false);
  //       }).catch(err => {
  //         // Restore elements in case of error
  //         elementsToHide?.forEach(el => {
  //           (el as HTMLElement).style.visibility = 'visible';
  //         });
  //         console.error('Error capturing chart:', err);
  //         // this.isChartDownloading.set(false);
  //       });
  //     }, 0);

  //   }
  // }

  takeAction(selectedIcon: string) {
    if (selectedIcon === 'Download') {
      setTimeout(() => {
        const chartContainer = document.getElementById('chartContainer');
        if (!chartContainer) return;

        const elementsToHide = chartContainer.querySelectorAll('.hide-while-download');
        elementsToHide.forEach(el => {
          (el as HTMLElement).style.visibility = 'hidden';
        });

        // Create the outer div
        const cfLogo = document.createElement('div');
        cfLogo.className = 'cfLogo-place';
        cfLogo.style.position = 'absolute';
        cfLogo.style.bottom = '10px';
        cfLogo.style.right = '10px';
        cfLogo.style.zIndex = '1000';

        // Inject the inner HTML
        cfLogo.innerHTML = `
          <span class="fw-bold fs-3 text-shadow-custom text-info">city</span>
          <span class="fw-bold fs-3 text-shadow-custom text-cfSecondary">finance.in</span>
        `;

        // Append to chart container
        chartContainer.appendChild(cfLogo);


        // Wait briefly to render new DOM changes
        setTimeout(() => {
          html2canvas(chartContainer).then(canvas => {
            // Restore visibility
            elementsToHide.forEach(el => {
              (el as HTMLElement).style.visibility = 'visible';
            });

            // Remove watermark divs
            const tempElements = chartContainer.querySelectorAll('.cfLogo-place');
            tempElements.forEach(el => el.remove());

            // Download the image
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'chart.png';
            link.click();
          }).catch(err => {
            // Restore in case of error
            elementsToHide.forEach(el => {
              (el as HTMLElement).style.visibility = 'visible';
            });
            chartContainer.querySelectorAll('.cfLogo-place').forEach(el => el.remove());
            console.error('Error capturing chart:', err);
          });
        }, 100); // Wait a bit to let DOM update
      }, 0);
    }
  }



  isTooltipVisible = signal<boolean>(false);
  toggleTooltip() {
    this.isTooltipVisible.set(!this.isTooltipVisible());
  }

}

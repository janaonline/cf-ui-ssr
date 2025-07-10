import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ChartConfig } from './chart-interfaces';
Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  imports: [],
  templateUrl: './charts.html',
  styleUrl: './charts.scss',
})
export class Charts implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: false })
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  chartConfig = input.required<ChartConfig>();
  chartInstance: Chart | undefined;

  // ngOnInit(): void {
  // console.log('Chart called: ', this.chartConfig());
  // }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createChart();
    }, 100);
  }

  private createChart(): void {
    // console.log('Canvas element:', this.chartCanvas);

    if (!this.chartCanvas) {
      console.error(
        'Canvas element not found for chart:',
        this.chartConfig().chartId
      );
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for canvas.');
      return;
    }

    // Destroy existing chart instance if any (for updates later)
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const config = this.chartConfig();

    switch (config.chartType) {
      case 'barChart':
        this.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: config.labels,
            datasets: config.datasets,
          },
          options: config.options,
          // config.options || baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
        });
        break;
      case 'lineChart':
        this.chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: config.labels,
            datasets: config.datasets,
          },
          options: config.options,
          // config.options || baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Months', 'Amt in ₹ Cr'),
        });
        break;
      case 'pieChart':
        this.chartInstance = new Chart(ctx, {
          type: 'doughnut', // Or 'pie' based on actual usage
          data: {
            labels: config.labels,
            datasets: config.datasets,
          },
          options: config.options,
          // options: config.options || baseChartOptions(DEFAULT_FONT_FAMILY, false, '', ''),
        });
        break;
      case 'mixedChart':
        this.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: config.data,
          options: config.options,
          // config.options || baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Revenue', 'Amt in ₹ Cr'),
        });
        break;
      case 'gaugeChart':
        this.chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: config.labels,
            datasets: config.datasets,
          },
          options: config.options,
        });
        break;
      default:
        console.warn(`Unknown chart type: ${config.chartType}`);
        break;
    }
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
}

// // Sample/ Examples
// // Bar Chart
// private createBarCanvas() {
//   console.log('createBarCanvas()');
//   new Chart(this.barCanvas.nativeElement, {
//     type: 'bar',
//     data: {
//       labels: ['Own Source Revenue', 'Grants', 'Assigned Revenue'],
//       datasets: [
//         {
//           label: '2023-24',
//           data: [12, 19, 3],
//           backgroundColor: ['#65D2F3'],
//           borderRadius: 5,
//         },
//         {
//           label: '2022-23',
//           data: [10, 8, 6],
//           backgroundColor: ['#1596E6'],
//           borderRadius: 5,
//         },
//         {
//           label: '2021-22',
//           data: [12, 10, 14],
//           backgroundColor: ['#245ABF'],
//           borderRadius: 5,
//         },
//       ],
//     },
//     options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
//   });
// }

// // Mixed Chart
// private createMixedChartCanvas() {
//   console.log('createMixedChartCanvas()');
//   new Chart(this.mixedChartCanvas.nativeElement, {
//     type: 'bar',
//     data: {
//       labels: ['Own Source Revenue', 'Grants', 'Assigned Revenue'],
//       datasets: [
//         {
//           type: 'line',
//           label: 'Y-o-Y Growth',
//           data: [25, 45, 35, 55],
//           borderWidth: 2,
//           borderColor: '#f43f5e',
//           pointBackgroundColor: '#f43f5e',
//           fill: false,
//           tension: 0.3,
//         },
//         {
//           type: 'bar',
//           label: 'ULB Name',
//           data: [30, 50, 40, 60],
//           backgroundColor: ['#1596E6'],
//           borderRadius: 5,
//         },
//         {
//           type: 'bar',
//           label: 'State Avg',
//           data: [12, 10, 14],
//           backgroundColor: ['#245ABF'],
//           borderRadius: 5,
//         },
//       ],
//     },
//     options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Revenue', 'Amt in ₹ Cr'),
//   });
// }

// // Line Chart
// private createLineCanvas() {
//   console.log('createLineCanvas()');
//   new Chart(this.lineCanvas.nativeElement, {
//     type: 'line',
//     data: {
//       labels: ['Jan', 'Feb', 'Mar'],
//       datasets: [
//         {
//           label: 'Dataset Label',
//           data: [10, 15, 30],
//           borderWidth: 2,
//           borderColor: '#FF6384',
//           pointBackgroundColor: '#FF6384',
//           fill: false,
//           tension: 0.3,
//         },
//       ],
//     },
//     options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Months', 'Amt in ₹ Cr'),
//   });
// }

// // Pie Chart
// private createPieCanvas() {
//   console.log('createPieCanvas()');
//   new Chart(this.pieCanvas.nativeElement, {
//     type: 'doughnut',
//     data: {
//       labels: ['Own Source Revenue', 'Grants', 'Assigned Revenue'],
//       datasets: [
//         {
//           label: 'Pie Dataset',
//           data: [30, 50, 20],
//           backgroundColor: ['#65D2F3', '#1596E6', '#245ABF'],
//           borderRadius: 5,
//           borderWidth: 1,
//         },
//       ],
//     },
//     options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', ''),
//   });
// }

// // Half Donut
// private createGaugeCanvas() {
//   console.log('createGaugeCanvas()');
//   new Chart(this.halfDonutCanvas.nativeElement, {
//     type: 'doughnut',
//     data: {
//       labels: ['Own Source Revenue'],
//       datasets: [
//         {
//           label: 'Own source revenue',
//           data: [80, 20],
//           backgroundColor: ['#65D2F3', '#f8f9fa'],
//           borderWidth: 1,
//           borderRadius: 5,
//         },
//         {
//           label: 'label 2',
//           data: [40, 60],
//           backgroundColor: ['#65D2F3', '#f8f9fa'],
//           borderWidth: 1,
//           borderRadius: 5,
//         },
//         {
//           label: 'label 3',
//           data: [70, 30],
//           backgroundColor: ['#65D2F3', '#f8f9fa'],
//           borderWidth: 1,
//           borderRadius: 5,
//         },
//       ],
//     },
//     options: {
//       circumference: 180,
//       rotation: 270,
//       cutout: '65%',
//       plugins: {
//         legend: { display: false },
//         tooltip: {
//           filter: (tooltipItem) => {
//             return tooltipItem.dataIndex === 0;
//           },
//         },
//       },
//     },
//   });
// }

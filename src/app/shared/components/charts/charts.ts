import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  Inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ChartConfig } from './chart-interfaces';
import { isPlatformBrowser } from '@angular/common';
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    effect(() => {
      const config = this.chartConfig(); // access the signal
      console.log('Chart config changed:', config);
      if (this.chartInstance) {
        // this.chart.config = config;
        // this.chartInstance.update();
        setTimeout(() => {
          this.createChart();
        }, 100);
      }
    });
  }


  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
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
      // case 'mixedChart':
      //   this.chartInstance = new Chart(ctx, {
      //     type: 'bar',
      //     data: config.data,
      //     options: config.options,
      //     // config.options || baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Revenue', 'Amt in ₹ Cr'),
      //   });
      //   break;
      // For gauge chart use gaugeChartOptions
      case 'gaugeChart':
        const plugins = [];
        if (config.options?.plugins?.customDataLabel?.enabled) {
          plugins.push(this.customDataLabel);
        }

        this.chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: config.labels,
            datasets: config.datasets,
          },
          options: config.options,
          plugins,
        });
        break;
      case 'scatterChart':
        this.chartInstance = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: config.datasets, // No labels for scatter
          },
          options: config.options,
        });
        break;
      default:
        console.warn(`Unknown chart type: ${config.chartType}`);
        break;
    }
  }

  // Helper: To add text on pie chart.
  customDataLabel = {
    id: 'customDataLabel',
    afterDatasetsDraw(chart: Chart) {
      const pluginOpts = chart.options.plugins?.customDataLabel;
      if (!pluginOpts?.enabled) return;

      const format = pluginOpts.format || '';
      const { ctx } = chart;

      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);

        meta.data.forEach((element, index) => {
          const rawValue = Number(dataset.data[index]);
          if (rawValue) {
            const label = `${rawValue}${format}`;
            const position = element.tooltipPosition(true);

            ctx.font = '500 10px Montserrat';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, position.x, position.y);
          }
        });
      });
    }
  };


  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
}

// // Sample/ Examples
// // Bar Chart
// {
//   chartId: 'bar0',
//     chartType: 'barChart',
//       labels: ['2020-21', '2021-22', '2022-23'],
//         datasets: [
//           {
//             type: 'line',
//             label: 'Y-o-Y Growth',
//             data: [2937, 3524, 3883],
//             borderWidth: 2,
//             borderColor: this.lineColor,
//             pointBackgroundColor: this.lineColor,
//             fill: false,
//             tension: 0.3,
//           },
//           {
//             type: 'bar',
//             label: 'ULB Name',
//             data: [2937, 3524, 3883],
//             backgroundColor: [this.graphColors[0]],
//             borderRadius: 5,
//             barThickness: 60,
//           },
//           {
//             type: 'bar',
//             label: 'National Avg',
//             data: [1576, 1946, 3037],
//             backgroundColor: [this.graphColors[1]],
//             borderRadius: 5,
//             barThickness: 60,
//           }
//         ],
//           options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
//     }

// // Mixed Chart
// {
//   chartId: 'mixed0',
//     chartType: 'barChart',
//       labels: ['2020-21', '2021-22', '2022-23'],
//         datasets: [
//           {
//             type: 'line',
//             label: 'Y-o-Y Growth',
//             data: [2937, 3524, 3883],
//             borderWidth: 2,
//             borderColor: this.lineColor,
//             pointBackgroundColor: this.lineColor,
//             fill: false,
//             tension: 0.3,
//           },
//           {
//             type: 'bar',
//             label: 'ULB Name',
//             data: [2937, 3524, 3883],
//             backgroundColor: [this.graphColors[0]],
//             borderRadius: 5,
//             barThickness: 60,
//           },
//           {
//             type: 'bar',
//             label: 'National Avg',
//             data: [1576, 1946, 3037],
//             backgroundColor: [this.graphColors[1]],
//             borderRadius: 5,
//             barThickness: 60,
//           },
//           // {
//           //   type: 'bar',
//           //   label: 'National Avg',
//           //   data: [1576, 1946, 3037],
//           //   backgroundColor: [this.graphColors[2]],
//           //   borderRadius: 5,
//           //   // barThickness: 60,
//           // },
//           // {
//           //   type: 'bar',
//           //   label: 'National Avg',
//           //   data: [1576, 1946, 3037],
//           //   backgroundColor: [this.graphColors[3]],
//           //   borderRadius: 5,
//           //   // barThickness: 60,
//           // },
//         ],
//           options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
//     },

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

// Example 2:
// {
//   chartId: 'pie1',
//     chartType: 'gaugeChart',
//       // labels: ['Own Source Revenue', 'Grants', 'Assigned Revenue'],
//       datasets: [
//         {
//           label: 'Pie Dataset 3',
//           data: [30, 10, 20, 20, 20, 10],
//           backgroundColor: this.graphColors.slice(0, 7),
//           borderRadius: 3,
//           borderWidth: 1,
//         },
//       ],
//         options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', ''),
//     },

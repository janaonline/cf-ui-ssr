import { Component, Input, signal } from '@angular/core';
import { ChartConfig } from '../../../../../shared/components/charts/chart-interfaces';
import { doughnutChartConfig } from './chartConfig';
import { Charts } from "../../../../../shared/components/charts/charts";

@Component({
  selector: 'app-mix-chart',
  imports: [Charts],
  templateUrl: './mix-chart.html',
  styleUrl: './mix-chart.scss'
})
export class MixChart {
  colourArray: any = [];
  chartsData = signal<ChartConfig[]>([])
  // tableData: any;
  // revnueChartData: any;
  @Input() responseData: any = {};
  @Input() compareType: string = '';
  // @Input() chartType = 'barChart';
  // gaugechartBGColor = [];

  constructor() {

  }

  ngOnInit() {
    console.log('this.responseData', this.responseData);
    this.configureChartData();
  }

  configureChartData() {
    const chartData: any = [];
    let chart;
    if (this.compareType === 'ulbType' || this.compareType === 'popType') {
      Object.keys(this.responseData).forEach((ele, i) => {
        if (i === 0) {
          this.colourArray = this.generateChartColor(this.responseData[ele]);
        }
        chart = this.createDoughnutChartData(this.responseData[ele], ele);
        chartData.push(chart);
      });
    } else {
      this.colourArray = this.generateChartColor(this.responseData);
      console.log('this.colourArray', this.colourArray);
      chart = this.createDoughnutChartData(this.responseData, 'state');
      chartData.push(chart);
    }
    this.chartsData.set(chartData)
    console.log('chartData', chartData);
  }
  generateChartColor(arr: any) {
    console.log('arr', arr);
    return arr.sort((a: any, b: any) => a._id.localeCompare(b._id)).map((ele: any) => ({ color: ele.colour, lineitem: ele._id }));
  }
  createDoughnutChartData(arr: any, label: string): ChartConfig {
    // sort by _id before genearate data
    arr = arr.sort((a: any, b: any) => a._id.localeCompare(b._id));
    // total amount
    const total = arr.reduce((sum: number, item: any) => sum + item.amount, 0);

    // labels & data arrays
    const labels = arr.map((item: any) => item._id);
    const colors = arr.map((item: any) => item.colour);
    const data = arr.map((item: any) => Math.round(Number(((item.amount / total) * 100))));

    const chart: any = JSON.parse(JSON.stringify(doughnutChartConfig));
    chart.chartId = 'chart-12';
    chart.datasets[0].label = label;//this.stateDetails().state.name;
    chart.datasets[0].data = data;
    chart.labels = labels;
    chart.options.plugins.legend.display = false;
    chart.datasets[0].backgroundColor = colors;

    return chart;
  }
}

import { Component, Input, input, signal } from '@angular/core';
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
  chartsData = signal<ChartConfig[]>([]);
  @Input() responseData: any = {};
  @Input() compareType: string = '';
  @Input() mixChartObj: { key: string; label: string; }[] = [];
  // stateDetails = input.required<any>();

  types: any = {
    ulbType: [
      // { key: 'state', label: 'State' },
      { key: 'mData', label: 'Municipality' },
      { key: 'mcData', label: 'Municipal Corporation' },
      { key: 'tpData', label: 'Town Panchayat' },
    ],
    popType: [
      // { key: 'state', label: 'State' },
      { key: '<100k', label: '<100K' },
      { key: '100k-500k', label: '100K-500K' },
      { key: '500k-1M', label: '500K-1M' },
      { key: '1m-4m', label: '1M-4M' },
      { key: '4m+', label: '4M+' },
    ],
  }

  ngOnInit() {
    // console.log('this.responseData----', this.responseData);
    this.configureChartData();
  }

  configureChartData() {
    const chartData: any = [];
    let chart;
    if (this.compareType) {
      // this.types[this.compareType][0].label = this.stateDetails().state.name;
      const order: any = [...this.mixChartObj, ... this.types[this.compareType]];
      order.forEach((ele: any, i: number) => {
        if (i === 0) {
          this.colourArray = this.generateChartColor(this.responseData[ele.key]);
        }
        let typeData = this.responseData[ele.key];
        if (this.compareType === 'ulbType' && !['state', 'ulb'].includes(ele.key)) {
          typeData = this.responseData[ele.key][0];
        }
        if (typeData?.length !== 0) {
          chart = this.createDoughnutChartData(typeData, ele.label);
          chartData.push(chart);
        }
      });
    } else {
      if (this.mixChartObj.length === 2) {
        // if both state and ulb data is present
        this.mixChartObj.forEach((ele: any) => {
          this.colourArray = this.generateChartColor(this.responseData[ele.key]);
          chart = this.createDoughnutChartData(this.responseData[ele.key], ele.label);
          chartData.push(chart);
        });
      } else {
        // only state data
        this.colourArray = this.generateChartColor(this.responseData);
        chart = this.createDoughnutChartData(this.responseData, this.mixChartObj[0].label);
        chartData.push(chart);
      }
    }
    this.chartsData.set(chartData)
    // console.log('chartData', chartData);
  }
  generateChartColor(arr: any) {
    // console.log('arr', arr);
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
    const data = arr.map((item: any) => {
      return item.amount ? Math.round(Number(((item.amount / total) * 100))) : 0;
    });

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

import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { baseChartOptions, DEFAULT_FONT_FAMILY, gaugeChartOptions } from '../../../../shared/components/charts/constants';
import { Charts } from "../../../../shared/components/charts/charts";
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { barChartConfig, guageChartConfig } from './chartConfig';

@Component({
  selector: 'app-national-chart',
  imports: [CommonModule, Charts],
  templateUrl: './national-chart.html',
  styleUrl: './national-chart.scss'
})
export class NationalChart {

  chartsData = signal<ChartConfig[]>([])
  tableData: any;
  revnueChartData: any;
  @Input() stateName: string = '';
  @Input() responseData: any = {};
  @Input() chartType = 'barChart';
  gaugechartBGColor = [];

  ngOnInit() {
    if (this.chartType === 'barChart') {
      this.creatBarChartData();
    } else {
      console.log('this.responseData', this.responseData);
      this.createGaugeChartData();
    }
  }

  createGaugeChartData() {
    const chartData: any = []
    this.gaugechartBGColor = this.responseData.colourArray.sort((a: any, b: any) => a.lineitem.localeCompare(b.lineitem)).map((ele: any) => ele.colour);
    const gaugeChart = this.generateGuageData(this.responseData, 'national');
    gaugeChart.datasets[0].label = 'National';
    chartData.push(gaugeChart);

    if (this.stateName) {
      const gaugeChartState = this.generateGuageData(this.responseData, 'state');
      gaugeChartState.datasets[0].label = this.stateName;
      chartData.push(gaugeChartState);
    }

    Object.keys(this.responseData.individual).forEach((ele, i) => {
      const gaugeChart = this.generateGuageData(this.responseData.individual, ele);
      chartData.push(gaugeChart);
    });
    console.log('chartData---', chartData);
    this.chartsData.set(chartData)
  }

  generateGuageData(typeData: any, ele: string) {
    const labels: any[] = Object.keys(typeData[ele]).sort(([a], [b]) => a.localeCompare(b));
    const data = labels.map((line) => typeData[ele][line]);
    // console.log('typeData', typeData[ele], ' ele', ele, 'this.getPercentageData(data)', this.getPercentageData(data));


    const gaugeChart = JSON.parse(JSON.stringify(guageChartConfig));
    gaugeChart.chartId = 'chart-' + ele;
    gaugeChart.datasets[0].label = ele;
    gaugeChart.datasets[0].data = this.getPercentageData(data);
    gaugeChart.labels = labels;
    gaugeChart.options.plugins.legend.display = false;
    gaugeChart.datasets[0].backgroundColor = this.gaugechartBGColor;
    return gaugeChart;
  }

  getPercentageData(arr: number[]) {
    const total = arr.reduce((sum, val) => sum + val, 0);
    return arr.map(val => (Math.round((val / total) * 100)));
  }

  creatBarChartData() {

    const { labels, values } = this.responseData.rows.reduce((acc: any, { ulb_pop_category, revenue }: any) => {
      if (!['Average', 'All ULBs'].includes(ulb_pop_category)) {
        acc.labels.push(ulb_pop_category);
        acc.values.push(Number(revenue)); // ensure number
      }
      return acc; // always return accumulator
    }, { labels: [], values: [] });

    const barChartData = barChartConfig;
    barChartData.labels = labels;
    barChartData.datasets[0].data = values;
    const charts: any = [barChartData];
    this.chartsData.set(charts)
  }

}

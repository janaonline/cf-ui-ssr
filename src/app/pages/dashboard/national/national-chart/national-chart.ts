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
  @Input() responseData: any = {};
  @Input() chartType = 'barChart';

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
    const gaugeChart = this.generateGuageData(this.responseData, 'national');
    chartData.push(gaugeChart);
    Object.keys(this.responseData.individual).forEach((ele, i) => {
      const gaugeChart = this.generateGuageData(this.responseData.individual, ele);
      chartData.push(gaugeChart);
    });
    console.log('chartData---', chartData);
    this.chartsData.set(chartData)


    // const result = Object.keys(this.responseData.individual).map((ele) => {
    //   const lines = Object.keys(this.responseData.individual[ele]); // revenue categories
    //   const data = lines.map((line) => this.responseData.individual[ele][line]); // values
    //   return { label: ele, data }; // return each category with its values
    // });

  }

  generateGuageData(typeData: any, ele: string) {
    const labels: any[] = Object.keys(typeData[ele]); // revenue categories
    const data = labels.map((line) => typeData[ele][line]); // 

    const gaugeChart = JSON.parse(JSON.stringify(guageChartConfig));
    gaugeChart.chartId = 'chart-' + ele;
    gaugeChart.datasets[0].label = ele;
    gaugeChart.datasets[0].data = data;
    gaugeChart.labels = labels;
    gaugeChart.options.plugins.legend.display = false;
    gaugeChart.datasets[0].backgroundColor = this.responseData.colourArray.map((ele: any) => ele.colour);
    return gaugeChart;
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

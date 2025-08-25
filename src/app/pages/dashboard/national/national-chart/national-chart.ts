import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from "../../../../material.module";
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from "../../../../shared/components/charts/charts";
import { NationalService } from '../national.service';
import { barChartConfig, deficitBarChartData, guageChartConfig } from './chartConfig';

@Component({
  selector: 'app-national-chart',
  imports: [Charts, FormsModule, MaterialModule],
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
  barGraphDropdown: any = [
    { name: "Revenue", value: "revenue", code: "Revenue" },
    { name: "Revenue Per Capita", value: "revenuePerCapita", code: "Revenue" },

    { name: "Expenditure", value: "expenditure", code: "Expenditure" },
    {
      name: "Expenditure Per Capita",
      value: "expenditurePerCapita",
      code: "Expenditure",
    },

    // { name: "Own Revenue", value: "ownRevenue", code: "Own Revenue" },
    { name: "Own Revenue", value: "Ownrevenue", code: "Own Revenue" },
    {
      name: "Own Revenue Per Capita",
      // value: "ownRevenuePerCapita",
      value: "OwnrevenuePerCapita",
      code: "Own Revenue",
    },

    {
      name: "Capital Expenditure",
      // value: "capitalExpenditure",
      value: "amount",
      code: "Capital Expenditure",
    },
    {
      name: "Capital Expenditure Per Capita",
      // value: "capitalExpenditurePerCapita",
      value: "perCapita",
      code: "Capital Expenditure",
    },
  ];
  barChartOptions = this.barGraphDropdown;
  selectedGraphValue: string = 'revenue';

  constructor(public nationalService: NationalService) { }

  ngOnInit() {
    // console.log('this.nationalService.selectedTabName()', this.nationalService.selectedTabName())
    this.barChartOptions = this.barGraphDropdown.filter(
      (item: any) => item.code == this.nationalService.selectedTabName()
    );
    this.selectedGraphValue = this.barChartOptions[0]?.value;
    if (this.chartType === 'barChart') {
      this.creatBarChartData();
    } else {
      // console.log('this.responseData', this.responseData);
      this.createGaugeChartData();
    }
  }

  selectGraphMode(event: any) {
    // this.selectedGraphValue = event.target.value;

    this.creatBarChartData();
  }
  createGaugeChartData() {
    const chartData: any = [];
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
    // console.log('this.responseData', this.selectedGraphValue);

    this.selectedGraphValue = this.selectedGraphValue || 'revenue';

    // const { labels, values } = this.responseData.rows.reduce((acc: any, { ulb_pop_category, revenue }: any) => {
    const { labels, values, expenses } = this.responseData.rows.reduce((acc: any, item: any) => {
      const excludeList = ['Average', 'All ULBs'];
      if (!excludeList.includes(item['ulb_pop_category']) && !excludeList.includes(item['ulbType'])) {
        if (this.nationalService.selectedButtonKey() === 'Deficit or Surplus') {
          acc.values.push(Number(item['revenue'])); // ensure number
          acc.labels.push(item['ulbType']);
          acc.expenses.push(Number(item['expense'])); // ensure number
        } else {
          acc.labels.push(item['ulb_pop_category']);
          acc.values.push(Number(item[this.selectedGraphValue])); // ensure number
        }
      }

      return acc; // always return accumulator
    }, { labels: [], values: [], expenses: [] });
    // console.log('labels, values', labels, values, expenses);
    const barChartData = JSON.parse(JSON.stringify(barChartConfig));
    if (this.nationalService.selectedButtonKey() === 'Deficit or Surplus') {
      barChartData.options.scales.y.title.text = 'Revenu and Expenditure';
      barChartData.datasets = deficitBarChartData;
      barChartData.datasets[1].data = expenses;
    } else {
      const yAxisLabel = this.barChartOptions.find((item: any) => item.value === this.selectedGraphValue)?.name || 'Revenue';
      barChartData.options.scales.y.title.text = yAxisLabel + (this.selectedGraphValue.includes('PerCapita') ? ' (in Rs)' : ' (in Cr)');
    }
    barChartData.labels = labels;
    barChartData.datasets[0].data = values;
    const charts: any = [barChartData];
    // barChartData.update()
    this.chartsData.set(charts)
  }

}

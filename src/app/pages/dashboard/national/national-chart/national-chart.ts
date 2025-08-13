import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../shared/components/charts/constants';
import { Charts } from "../../../../shared/components/charts/charts";
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';

@Component({
  selector: 'app-national-chart',
  imports: [CommonModule, Charts],
  templateUrl: './national-chart.html',
  styleUrl: './national-chart.scss'
})
export class NationalChart {

  chartsData = signal<ChartConfig[]>([
    {
      "chartId": "barChart_0",
      "chartType": "barChart",
      "labels": ["4M+", "1M-4M", "500K-1M", "100K-500K", "<100K"],
      "datasets": [
        {
          "type": "line",
          "label": "National Avg",
          "data": [4419, 4391, 5587, 1000, 2000],
          "borderColor": "#f43f5e",
          "pointBackgroundColor": "#f43f5e",
          "borderWidth": 2,
          "fill": false,
          "tension": 0.3
        },
        {
          "type": "bar",
          "label": "Revenue",
          "data": [4419, 4391, 5587, 2000, 1000],
          "backgroundColor": "#62b6cb",
          "barThickness": 70,
          "borderRadius": 5
        },
      ],
      options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Amt in cr', 'Years'),
    },
    // {
    //   "chartId": "gaugeChart_0",
    //   "chartType": "gaugeChart",
    //   "datasets": [
    //     {
    //       "label": "National",
    //       "data": [69, 0, 29, 0, 1],
    //       "backgroundColor": ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743", "#f43f5e", "#B388FF"],
    //       "borderRadius": 3,
    //       "borderWidth": 1
    //     }
    //   ],
    //   options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
    // },
    // {
    //   "chartId": "gaugeChart_1",
    //   "chartType": "gaugeChart",
    //   "datasets": [
    //     {
    //       "label": "4M+",
    //       "data": [52, 0, 46, 0, 1],
    //       "backgroundColor": ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743", "#f43f5e", "#B388FF"],
    //       "borderRadius": 3,
    //       "borderWidth": 1
    //     }
    //   ],
    //   options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
    // },
    // {
    //   "chartId": "gaugeChart_2",
    //   "chartType": "gaugeChart",
    //   "datasets": [
    //     {
    //       "label": "1M-4M",
    //       "data": [52, 0, 46, 0, 1, 20, 30],
    //       "backgroundColor": ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743", "#f43f5e", "#B388FF"],
    //       "borderRadius": 3,
    //       "borderWidth": 1
    //     }
    //   ],
    //   options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
    // },
    // {
    //   "chartId": "gaugeChart_3",
    //   "chartType": "gaugeChart",
    //   "datasets": [
    //     {
    //       "label": "500K-1M",
    //       "data": [10, 20, 36, 40, 10],
    //       "backgroundColor": ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743", "#f43f5e", "#B388FF"],
    //       "borderRadius": 3,
    //       "borderWidth": 1
    //     }
    //   ],
    //   options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
    // },
    // {
    //   "chartId": "gaugeChart_4",
    //   "chartType": "gaugeChart",
    //   "datasets": [
    //     {
    //       "label": "100K-500K",
    //       "data": [32, 20, 36, 0, 10],
    //       "backgroundColor": ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743", "#f43f5e", "#B388FF"],
    //       "borderRadius": 3,
    //       "borderWidth": 1
    //     }
    //   ],
    //   options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
    // },
    // {
    //   "chartId": "gaugeChart_5",
    //   "chartType": "gaugeChart",
    //   "datasets": [
    //     {
    //       "label": "<100K",
    //       "data": [40, 0, 46, 0, 12],
    //       "backgroundColor": ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743", "#f43f5e", "#B388FF"],
    //       "borderRadius": 3,
    //       "borderWidth": 1
    //     }
    //   ],
    //   options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
    // },
  ])
}

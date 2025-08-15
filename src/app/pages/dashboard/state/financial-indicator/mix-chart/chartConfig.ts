import { baseChartOptions, DEFAULT_FONT_FAMILY } from "../../../../../shared/components/charts/constants";

export const doughnutChartConfig = {
    "chartId": "dooughnutChart_0",
    "chartType": "gaugeChart",
    "labels": [] as string[],
    "datasets": [
        {
            "label": "National",
            // "data": [69, 0, 29, 0, 1],
            "data": [] as number[],
            "backgroundColor": [],
            "borderRadius": 3,
            "borderWidth": 1
        }
    ],
    options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
};
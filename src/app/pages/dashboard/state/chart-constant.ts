import { ChartConfig } from "../../../shared/components/charts/chart-interfaces";
import { gaugeChartOptions } from "../../../shared/components/charts/constants";

export const gaugeChartConfig: ChartConfig = {
    "chartId": "slb0",
    "chartType": "gaugeChart",
    "labels": [""],
    "datasets": [
        {
            "label": "Data available",
            "data": [0, 100],
            "backgroundColor": ["rgba(51, 96, 219, 1)", "rgba(218, 226, 253, 1)"],
            "borderWidth": 1,
            "borderRadius": 5,
            cutout: '70%',
        }
    ],
    "options": gaugeChartOptions,
    "additionalInfo": {
        "value": 95,
        "indicatorName": "Data Standardized (2021-22)",
        "nationalAvg": 0,
        "unit": "%"
    }
}

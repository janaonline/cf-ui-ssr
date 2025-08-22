import { ChartConfig } from "../../../../shared/components/charts/chart-interfaces";
import { baseChartOptions, DEFAULT_FONT_FAMILY } from "../../../../shared/components/charts/constants";

export const barChart: ChartConfig = {
    chartId: 'barChart1',
    chartType: 'barChart',
    labels: [],
    datasets: [],
    options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
}
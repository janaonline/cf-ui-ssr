export type ChartType =
  | 'barChart'
  | 'lineChart'
  | 'pieChart'
  | 'mixedChart'
  | 'gaugeChart'
  | 'doughnut';

export interface ChartDataSet {
  type?: 'bar' | 'line'; // For mixed charts
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  pointBackgroundColor?: string;
  borderRadius?: number;
  tension?: number;
  fill?: boolean;
}

export interface ChartOptions {
  // Include Chart.js options or your own abstraction
  //   pointBackgroundColor: string;
  //   borderRadius: number;
}

export interface SlbData {
  indicatorName: string;
  value: number;
  nationalAvg: number;
  unit: string;
}

// Common chart (not mixed)
export interface BaseChartConfig {
  chartId: string;
  chartType: Exclude<ChartType, 'mixedChart'>;
  labels?: string[];
  datasets: ChartDataSet[];
  options?: ChartOptions;
  additionalInfo?: SlbData;
}

// Mixed chart
export interface MixedChartConfig {
  chartId: string;
  chartType: 'mixedChart';
  data: {
    labels?: string[];
    datasets: ChartDataSet[];
  };
  labels: string[];
  options?: ChartOptions;
  additionalInfo?: SlbData;
}

export type ChartConfig = BaseChartConfig | MixedChartConfig;

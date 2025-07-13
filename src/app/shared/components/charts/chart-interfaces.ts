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
  data: (number | null)[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  pointBackgroundColor?: string;
  borderRadius?: number;
  tension?: number;
  fill?: boolean;
  barThickness?: number;
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
  chartType: ChartType;
  labels?: string[];
  datasets: ChartDataSet[];
  options?: ChartOptions;
  additionalInfo?: SlbData;
}

// Mixed chart
// export interface MixedChartConfig {
//   chartId: string;
//   chartType: 'mixedChart';
//   data: {
//     labels?: string[];
//     datasets: ChartDataSet[];
//   };
//   labels: string[];
//   options?: ChartOptions;
//   additionalInfo?: SlbData;
// }


export interface ChartResStruct {
  chartType: ChartType;
  labels: string[];
  legendColors: string[];
  axes?: { x: string, y: string }
  data:
  {
    type?: string;
    label: string;
    data: (number | null)[];
    backgroundColor?: string[];
  }[];
}

// export type ChartConfig = BaseChartConfig | MixedChartConfig;
export type ChartConfig = BaseChartConfig;

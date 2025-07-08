import { ChartOptions } from 'chart.js';

export const DEFAULT_FONT_FAMILY = 'Montserrat';
const TEXT_LIGHT = '#374151';
const DEFAULT_FONT_SIZE = 11;
export const baseChartOptions = (
  fontFamily = 'DEFAULT_FONT_FAMILY',
  showAxes = true,
  xAxisLabel = 'X Axis',
  yAxisLabel = 'Y Axis'
): ChartOptions => ({
  responsive: true,
  maintainAspectRatio: false,
  // aspectRatio: 1,
  font: { family: fontFamily, size: 11 },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: { labels: { font: { family: fontFamily, size: 12 } } },
    tooltip: {
      titleFont: { family: fontFamily },
      bodyFont: { family: fontFamily },
    },
  },
  layout: { padding: 5 },
  scales: {
    x: {
      display: showAxes,
      ticks: { font: { family: fontFamily } },
      title: {
        display: showAxes,
        text: xAxisLabel,
        font: {
          family: fontFamily,
          size: DEFAULT_FONT_SIZE,
          weight: 'bold',
        },
        color: TEXT_LIGHT,
      },
    },
    y: {
      display: showAxes,
      ticks: { font: { family: fontFamily } },
      title: {
        display: showAxes,
        text: yAxisLabel,
        font: {
          family: fontFamily,
          size: DEFAULT_FONT_SIZE,
          weight: 'bold',
        },
        color: TEXT_LIGHT,
      },
    },
  },
});

export const gaugeChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1,
  circumference: 180,
  rotation: 270,
  cutout: '55%',
  plugins: {
    legend: { display: false },
    tooltip: {
      filter: (tooltipItem) => tooltipItem.dataIndex === 0,
    },
  },
};

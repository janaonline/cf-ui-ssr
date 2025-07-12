export type ChartType =
    | 'barChart'
    | 'lineChart'
    | 'pieChart'
    | 'mixedChart'
    | 'gaugeChart'
    | 'doughnut';

export interface resStruct {
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

// export const res: resStruct = {
//     chartType: 'barChart',
//     labels: ['2020-21', '2021-22', '2022-23'],
//     legendColors: [],
//     axes: { x: 'Years', y: 'Amt in ₹ Cr' },
//     data: [
//         {
//             type: 'line',
//             label: 'Y-o-Y Growth',
//             data: [2937, 3524, 3883],
//             backgroundColor: ['#f43f5e'],
//         },
//         {
//             type: 'bar',
//             label: 'ULB Name',
//             data: [2937, 3524, 3883],
//             backgroundColor: ["#62b6cb"],
//         },
//         {
//             type: 'bar',
//             label: 'National Avg',
//             data: [1576, 1946, 3037],
//             backgroundColor: ["#1b4965"],
//         },
//         // {
//         //     type: 'bar',
//         //     label: 'National Avg',
//         //     data: [1576, 1946, 3037],
//         //     backgroundColor: ["#bee9e8"],
//         // },
//     ]
// }


// PIE CHART
export const res: resStruct = {
    chartType: 'gaugeChart',
    labels: ['Own Revenue', 'Income from Investment', 'Assigned Revenues Compensation', 'Grants', 'Interest Income'],
    legendColors: ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743"],
    data: [
        {
            label: 'ULB Name',
            data: [30, 10, 20, 20, 20, 10],
        },
        {
            label: 'State Municipal Corporation Avg',
            data: [10, 20, 30, 20, 20, 10],
        }
    ]
}

// setTimeout(() => {
//     this.output.set(res);
//     this.chartsData = res.data.map((chart, idx) => {
//         return {
//             chartId: `${res.chartType}_${idx}`,
//             chartType: `${res.chartType}`,
//             datasets: [
//                 {
//                     label: chart.label,
//                     data: chart.data,
//                     backgroundColor: res.legendColors,
//                     borderRadius: 3,
//                     borderWidth: 1,
//                 },
//             ],
//             options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', ''),
//         }
//     })
// }, 2000);


// BAR CHART
// export const res: resStruct = {
//     chartType: 'barChart',
//     labels: [],
//     legendColors: [],
//     data: [
//         {
//             type: 'line',
//             label: 'Y-o-Y Growth',
//             data: [2937, 3524, 3883],
//             backgroundColor: ['#f43f5e'],
//         },
//         {
//             type: 'bar',
//             label: 'ULB Name',
//             data: [2937, 3524, 3883],
//             backgroundColor: ["#62b6cb"],
//         },
//         {
//             type: 'bar',
//             label: 'National Avg',
//             data: [1576, 1946, 3037],
//             backgroundColor: ["#1b4965"],
//         },
//         // {
//         //     type: 'bar',
//         //     label: 'National Avg',
//         //     data: [1576, 1946, 3037],
//         //     backgroundColor: ["#bee9e8"],
//         // },
//     ]
// }

// setTimeout(() => {
//     this.output.set(res);

//     const obj: ChartConfig = {
//         chartId: `${res.chartType}_0`,
//         chartType: `${res.chartType}`,
//         labels: ['2020-21', '2021-22', '2022-23'],
//         datasets: [],
//         options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
//     };

//     const barThickness = res.data.length > 4 ? { barThickness: 60 } : {};

//     res.data.forEach((chart) => {
//         if (chart.type === 'line') {
//             obj.datasets.push({
//                 type: 'line',
//                 label: chart.label,
//                 data: chart.data,
//                 borderColor: chart.backgroundColor?.[0],
//                 pointBackgroundColor: chart.backgroundColor?.[0],
//                 borderWidth: 2,
//                 fill: false,
//                 tension: 0.3,
//             });
//         } else {
//             obj.datasets.push({
//                 type: 'bar',
//                 label: chart.label,
//                 data: chart.data,
//                 backgroundColor: chart.backgroundColor?.[0],
//                 borderRadius: 5,
//                 ...barThickness
//             });
//         }
//     });

//     this.chartsData = [obj];
//     console.log(this.chartsData)
// }, 2000);
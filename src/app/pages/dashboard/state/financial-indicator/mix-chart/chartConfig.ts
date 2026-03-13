import { baseChartOptions, DEFAULT_FONT_FAMILY } from "../../../../../shared/components/charts/constants";
// import { baseChartOptions, DEFAULT_FONT_FAMILY } from "../../../../shared/components/charts/constants"
// export const doughnutChartConfig: any = {
//     "chartId": "doughnutChart_0",
//     "chartType": "doughnutChart",
//     // "chartType": "gaugeChart",
//     "labels": [] as string[],
//     "datasets": [
//         {
//             "label": "National",
//             "data": [] as number[],
//             "borderRadius": 3,
//             "borderWidth": 1,
//             hoverOffset: 4
//         }
//     ],
//     options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         // aspectRatio: 1,
//         font: { size: 11 },
//         plugins: {
//             customDataLabel: {
//                 enabled: true,
//                 format: '%'
//             },
//             datalabels: {
//                 display: false, // Ensure labels are always displayed
//                 color: 'black', // Set label color

//             },
//             legend: {
//                 position: 'top',
//             },
//         }
//     },
//     // options: doughnutChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
// }
export const doughnutChartConfig = {
    "chartId": "dooughnutChart_0",
    "chartType": "doughnutChart",
    "labels": [] as string[],
    "datasets": [
        {
            "label": "National",
            // "data": [69, 0, 29, 0, 1],
            "data": [] as number[],
            // "backgroundColor": [],
            "borderRadius": 3,
            "borderWidth": 1,
            // "offset": 0,
            hoverOffset: 4
        }
    ],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        // aspectRatio: 1,
        font: { size: 11 },
        plugins: {
            customDataLabel: {
                enabled: true,
                format: '%'
            },
            datalabels: {
                display: false, // Ensure labels are always displayed
                color: 'black', // Set label color

            },
            legend: {
                position: 'top',
            },
        }
    },
    // options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
};
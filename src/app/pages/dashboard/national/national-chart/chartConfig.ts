import { baseChartOptions, DEFAULT_FONT_FAMILY } from "../../../../shared/components/charts/constants";

export const deficitBarChartData: any = [
    {
        data: [],
        label: "Revenue",
        backgroundColor: "#456EDE",
        borderWidth: 1,
        barThickness: 40,
    },
    {
        data: [],

        label: "Expense",
        backgroundColor: "#000",
        borderWidth: 1,
        barThickness: 40,
    },
    // {
    //     type: "line",
    //     label: "National Revenue Average",
    //     data: [80, 80, 80, 80, 80, 80],
    //     fill: false,
    //     borderColor: "#fc4185",
    // },
    // {
    //     type: "line",
    //     label: "National Expense Average",
    //     data: [80, 80, 80, 80, 80, 80],
    //     fill: false,
    //     borderColor: "red",
    // }
];
export const barChartConfig = {
    "chartId": "barChart_0",
    "chartType": "barChart",
    // "labels": ["4M+", "1M-4M", "500K-1M", "100K-500K", "<100K"],
    "labels": [],
    "datasets": [
        {
            "type": "bar",
            "label": "Revenue",
            // "data": [4419, 4391, 5587, 2000, 1000],
            "data": [],
            backgroundColor: "#456EDE",
            borderWidth: 1,
            barThickness: 40,
        },
        // {
        //     "type": "line",
        //     "label": "National Avg",
        //     "data": [],
        //     "borderColor": "#f43f5e",
        //     "pointBackgroundColor": "#f43f5e",
        //     "borderWidth": 2,
        //     "fill": false,
        //     "tension": 0.3
        // },
    ],
    options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Average', 'Revenue in Cr'),
};

export const guageChartConfig = {
    "chartId": "gaugeChart_0",
    "chartType": "gaugeChart",
    "labels": [] as string[],
    "datasets": [
        {
            "label": "National",
            // "data": [69, 0, 29, 0, 1],
            "data": [] as number[],
            "backgroundColor": ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743", "#f43f5e", "#B388FF"],
            "borderRadius": 3,
            "borderWidth": 1
        }
    ],
    options: baseChartOptions(DEFAULT_FONT_FAMILY, false, '', '', true, '%'),
};

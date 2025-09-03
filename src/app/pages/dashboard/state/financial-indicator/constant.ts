
export const buttons = [
    {
        "key": "Revenue",
        "label": "Revenue"
    },
    {
        "key": "Own Revenue",
        "label": "Own Revenue"
    },
    {
        "key": "Expenditure",
        "label": "Expenditure"
    },
    {
        "key": "Capital Expenditure",
        "label": "Capital Expenditure"
    }
]

export const subButtons = {
    "Revenue": {
        "text": "Money received or earned by a ULB during the financial year.",
        "buttons": [
            {
                "key": "Total Revenue",
                "label": "Total Revenue"
            },
            {
                "key": "Revenue Per Capita",
                "label": "Revenue Per Capita"
            },
            {
                "key": "Revenue Mix",
                "label": "Revenue Mix"
            }
        ]
    },
    "Own Revenue": {
        "text": "Money received or earned by a ULB from its own sources during a financial year, including from taxes, fees, user charges, etc.",
        "buttons": [
            {
                "key": "Total Own Revenue",
                "label": "Total Own Revenue"
            },
            {
                "key": "Own Revenue per Capita",
                "label": "Own Revenue per Capita"
            },
            {
                "key": "Own Revenue Mix",
                "label": "Own Revenue Mix"
            }
        ]
    },
    "Expenditure": {
        "text": "Money received or earned by a ULB during a financial year.",
        "buttons": [
            {
                "key": "Total Surplus/Deficit",
                "label": "Total Surplus/Deficit"
            },
            {
                "key": "Expenditure Mix",
                "label": "Expenditure Mix"
            },
            {
                "key": "Revenue Expenditure Mix",
                "label": "Revenue Expenditure Mix"
            },
            {
                "key": "Revenue Expenditure",
                "label": "Revenue Expenditure"
            }
        ]
    },
    "Capital Expenditure": {
        "text": "Expenditure incurred by a ULB during a financial year on building long-term assets, including infrastructure.",
        "buttons": [
            {
                "key": "Capital Expenditure",
                "label": "Capital Expenditure"
            },
            {
                "key": "Capital Expenditure Per Capita",
                "label": "Capital Expenditure Per Capita"
            }
        ]
    }
};

export const stateDashboardSubTabsList: any = [
    // Revenue Tab -> Sub Tabs
    { name: "Total Revenue", code: "TotalRevenue", yAxisLabel: 'Amount (in Cr.)', countAccessKey: "sum", chartAnimation: 'croreBarChartOptions', isCodeRequired: false },
    { name: "Revenue Per Capita", code: "RevenuePerCapita", yAxisLabel: 'Amount (in INR)', countAccessKey: "revenuePerCapita", chartAnimation: 'defaultBarChartOptions', isCodeRequired: false },
    { name: "Revenue Mix", code: "RevenueMix", yAxisLabel: 'Amount (in Cr.)', countAccessKey: "sum", chartAnimation: 'croreBarChartOptions', isCodeRequired: true },

    // Expenditure Tab -> Sub Tabs

    { name: "Total Surplus/Deficit", code: "DeficitOrSurplus", yAxisLabel: 'Amount (in Cr.)', countAccessKey: "deficitOrSurplus", chartAnimation: 'croreBarChartOptions', isCodeRequired: false },
    { name: "Expenditure Mix", code: "ExpenditureMix", yAxisLabel: 'Amount (in Cr.)', countAccessKey: "sum", chartAnimation: 'croreBarChartOptions', isCodeRequired: true },
    { name: "Revenue Expenditure Mix", code: "RevenueExpenditureMix", yAxisLabel: 'Amount (in Cr.)', countAccessKey: "sum", chartAnimation: 'croreBarChartOptions', isCodeRequired: false },
    { name: "Revenue Expenditure", code: "RevenueTotalExpenditure", yAxisLabel: 'Amount (in Cr.)', countAccessKey: "sum", chartAnimation: 'croreBarChartOptions', isCodeRequired: false },

    // Own Revenue Tab -> Sub Tabs

    { name: "Total Own Revenue", code: "TotalOwnRevenue", yAxisLabel: 'Amount (in Cr.)', countAccessKey: "sum", chartAnimation: 'croreBarChartOptions', isCodeRequired: false },
    { name: "Own Revenue per Capita", code: "OwnRevenuePerCapita", yAxisLabel: 'Amount (in INR)', countAccessKey: "revenuePerCapita", chartAnimation: 'defaultBarChartOptions', isCodeRequired: false },
    { name: "Own Revenue Mix", code: "OwnRevenueMix", yAxisLabel: 'Amount (in Cr.)', countAccessKey: "sum", chartAnimation: 'croreBarChartOptions', isCodeRequired: true },

    // Capital Expenditure Tab -> Sub Tabs

    { name: "Capital Expenditure", code: "CapitalTotalExpenditure", yAxisLabel: 'Amount (in Cr.)', countAccessKey: "sum", chartAnimation: 'croreBarChartOptions', isCodeRequired: false },
    { name: "Capital Expenditure Per Capita", code: "CapitalExpenditurePerCapita", yAxisLabel: 'Amount (in INR)', countAccessKey: "revenueExpendPerCapita", chartAnimation: 'defaultBarChartOptions', isCodeRequired: false },
];
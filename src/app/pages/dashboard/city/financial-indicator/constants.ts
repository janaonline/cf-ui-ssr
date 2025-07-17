import { environment } from '../../../../../environments/environment';
import { ButtonObj } from '../../../../core/models/interfaces';

export const buttons: ButtonObj[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'ownRevenue', label: 'Own Revenue' },
  { key: 'revex', label: 'Revenue Expenditure' },
  { key: 'capex', label: 'Capital Expenditure' },
];

export const compraeByOptions = (ulbType: string) => [
  { key: 'state', label: `State Average` },
  { key: 'national', label: `National Average` },
  { key: 'popCat', label: `Population Category Average` },
  { key: 'ulbType', label: `${ulbType} Average` },
]
// export const compraeByOptions = (ulbType: string) => [
//   { key: 'state', label: `State ${ulbType} Average` },
//   { key: 'national', label: `National ${ulbType} Average` },
//   { key: 'popCat', label: `${ulbType} Population Average` },
//   { key: 'ulbType', label: `${ulbType} Average` },
// ]

type Accordion = {
  key: 'aboutIndicator' | 'calculation' | 'performanceAssessed' | 'nextsteps';
  label: string;
};

export const accordions: Accordion[] = [
  { key: 'aboutIndicator', label: 'About This indicator' },
  { key: 'calculation', label: 'Calculation' },
  { key: 'performanceAssessed', label: 'How is performance assessed?' },
  { key: 'nextsteps', label: 'Next Steps' },
];

type contentType = {
  type: 'text' | 'hyperlink' | 'img';
  link?: string;
  content: string;
};

export type IndicatorDetails = {
  aboutIndicator: contentType[];
  calculation: contentType[];
  performanceAssessed: contentType[];
  nextsteps: contentType[];
};

type SubButton = {
  text: string;
  buttons: ButtonObj[];
  [indicatorKey: string]: string | ButtonObj[] | IndicatorDetails;
};

export const subButtons: { [key: string]: SubButton } = {
  revenue: {
    text: 'Revenue refers to money received or earned by a ULB during the financial year.',
    buttons: [
      { key: 'totRev', label: 'Total Revenue' },
      { key: 'revPerCapita', label: 'Revenue per Capita' },
      { key: 'revMix', label: 'Revenue Mix' },
    ],
    totRev: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            'Sum of: (a) Tax revenues, (b) Non-tax revenues, (c) Assigned (shared) revenue, (c) Grants-in-aid, (d) Loans and (e) Other receipts.',
        },
        {
          type: 'text',
          content:
            'Tax revenue includes Property Tax, Professional Tax, Entertainment Tax among others Non-tax revenue includes user charges (including for water supply, sewerage etc), fees, rentals from municipal property, among others',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/faqs`,
          content: 'know more...',
        },
      ],
      calculation: [
        {
          type: 'text',
          content:
            'Total revenue = sum of (a) Tax revenues, (b) Non-tax revenues, (c) Assigned revenue, (d) Grants and (e) Other Receipts',
        },
        {
          type: 'text',
          content:
            'State Municipal Corporation average = Weighted average of all Municipal Corporation revenue of the state based on population of each Municipal Corporation',
        },
        {
          type: 'text',
          content:
            'Compounded Annual Growth Rate(CAGR) = Rate of annual increase/decrease in total revenue between the base year and the latest year formula :',
        },
        {
          type: 'img',
          link: '../assets/images/formula.png',
          content: 'CAGR formula image',
        },
      ],
      performanceAssessed: [
        {
          type: 'text',
          content:
            '(1) Green bullet point - Positive CAGR over the assessment period',
        },
        {
          type: 'text',
          content:
            '(2) Red bullet point - Negative CAGR over the assessment period',
        },
      ],
      nextsteps: [
        // {
        //   type: 'text',
        //   content: 'Explore REVENUE PER CAPITA stats of selected ULB',
        // },
        // {
        //   type: 'text',
        //   content: 'Explore REVENUE MIX stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
    revPerCapita: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            'Total Revenue earned or received by the ULB per person during the financial year',
        },
      ],
      calculation: [
        // {
        //   type: 'text',
        //   content: 'Explore TOTAL REVENUE stats of selected ULB',
        // },
        // {
        //   type: 'text',
        //   content: 'Explore REVENUE MIX stats of selected ULB',
        // },
        {
          type: 'text',
          content:
            'Total revenue = sum of (a) Tax revenues, (b) Non-tax revenues, (c) Assigned revenue, (d) Grants, and (e) Other Receipts',
        },
        {
          type: 'text',
          content:
            'Total population = population of ULB as per 2011 census where available, else self-reported by the ULB for 2011',
        },
        {
          type: 'text',
          content:
            'State average = Simple average of all ULB revenue per capita of the state based on population of each ULB',
        },
        {
          type: 'text',
          content: 'Revenue per capita = Total Revenue/Total population',
        },
      ],
      performanceAssessed: [
        {
          type: 'text',
          content:
            '(1) Green bullet point - ULB Revenue per capita is higher than state average over the assessment period',
        },
        {
          type: 'text',
          content:
            '(2) Red bullet point - ULB Revenue per capita is lower than state average over the assessment period',
        },
      ],
      nextsteps: [
        // {
        //   type: 'text',
        //   content: 'Explore TOTAL REVENUE stats of selected ULB',
        // },
        // {
        //   type: 'text',
        //   content: 'Explore REVENUE MIX stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
    revMix: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            'Revenue mix refers to the combination of own revenues, assigned revenues, interest income, grants-in-aid (central and state grants) and other receipts, which together constitute the total revenue of the ULB',
        },
      ],
      calculation: [
        {
          type: 'text',
          content:
            'Share of (a) Own Revenues, (b) Assigned revenue, (c)Grants, (d) Interest Income and (e) Other Receipts, as a percentage of total revenue of the ULB',
        },
      ],
      performanceAssessed: [],
      nextsteps: [
        // {
        //   type: 'text',
        //   content: 'Explore TOTAL REVENUE stats of selected ULB',
        // },
        // {
        //   type: 'text',
        //   content: 'Explore REVENUE PER CAPITA stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
  },
  ownRevenue: {
    text: 'Own revenue refers to money received or earned by a ULB from its own sources during a financial year, including from taxes, fees, user charges, etc.',
    buttons: [
      { key: 'totOwnRev', label: 'Total Own Revenue' },
      { key: 'ownRevPerCapita', label: 'Own Revenue per Capita' },
      { key: 'ownRevMix', label: 'Own Revenue Mix' },
    ],
    totOwnRev: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            'Sum of: (a) Property Tax Revenue (b) Other Tax Revenue (c) Rental Income from Municipal Properties (d) Fee & User Charges (e) Sale & Hire charges and (f) Other Income',
        },
        {
          type: 'text',
          content:
            'Other Tax revenue includes Professional Tax, Entertainment Tax among others ',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/faqs`,
          content: 'know more...',
        },
      ],
      calculation: [
        {
          type: 'text',
          content:
            'Own Revenue = sum of a)Property Tax Revenue b) Other Tax Revenue c) Rental Income from Municipal Properties d) Fee & User Charges e) Sale & Hire charges and f) Other Income',
        },
        {
          type: 'text',
          content:
            'State Municipal Corporation average = Weighted average of all Municipal Corporation own revenue of the state based on population of each Municipal Corporation',
        },
        {
          type: 'text',
          content:
            'Compounded Annual Growth Rate(CAGR) = Rate of annual increase/decrease in total revenue between the base year and the latest year formula :',
        },
        {
          type: 'img',
          link: '../assets/images/formula.png',
          content: 'CAGR formula image',
        },
      ],
      performanceAssessed: [
        {
          type: 'text',
          content:
            '(1) Green bullet point - Positive CAGR over the assessment period',
        },
        {
          type: 'text',
          content:
            '(2) Red bullet point - Negative CAGR over the assessment period',
        },
      ],
      nextsteps: [
        // {
        //   type: 'text',
        //   content: 'Explore TOTAL OWN REVENUE stats of selected ULB',
        // },
        // {
        //   type: 'text',
        //   content: 'Explore OWN REVENUE PER CAPITA stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
    ownRevPerCapita: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            'Own Revenue earned or received by a ULB per person during the financial year',
        },
      ],
      calculation: [
        {
          type: 'text',
          content:
            'Own Revenue = sum of a)Property Tax Revenue b) Other Tax Revenue c) Rental Income from Municipal Properties d) Fee & User Charges e) Sale & Hire charges and f) Other Income Total population = population of ULB as per 2011 census where available, else self-reported by the ULB',
        },
        {
          type: 'text',
          content:
            'State average = Simple average of all ULB revenue per capita of the state based on population of each ULB',
        },
        {
          type: 'text',
          content: 'Own Revenue per capita = Own Revenue/Total population',
        },
      ],
      performanceAssessed: [
        {
          type: 'text',
          content:
            '(1) Green bullet point - ULB Own Revenue per capita is higher than state average over the assessment period',
        },
        {
          type: 'text',
          content:
            '(2) Red bullet point - ULB Own Revenue per capita is lower than state average over the assessment period',
        },
      ],
      nextsteps: [
        // {
        //   type: 'text',
        //   content: 'Explore TOTAL OWN REVENUE stats of selected ULB',
        // },
        // {
        //   type: 'text',
        //   content: 'Explore OWN REVENUE MIX stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
    ownRevMix: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            'Own Revenue mix refers to the combination of Property Tax Revenue, Other Tax Revenue, Rental Income, Fee & User Charges, Sale & Hire Charges and Other Income, which together constitute the total Own Revenue of the ULB',
        },
      ],
      calculation: [
        {
          type: 'text',
          content:
            'Share of Property Tax Revenue, Other Tax Revenue, Rental Income, Fee & User Charges, Sale & Hire Charges and Other Income, as a percentage of the total Own Revenue of the ULB',
        },
      ],
      performanceAssessed: [],
      nextsteps: [
        // {
        //   type: 'text',
        //   content: 'Explore TOTAL OWN REVENUE stats of selected ULB',
        // },
        // {
        //   type: 'text',
        //   content: 'Explore OWN REVENUE PER CAPITA stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
  },
  revex: {
    text: 'Revenue Expenditure refers to spending on day-to-day operations such as salaries, subsidies, maintenance, and interest payments — these do not create lasting assets.',
    buttons: [
      { key: 'totRevex', label: 'Total Revenue Expenditure' },
      { key: 'revexPerCapita', label: 'Revenue Expenditure per Capita' },
      { key: 'revexMix', label: 'Revenue Expenditure Mix' },
    ],
    totRevex: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            "Refers to the City's day-to-day recurring expenses or spendings. It keeps the city's existing operations running but doesn't create new assets.",
        },
        {
          type: 'text',
          content:
            'Sum of: (a) Establishment expenses, (b) Administrative expenses, (c) Operation & Maintenance, (d) Interest & finance charges and (e) Others',
        },
      ],
      calculation: [
        {
          type: 'text',
          content:
            'Sum of: (a) Establishment expenses, (b) Administrative expenses, (c) Operation & Maintenance, (d) Interest & finance charges and (e) Others',
        },
      ],
      performanceAssessed: [
        {
          type: 'text',
          content:
            '(1) Green bullet point - Positive CAGR over the assessment period',
        },
        {
          type: 'text',
          content:
            '(2) Red bullet point - Negative CAGR over the assessment period',
        },
      ],
      nextsteps: [
        // {
        //   type: 'text',
        //   content:
        //     'Explore REVENUE EXPENDITURE PER CAPITA stats of selected ULB',
        // },
        // {
        //   type: 'text',
        //   content: 'Explore REVENUE EXPENDITURE MIX stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
    revexPerCapita: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            'Revenue expenditure earned or received by a ULB per person during the financial year',
        },
      ],
      calculation: [
        {
          type: 'text',
          content: 'Sum of all the administrative & operating expenses.',
        },
        {
          type: 'text',
          content:
            'Total population = population of ULB as per 2011 census where available, else self-reported by the ULB',
        },
        {
          type: 'text',
          content:
            'State average = Simple average of all ULB revenue expenditure per capita of the state based on population of each ULB',
        },
        {
          type: 'text',
          content:
            'Revenue Expenditure per capita = Revenue Expenditure/Total population',
        },
      ],
      performanceAssessed: [
        {
          type: 'text',
          content:
            '(1) Green bullet point - ULB Revenue expenditure per capita is higher than state average over the assessment period',
        },
        {
          type: 'text',
          content:
            '(2) Red bullet point - ULB Own Revenue expenditure per capita is lower than state average over the assessment period',
        },
      ],
      nextsteps: [
        // {
        //   type: 'text',
        //   content: 'Explore TOTAL REVENUE EXPENDITURE stats of selected ULB',
        // },
        // {
        //   type: 'text',
        //   content: 'Explore REVENUE EXPENDITURE MIX stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
    revexMix: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            'Revenue Expenditure mix refers to the combination of establishment expenditure, Administrative Expenditure, O & M Expenditure, Interest & Finance Expenditure, and others',
        },
      ],
      calculation: [
        {
          type: 'text',
          content:
            'Share of: (a) Establishment expenses, (b) Administrative expenses, (c) Operation & Maintenance, (d) Interest & finance charges and (e) Others, as a percentage of total revenue expenditure of the ULB',
        },
      ],
      performanceAssessed: [],
      nextsteps: [
        // {
        //   type: 'text',
        //   content: 'Explore TOTAL REVENUE EXPENDITURE stats of selected ULB',
        // },
        // {
        //   type: 'text',
        //   content:
        //     'Explore REVENUE EXPENDITURE PER CAPITA stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
  },
  capex: {
    text: 'Capital Expenditure referes to expenditure incurred by a ULB during a financial year on building long-term assets, including infrastructure.',
    buttons: [
      { key: 'capex', label: 'Total Capital Expenditure' },
      { key: 'capexPerCapita', label: 'Capital Expenditure per Capita' },
    ],
    capex: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            "Refers to the City's spending on improving the long term assets that gradually helps to upgrade City's new asset & investment creation which is crucial for development",
        },
      ],
      calculation: [
        {
          type: 'text',
          content:
            'Capital Expenditure = (Closing Balance Gross Block + Closing Balance Capital Work in Progress) - (Opening Balance Gross Block + Opening Balance Capital Work in Progress)',
        },
        {
          type: 'text',
          content:
            'State Municipal Corporation average = Weighted average of all Municipal Corporation capital expenditure of the state based on population of each Municipal Corporation',
        },
        {
          type: 'text',
          content:
            'Compounded Annual Growth Rate(CAGR) = Rate of annual increase/decrease in capital expenditure between the base year and the latest year',
        },
      ],
      performanceAssessed: [
        {
          type: 'text',
          content:
            '(1) Green bullet point - Positive CAGR over the assessment period',
        },
        {
          type: 'text',
          content:
            '(2) Red bullet point - Negative CAGR over the assessment period',
        },
      ],
      nextsteps: [
        // {
        //   type: 'text',
        //   content:
        //     'Explore CAPITAL EXPENDITURE PER CAPITA stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
    capexPerCapita: {
      aboutIndicator: [
        {
          type: 'text',
          content:
            'Capital expenditure incurred by the ULB per person during the financial year',
        },
      ],
      calculation: [
        {
          type: 'text',
          content:
            'Capital expenditure =Difference between Closing balance of Gross Block & CWIP and Opening balance of Gross Block & CWIP',
        },
        {
          type: 'text',
          content:
            'Total population = population of ULB as per 2011 census where available, else self-reported by the ULB',
        },
        {
          type: 'text',
          content:
            'State average = Simple average of all ULB Capital Expenditure per capita of the state based on population of each ULB',
        },
        {
          type: 'text',
          content:
            'Capital Expenditure per Capita = Total Capital Expenditure/Total Population',
        },
      ],
      performanceAssessed: [
        {
          type: 'text',
          content:
            '(1) Green bullet point - ULB Capital Expenditure per capita is higher than state average over the assessment period',
        },
        {
          type: 'text',
          content:
            '(2) Red bullet point - ULB Capital Expenditure per capita is lower than state average over the assessment period',
        },
      ],
      nextsteps: [
        // {
        //   type: 'text',
        //   content: 'Explore CAPITAL EXPENDITURE stats of selected ULB',
        // },
        {
          type: 'text',
          content: 'Explore Resources to augment your revenues:',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/toolkits`,
          content: '1. Property tax reforms toolkit (published by MoHUA)',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/eLearning`,
          content: '2. E-learning modules on implementing property tax reforms',
        },
        {
          type: 'hyperlink',
          link: `${environment.v1Url}/resources-dashboard/learning-center/bestPractices`,
          content: '3. Best Practices on property tax reforms',
        },
      ],
    },
  },
};

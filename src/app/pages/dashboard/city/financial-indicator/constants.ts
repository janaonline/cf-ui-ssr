import { ButtonObj } from '../../../../core/models/interfaces';

export const buttons: ButtonObj[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'ownRevenue', label: 'Own Revenue' },
  { key: 'expenditure', label: 'Expenditure' },
  { key: 'capex', label: 'Capital Expenditure' },
];

type SubButton = {
  text: string;
  buttons: ButtonObj[];
};

export const subButtons: { [key: string]: SubButton } = {
  revenue: {
    text: 'Money received or earned by a ULB during the financial year.',
    buttons: [
      { key: 'totRev', label: 'Total Revenue' },
      { key: 'revPerCapita', label: 'Revenue per Capita' },
      { key: 'revMix', label: 'Revenue Mix' },
    ],
  },
  ownRevenue: {
    text: 'Money received or earned by a ULB from its own sources during a financial year, including from taxes, fees, user charges, etc.',
    buttons: [
      { key: 'totOwnRev', label: 'Total Own Revenue' },
      { key: 'ownRevPerCapita', label: 'Own Revenue per Capita' },
      { key: 'ownRevMix', label: 'Own Revenue Mix' },
    ],
  },
  capex: {
    text: 'Expenditure incurred by a ULB during a financial year on building long-term assets, including infrastructure.',
    buttons: [
      { key: 'capex', label: 'Capital Expenditure' },
      { key: 'capexPerCapita', label: 'Capital Expenditure per Capita' },
    ],
  },
};

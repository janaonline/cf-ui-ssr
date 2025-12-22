import { ChartResStruct } from '../../shared/components/charts/chart-interfaces';
import { IState } from './state/state';
import { IULB, UlbType } from './ulb';

export interface BondIssuances {
  bondIssueAmount: number;
  totalMunicipalBonds: number;
  inProgress: boolean;
}

export interface BorrowingsData extends BorrowingsKeys {
  table: string;
  key: string;
  header: string;
  label: string;
}

export interface BorrowingsKeys {
  [key: string]: string | null;
}

export interface ExploreSectionResponse {
  gridDetails: ExploresectionTable[];
  lastModifiedAt: string | null;
  popCat: string;
  state: IState;
  ulbId: string;
  ulbName: string;
  ulbType: UlbType;
}

export interface ExploresectionTable {
  sequence: number;
  label: string;
  value: string | number;
  info: string;
  src: string;
  tooltip: string;
}

export interface BsIsDataBase {
  code?: string | number | null;
  reportType?: string | null;
  lineItem: string;
  class?: string;
  info?: string;
}

export interface BsIsData extends BsIsDataBase {
  [year: `${number}`]: number | string | null;
}

export interface UserInfoUlbDetails {
  fileName: string;
  type: 'pdf' | 'excel';
  module: 'resources' | 'cfr' | 'cityPage';
}

export interface UserInfoData {
  reportList: AfsPopupData;
  fileType: string;
  ulbDetails: UserInfoUlbDetails;
}
export interface AfsPopupData {
  excel: FileData[];
  pdf: FileData[];
  type: string;
}

export interface FileData {
  name: string;
  url: string;
}

export interface FileMetadata {
  fileName: string;
  fileUrl: string;
  modifiedAt: string;
  state: string;
  type: string;
  ulbId: string;
  ulbName: string;
  year: string;
  _id: string;
}

export interface ButtonObj {
  label: string;
  key: string;
}

export interface ISlb {
  value: number;
  ulbName: string;
  ulbSlug: string;
  year: string;
  unitType: string;
  benchMarkValue: number;
  name: string;
  type: string;
  nationalValue: number;
  compPercentage: number;
}

export interface IMoneyInfoRes {
  result: ExploresectionTable[];
  year: string;
  audit_status: string | null;
  isActive: boolean;
  lastModifiedAt: string | null;
}

type compareType = 'state' | 'national' | 'popCat' | 'ulbType' | 'ulbs';
export type LineItemType = 'revenue' | 'ownRevenue' | 'revex' | 'capex';
export type CalcType = 'total' | 'perCapita' | 'mix';

export interface IFinancialIndicatorsChart {
  years: string[];
  compareType: compareType,
  ulbId?: string,
  stateId?: string,
  lineItem: LineItemType,
  calcType: CalcType,
  compareUlbs: string[]
  compareUlbsObj?: IULB[],
}

export interface FinancialIndicatorsCompareByPaylod {
  compareType: compareType,
  compareUlbs?: string[],
  compareUlbsObj?: IULB[],
}

export interface IFinancialIndicatorRes {
  data: ChartResStruct,
  success: boolean,
}

export interface IFinancialIndicatorInfo {
  msg: string
  text: 'success' | 'danger'
}

export interface TableColumns {
  key: string;
  value: string;
  class?: string;
  number?: boolean;
  width?: string;
  mergeCell?: boolean;
}

export interface CreateExcelParams {
  addLogo: boolean,
  addContactUsNote: boolean,
  fileName: string,
  sheetName: string,
  rows: any[],
  columns: any[],
  header: { index: number, fontSize: number, fontFamily: string }
  logoUrl?: string;   // assets/logo/cityfinance-logo.png
  contactText?: string;
  yearHeaders?: string[];          // e.g. ['Indicator','2020-21','2021-22',...]
  cityGroups?: { name: string; startCol: number; endCol: number }[];
}


// export interface ChartResponse {
//   success: boolean;
//   data: ChartData;
// }

// export interface ChartData {
//   chartType: 'gaugeChart' | string;
//   labels: string[];
//   legendColors: string[];
//   data: ChartSeries[];
// }

// export interface ChartSeries {
//   label: string;
//   data: number[];
// }

export interface BsCompareUlbs {
  [_id: string]: BsCompareUlbsValue
}
export interface MarketReadinessResponse {
  ulbId: string;
  ulbName: string;
  year: string;
  sections: Section[];
  sectionScores: SectionScore[];
  overallScore: number;
  marketReadinessBand: string;
  footNote?: string,
  outOfRange?: [],
  message?: string
}

export interface Section {
  section: string;
  description: string;
  rows: {
    name: string;
    maxScore: number;
    score: number;
  }[];
}

export interface SectionScore {
  section: string;
  score: number;
}
export interface BsCompareUlbsValue {
  _id: string;
  name: string;
  stateName: string;
  population: number;
}
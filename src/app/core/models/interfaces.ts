import { ChartResStruct } from '../../shared/components/charts/chart-interfaces';
import { IState } from './state/state';
import { IULB } from './ulb';

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
}

export interface ExploresectionTable {
  sequence: number;
  label: string;
  value: string | number;
  info: string;
  src: string;
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
  ulbId: string,
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

export interface CreateExcelParams {
  addLogo: boolean,
  addContactUsNote: boolean,
  fileName: string,
  sheetName: string,
  rows: any[],
  columns: any[],
  header: { index: number, fontSize: number, fontFamily: string }
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

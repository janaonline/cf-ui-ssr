import { IState } from "./state/state";

export interface BondIssuances {
  bondIssueAmount: number;
  totalMunicipalBonds: number;
  inProgress: boolean;
}

// export interface CreditRatings {
//   ulb: string;
//   state: string;
//   agency: string;
//   creditrating: string;
//   status: string;
//   date: string;
// }

// export interface CreditRatingData {
//   total: number;
//   creditRatingAboveBBB_Minus: number;
// }

// export interface CreditRatingMap {
//   [region: string]: CreditRatingData;
// }

// export interface States {
//   code: string;
//   _id: string;
//   name: string;
// }

// export interface Ulbs {
//   code: string;
//   censusCode: string;
//   sbCode?: string;
//   name: string;
//   _id: string;
//   state: string;
// }

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
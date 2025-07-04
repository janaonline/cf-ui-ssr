export interface ICreditRatingData {
  ulb: string;
  state: string;
  agency: string;
  creditrating: string;
  status: string;
  date: string;
}

export interface CreditRatingData {
  total: number;
  creditRatingAboveBBB_Minus: number;
}

export interface CreditRatingMap {
  [stateName: string]: CreditRatingData;
}

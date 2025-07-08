// TODO: correct creditrating | creditRating
export interface ICreditRatingData {
  ulb: string;
  state: string;
  agency: string;
  creditRating: string;
  creditrating: string;
  status: string;
  date: string;
  link?: string;
}

export interface CreditRatingData {
  total: number;
  creditRatingAboveBBB_Minus: number;
}

export interface CreditRatingMap {
  [stateName: string]: CreditRatingData;
}

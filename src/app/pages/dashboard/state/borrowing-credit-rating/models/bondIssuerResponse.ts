export interface IBondIssuer {
  [key: string]: any[];
  detailsOfInstrument: string[];
  detailsOfIssue: string[];
  rating: string[];
  objectiveOfIssue: string[];
  subscriber: string[];
  advisors: string[];
  documentsAvailable: string[];
}

export interface IBondsData {
  year: string;
  municipality: string;
  ulbType: string;
  rating: string;
  amount: string;
  couponRate: string;
}
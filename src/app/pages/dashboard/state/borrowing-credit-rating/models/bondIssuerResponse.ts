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
  ulb: string;
  ulbType: string;
  yearOfBondIssued: string;
  rating: string;
  issueSizeAmount: string;
  couponRate: string;
}
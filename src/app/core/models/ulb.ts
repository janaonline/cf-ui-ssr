import { ulbType } from './ulbTypes';
export interface IULB {
  amrut: 'Yes' | 'No' | undefined;
  _id: string;
  slug?: string;
  area: number;
  code: string;
  name: string;
  natureOfUlb: string;
  population: number;
  type: ulbType;
  wards: number;
  state: string;
  stateCode?: string;
  financialYear: string;
  allYears?: string[]; // Years in which  ULB has data
}

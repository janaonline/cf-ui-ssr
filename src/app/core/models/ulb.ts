import { IState } from './state/state';
import { ulbType } from './ulbTypes';
export interface IULB {
  location: { lat: number | string | null; lng: number | string | null };
  amrut: 'Yes' | 'No' | undefined;
  isActive: boolean;
  _id: string;
  id?: string;
  slug?: string;
  area: number;
  code: string;
  name: string;
  natureOfUlb: string;
  population: number;
  type?: ulbType;
  wards: number;
  state: string;
  stateInfo?: IState;
  stateCode?: string;
  financialYear: string;
  allYears?: string[]; // Years in which  ULB has data
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ICreditRatingData } from '../../core/models/creditRating/creditRatingResponse';
import {
  BorrowingsKeys,
  BsCompareUlbs,
  BsIsData,
  IFinancialIndicatorRes,
  IFinancialIndicatorsChart,
  IMoneyInfoRes,
  ISlb
} from '../../core/models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) { }

  // Money info cards: tax rev, own rev, grants, tot rev, tot exp, bs size.
  getMoneyInfo(year: string = '', stateId: string = '', ulbId: string = '') {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    if (stateId) params = params.set('stateId', stateId);
    if (ulbId) params = params.set('ulbId', ulbId);

    return this.http.get<IMoneyInfoRes>(`${environment.api.url}dashboard/financial-info/get-data`, { params });
  }

  // City page: balance sheet and income statement table.
  getBsIsData(ulbIds: string[], btnKey: string = 'incomeStatement', years: string[]) {
    let params = new HttpParams();

    params = params.set('btnKey', btnKey);
    ulbIds.forEach(id => { params = params.append('ulbIds', id); });
    years.forEach(year => { params = params.append('years', year); });

    return this.http.get<{ data: BsIsData[]; population: number, ulbsData: BsCompareUlbs }>(
      `${environment.api.url}dashboard/city/bs-is`,
      { params }
    );
  }

  // City page: borrowings section.
  getBorrowingsData(ulbId: string = '', stateId: string = '') {
    let params = new HttpParams();
    if (ulbId) params = params.set('ulbId', ulbId);
    if (stateId) params = params.set('stateId', stateId);

    return this.http.get<{ data: BorrowingsKeys[] }>(
      `${environment.api.url}/BondIssuerItem`,
      {
        params,
      }
    );
  }

  // Json file in UI.
  getCreditRatingsData() {
    return this.http.get<ICreditRatingData[]>(
      `/assets/files/credit-rating-new.json`
    );
  }

  // Get 28 Slbs data.
  fetchCitySlbChartData(
    type = 'Water Supply',
    compUlb = '',
    ulb = '',
    year = '2020-21'
  ) {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (compUlb) params = params.set('compUlb', compUlb);
    if (ulb) params = params.set('ulb', ulb);
    if (year) params = params.set('year', year);

    return this.http.get<{ data: ISlb[] }>(`${environment.api.url}indicators`, {
      params,
    });
  }

  // Get financial indicators data.
  getFinancialIndicatorsChartData(body: IFinancialIndicatorsChart): Observable<IFinancialIndicatorRes> {
    return this.http.post<IFinancialIndicatorRes>(`${environment.api.url}dashboard/city/financial-indicators`, body);
  }
}

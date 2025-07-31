import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ICreditRatingData } from '../../core/models/creditRating/creditRatingResponse';
import {
  BorrowingsKeys,
  BsIsData,
  ExploreSectionResponse,
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
  getBsIsData(ulbId: string, btnKey: string = 'incomeStatement') {
    let params = new HttpParams();
    if (ulbId) params = params.set('ulbId', ulbId);
    params = params.set('btnKey', btnKey);

    return this.http.get<{ data: BsIsData[]; population: number }>(
      `${environment.api.url}dashboard/city/bs-is`,
      {
        params,
      }
    );
  }

  // City page: borrowings section.
  getBorrowingsData(ulbId: string = '', stateId: string = '') {
    let params = new HttpParams();
    if (ulbId) params = params.set('ulbId', ulbId);
    if (stateId) params = params.set('stateId', stateId);

    return this.http.get<{ data: BorrowingsKeys[] }>(
      `${environment.api.url}/BondIssuerItem`,
      { params }
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

  // Get state details.
  getStateDetails(params: { slug: string; year: string }): Observable<ExploreSectionResponse> {
    return this.http.get<ExploreSectionResponse>(`${environment.api.url}dashboard/state/details`, { params });
  }
  // Get state details.
  getStateGroupPopulation(params: { stateId: string; year: string }): Observable<ExploreSectionResponse> {
    return this.http.get<ExploreSectionResponse>(`${environment.api.url}state-ulbs-grouped-by-population`, { params });
  }
  getStatePopulation(payload: { stateId: string; year: string }): Observable<any> {
    // https://staging.cityfinance.in/api/v1/state-revenue-tabs?tabType=TotalRevenue&financialYear=2021-22&stateId=5dcf9d7316a06aed41c748ec&sortBy=top&chartType=bar&apiEndPoint=state-revenue-tabs&apiMethod=get&activeButton=Total%20Revenue
    const params = {
      tabType: 'TotalRevenue',
      financialYear: payload.year,
      stateId: payload.stateId,
      sortBy: 'top',
      chartType: 'bar',
      apiEndPoint: 'state-revenue-tabs',
      apiMethod: 'get',
      activeButton: 'Total Revenue'
    }
    return this.http.get<ExploreSectionResponse>(`${environment.api.url}state-revenue-tabs`, { params });
  }
  getStateRevenue(body: { stateId: string; year: string }): Observable<{ sucess: boolean, data: any }> {
    const payload = { "state": body.stateId, "financialYear": body.year, "headOfAccount": "Revenue", "filterName": "revenue", "isPerCapita": "", "compareType": "", "compareCategory": "", "ulb": [], "chartType": "scatter", "apiEndPoint": "state-revenue", "apiMethod": "post", "stateServiceLabel": false, "sortBy": "", "chartTitle": "Total Revenue of all ULBs in Madhya Pradesh vs State " };
    return this.http.post<any>(`${environment.api.url}state-revenue`, payload);
  }


}

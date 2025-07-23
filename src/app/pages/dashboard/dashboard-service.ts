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
  getStateDetails(slugName: string): Observable<ExploreSectionResponse> {
    const res: ExploreSectionResponse = {
      lastModifiedAt: '',
      popCat: '',
      state: {
        _id: '5dcf9d7216a06aed41c748dd',
        name: 'Andhra Pradesh',
        slug: 'andhra-pradesh',
        censusCode: '',
        code: 'AP',
        regionalName: '',
        totalUlbs: 123,
      },
      ulbId: '',
      ulbName: '',
      gridDetails: [
        {
          sequence: 1,
          label: 'Population',
          value: '14 Million',
          info: '',
          src: '',
        },
        {
          sequence: 2,
          label: 'Urban Area',
          value: '4989 Sq km',
          info: '',
          src: '',
        },
        {
          sequence: 3,
          label: 'Urban Population Density',
          value: '2,719.77/ Sq km',
          info: '',
          src: '',
        },
        {
          sequence: 4,
          label: 'Urban Local Bodies(ULBs)',
          value: 123,
          info: '',
          src: '',
        },
        {
          sequence: 5,
          label: 'ULBs part of Urban Agglomorations',
          value: 2,
          info: '',
          src: '',
        },
        {
          sequence: 6,
          label: 'Municipal Corporations*',
          value: 17,
          info: '',
          src: '',
        },
        {
          sequence: 7,
          label: 'Municipality*',
          value: 80,
          info: '',
          src: '',
        },
        {
          sequence: 8,
          label: 'Town Panchayat*',
          value: 26,
          info: '',
          src: '',
        },
      ]
    };
    return of(res);
  }
}

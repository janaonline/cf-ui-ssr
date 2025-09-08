import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Inject,
  Injectable,
  makeStateKey,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import {
  AfsPopupData,
  BondIssuances,
  ExploreSectionResponse,
  FileMetadata,
} from '../models/interfaces';
import { IState } from '../models/state/state';
import { IULB } from '../models/ulb';
import { environment } from './../../../environments/environment';

const VISUALIZATION_COUNT_KEY = makeStateKey<number>('visualizationCount ');
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  dataForVisualizationCount = new BehaviorSubject<number>(0);
  private searchItem: BehaviorSubject<any> = new BehaviorSubject([]);
  castSearchItem = this.searchItem.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState
  ) {
    // Read from transfer state - Client.
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(VISUALIZATION_COUNT_KEY)
    ) {
      const count = this.transferState.get(VISUALIZATION_COUNT_KEY, 0);
      this.dataForVisualizationCount.next(count);
      this.transferState.remove(VISUALIZATION_COUNT_KEY);
    }
  }

  // eg: "firstname-lastname" to "Firstname Lastname"
  toTitleCase(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Ticker on home page.
  setDataForVisualizationCount(VisualizationCount: string) {
    if (VisualizationCount) {
      const count = parseFloat(VisualizationCount.replace(/,/g, ''));

      // Save to BehaviorSubject
      this.dataForVisualizationCount.next(count);

      // Store in TransferState on server.
      if (isPlatformServer(this.platformId)) {
        this.transferState.set(VISUALIZATION_COUNT_KEY, count);
      }
    }
  }

  updateSearchItem(searchItem: any) {
    this.searchItem.next(searchItem);
  }

  getRecentSearchValue() {
    return this.http.get(`${environment.api.url}recentSearchKeyword?limit=2`);
  }

  postRecentSearchValue(data: any) {
    // let searchObj = {
    //      type: data.type,
    //      searchKeyword: data._id
    //   }
    return this.http.post(`${environment.api.url}recentSearchKeyword`, data);
  }

  getStateWiseFYs(paramContent: any) {
    let bodyParams: any;
    bodyParams = this.getHttpClientParams(paramContent);
    return this.http.get(`${environment.api.url}get-FYs-with-specification`, {
      params: bodyParams,
    });
  }

  public getHttpClientParams(obj: any) {
    let params = new HttpParams();
    if (obj) {
      Object.keys(obj).forEach((key: any) => {
        if (obj[key] || obj[key] === 0) {
          params = params.set(key, obj[key]);
        }
      });
    }
    return params;
  }

  // Global search
  postGlobalSearchData(data: any, type: any, state: any) {
    const dataString = {
      matchingWord: data,
    };
    let stateData = '';
    if (state) {
      stateData = `&state=${state}`;
    }
    return this.http.post(
      `${environment.api.url}recentSearchKeyword/search?type=${type}${stateData}`,
      dataString
    );
  }

  // Footer section.
  public getWebsiteVisitCount() {
    return this.http
      .get(`${environment.api.url}visit_count`)
      .pipe(map((res: any) => (res && res['data'] ? res['data'] : 0)));
  }

  // Get bond amount
  public getBondIssuerItemAmount(
    state: string = ''
  ): Observable<BondIssuances> {
    const url = state
      ? `${environment.api.url}bond-issuances/municipal-bonds/${state}`
      : `${environment.api.url}bond-issuances/municipal-bonds`;

    return this.http.get<BondIssuances>(url);
  }

  public fetchStateList(): Observable<IState[]> {
    return this.http
      .get<{ data: IState[] }>(environment.api.url + 'state')
      .pipe(map((res) => res.data));
  }

  getUlbByState(stateCode: string) {
    return this.http.get(
      environment.api.url + '/states/' + stateCode + '/ulbs'
    );
  }

  // Based on Ulb id return population, area, pop density, wards, yrs of data, UA
  public getCityData(
    citySlugName: string = '',
    cityId: string = ''
  ): Observable<ExploreSectionResponse> {
    let params = new HttpParams();
    if (citySlugName) params = params.set('citySlugName', citySlugName);
    if (cityId) params = params.set('cityId', cityId);

    return this.http.get<ExploreSectionResponse>(
      `${environment.api.url}dashboard/city/city-details`,
      { params }
    );
  }

  // National/ State data.
  public getExploreSectionData(
    stateCode: string = '',
    stateId: string = ''
  ): Observable<ExploreSectionResponse> {
    let params = new HttpParams();
    if (stateCode) params = params.set('stateCode', stateCode);
    if (stateId) params = params.set('stateId', stateId);

    return this.http.get<ExploreSectionResponse>(
      `${environment.api.url}dashboard/home-page/get-Data`,
      { params }
    );
  }

  // Get distinct years - ledger/ Standardized data.
  public getLedgerYears(
    stateCode: string = '',
    ulbId: string = '',
    auditStatus: string = ''
  ) {
    let params = new HttpParams();
    if (stateCode) params = params.set('stateCode', stateCode);
    if (ulbId) params = params.set('ulbId', ulbId);
    if (auditStatus) params = params.set('auditStatus', auditStatus);

    return this.http.get<{ ledgerYears: string[] }>(
      `${environment.api.url}common/get-latest-standardized-year`,
      { params }
    );
  }

  // Get distinct years - SLBs data.
  slbYears(ulbId: string) {
    let params = new HttpParams();
    if (ulbId) params = params.set('ulb', ulbId);

    return this.http.get<{ slbYears: string[] }>(
      `${environment.api.url}common/get-latest-slbs-year`,
      { params }
    );
  }

  // Get distinct years - Bonds/ Borrowings data.
  borrowingYears(ulbId: string = '', stateId: string = '') {
    let params = new HttpParams();
    if (ulbId) params = params.set('ulbId', ulbId);
    if (stateId) params = params.set('stateId', stateId);

    return this.http.get<{ borrowingYears: string[] }>(
      `${environment.api.url}common/get-latest-borrowings-year`,
      { params }
    );
  }

  // Annual accounts popup - Show BS, BSS, IS, ISE, CF, AR in one popup.
  getReports(ulbId: string, financialYear: string, auditType: string = '') {
    return this.http.get<{ data: AfsPopupData; success: boolean }>(
      `${environment.api.url}ledger/ulb-financial-data/files/${ulbId}?financialYear=${financialYear}&auditType=${auditType}`
    );
  }

  getDataSets(
    year: string,
    type: string,
    category: string,
    state: string,
    ulb: string,
    ulbId = '',
    globalName = '',
    skip: number = 0
  ) {
    return this.http.get<{ data: FileMetadata[] }>(
      `${environment.api.url}annual-accounts/datasets?year=${year}&type=${type}&category=${category}&state=${state}&ulb=${ulb}&ulbId=${ulbId}&globalName=${globalName}&skip=${skip}`
    );
  }

  // Downlaod excel;
  downloadExcel(blob: Blob, filename: string = 'City_Finance_Data.xlsx') {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Get ulb details.
  getSingleUlbList(_id: string, keys: string[]): Observable<IULB | null> {
    if (!_id) {
      console.error('ULB ID is required.');
      return of(null);
    }

    let params = new HttpParams();
    if (_id) params = params.set('_id', _id);
    if (keys.length > 0) params = params.set('keys', JSON.stringify(keys));
    return this.http.get<IULB>(`${environment.api.url}`, { params });
  }
}

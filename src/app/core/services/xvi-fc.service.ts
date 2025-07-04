import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class XviFcService {
  constructor(private http: HttpClient) {}

  getUlbForm(ulb: string) {
    const params = { ulb };
    return this.http.get(`${environment.api.url}xviFc/fetch_form`, { params });
  }

  saveUlbForm(ulb: string, body: any) {
    return this.http.post(`${environment.api.url}xviFc/saveAsDraft?ulb=${ulb}`, body);
  }

  submitUlbForm(ulb: string, body: any) {
    return this.http.post(`${environment.api.url}xviFc/submit_form?ulb=${ulb}`, body);
  }

  submitFormStatus(statusType: string, body: any) {
    return this.http.post(`${environment.api.url}xviFc/${statusType}`, body);
  }

  getFormList(queryParams: any, payload: any) {
    const queryStr = new URLSearchParams(queryParams).toString();

    return this.http.post(`${environment.api.url}xviFc/form_list?${queryStr}`, payload);
  }
  getStates() {
    return this.http.get(`${environment.api.url}/state`);
  }

  progressReport(stateName: string, formId: number) {
    const params: { stateName?: string; formId?: number } = {};
    if (stateName) params['stateName'] = stateName;
    if (formId) params['formId'] = formId;
    return this.http.get(`${environment.api.url}xviFc/progressReport`, {
      params,
      responseType: 'blob',
    });
  }

  dataDump(stateName: string, formId: number = 0) {
    const params: { stateName?: string; formId?: number } = {};
    if (stateName) params['stateName'] = stateName;
    if (formId) params['formId'] = formId;
    return this.http.get(`${environment.api.url}xviFc/dataDump`, { params, responseType: 'blob' });
  }
}

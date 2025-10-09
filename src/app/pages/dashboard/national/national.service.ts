import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

interface NationalInput {
  financialYear: string;
  formType: string;
  stateId: string;
  type: string;
  csv: boolean;
}

@Injectable({
  providedIn: "root",
})
export class NationalService {

  selectedButtonKey: any = signal<string>('');
  selectedLedgerYear = signal<string>('');
  selectedTabName = signal<string>('');
  stateSlugName = signal<string>('');

  constructor(private http: HttpClient) { }

  getNationalRevenueData(nationalInput: NationalInput, endPoint: string) {
    const params = {
      financialYear: nationalInput.financialYear,
      formType: nationalInput.formType,
      stateId: nationalInput.stateId,
      type: nationalInput.type,
      // csv: nationalInput.csv,
    }
    return this.http.get(
      // environment.api.url + `national-dashboard/${endPoint}?financialYear=${nationalInput.financialYear}&type=${nationalInput.type}&
      // formType=${nationalInput.formType}&stateId=${nationalInput.stateId}`
      environment.api.url + `national-dashboard/${endPoint}`, { params }
    );
  }
  getNationalData(params: any, endPoint: string) {
    // const httpParams = {
    //   financialYear: params.financialYear,
    //   formType: params.formType,
    //   stateId: params.stateId,
    //   type: params.type,
    //   csv: params.csv
    // };
    if (params && params.csv)
      return this.http.get(environment.api.url + endPoint, { params, responseType: 'blob' });

    return this.http.get(
      environment.api.url + endPoint, { params }
    );
  }

  getNationalRevenueMixData(RevenueMixInput: any, endPoint: string) {
    return this.http.get(
      environment.api.url +
      `national-dashboard/${endPoint}?financialYear=${RevenueMixInput?.financialYear}&formType=${RevenueMixInput?.formType}&stateId=${RevenueMixInput?.stateId}&type=${RevenueMixInput?.type} `
    );
  }
  getResource() {
    return this.http.get(environment.api.url + `resource/all`);
  }

  DownloadNationalTableData(downloadInput: any, endPoint: string) {
    return this.http.get(
      environment.api.url +
      `national-dashboard/${endPoint}?financialYear=${downloadInput?.financialYear}&formType=${downloadInput?.formType}&stateId=${downloadInput?.stateId}&type=${downloadInput?.type}&csv=${downloadInput.csv} `,
      { responseType: "blob" }
    );
  }

  getDataAvailabilityMapData(financialYear = '2021-22', type = 'populationCategory', stateId: string): Observable<any> {
    let params = new HttpParams();
    if (financialYear) params = params.set('financialYear', financialYear);
    if (type = 'populationCategory') params = params.set('population', true);
    else params = params.set('ulbType', true);
    if (stateId) params = params.set('stateId', stateId);


    return this.http.get(environment.api.url + 'get-statewise-data-availability', { params });
  }
}

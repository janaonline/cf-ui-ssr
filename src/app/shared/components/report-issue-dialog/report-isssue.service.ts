import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../environments/environment';

export interface ResponseData {
  message: string[];
  error?: string;
  statusCode: number;
}

export interface PayloadData {
  issueKind: string;
  desc: string;
  email: string;
  issueScreenshotUrl?: string;
  autoCaptureContext: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportIssueService {
  constructor(private http: HttpClient) {}

  submitIssue(payload: PayloadData): Observable<ResponseData> {
    const url = environment.api.urlV2 + 'report-an-issue';
    return this.http.post<ResponseData>(url, payload);
  }
}

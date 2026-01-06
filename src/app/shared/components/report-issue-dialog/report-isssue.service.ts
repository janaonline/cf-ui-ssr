import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class ReportIssueService {
  constructor(private http: HttpClient) {}

  submitIssue(payload: any): Observable<any> {
    console.log(payload);
    return of('');
  }
}

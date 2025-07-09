import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HomeHeaderService {
  constructor(private http: HttpClient) {}

  public submitDemoData(payload: any): Observable<Object> {
    return this.http.post(
      environment.api.url + 'request-demo/postDemoData',
      payload
    );
  }
}

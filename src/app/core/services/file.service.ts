import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';
import { S3FileURLResponse } from '../models/s3Responses/fileURLResponse';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) {}

  getSignedUrl(
    file_name: File['name'],
    mime_type: File['type'],
    folder: string
  ) {
    const headers = new HttpHeaders();
    const storageType =
      'storageType' in environment ? environment.storageType : 'S3Url';
    const payload = JSON.stringify([{ folder, file_name, mime_type }]);

    return this.http.post<S3FileURLResponse>(
      `${environment.api.url}/get${storageType}`,
      payload,
      { headers }
    );
  }

  uploadFileToS3(
    file: File,
    signedUrl: string,
    options = { reportProgress: true, observe: 'events' }
  ): Observable<any> {
    return this.http.put(signedUrl, file, {
      reportProgress: options.reportProgress,
      headers: { 'Content-Type': file.type },
    });
  }
}

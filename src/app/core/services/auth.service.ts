import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class AuthService {
  public badCredentials: Subject<boolean> = new Subject<boolean>();

  public helper = new JwtHelperService();
  // public decodedToken = this.helper.decodeToken(myRawToken);
  // public expirationDate = this.helper.getTokenExpirationDate(myRawToken);
  // public isExpired = this.helper.isTokenExpired(myRawToken);

  constructor(private http: HttpClient,
    private localStorageService: LocalStorageService,
  ) { }

  loginLogoutCheck = new Subject<any>();
  authenticateUser(user: any) {
    this.http.post(environment.api.url + 'users/signin', user);
  }

  getLastUpdated(params?: any) {
    return this.http.get(
      environment.api.url +
      `ledger/lastUpdated?ulb=${params?.ulb ?? ''}&state=${params?.state ?? ''}`,
    );
  }

  getCityData(ulbId: any) {
    return this.http.get(
      environment.api.url + `all-dashboard/people-information?type=ulb&ulb=${ulbId}`,
    );
  }
  signin(user: any) {
    return this.http.post(environment.api.url + 'login', user);
  }

  signup(newUser: any) {
    return this.http.post(environment.api.url + 'register', newUser);
  }

  decodeToken() {
    return this.helper.decodeToken(this.getToken());
  }

  getToken(): string {
    // return localStorage.getItem('id_token') || '';
    return this.localStorageService.getItem('id_token') || '';
  }

  /**
   * @description Checks if user is logged in or not.
   */
  loggedIn() {
    return !this.helper.isTokenExpired(this.getToken());
  }

  verifyCaptcha(recaptcha: string) {
    return this.http.post(`${environment.api.url}captcha_validate`, {
      recaptcha,
    });
  }

  logout() {
    localStorage.clear();
  }
  otpSignIn(body: any) {
    return this.http.post(`${environment.api.url}sendOtp`, body);
  }
  otpVerify(body: any) {
    return this.http.post(`${environment.api.url}verifyOtp`, body);
  }
}

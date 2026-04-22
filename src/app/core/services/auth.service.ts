import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  finalize,
  map,
  of,
  shareReplay,
  take,
  throwError,
} from 'rxjs';

import { environment } from '../../../environments/environment';
import { IUserLoggedInDetails } from '../models/login/userLoggedInDetails';

export interface AuthSessionState {
  isAuthenticated: boolean;
  isRefreshing: boolean;
  isRestoringSession: boolean;
  hasAccessToken: boolean;
  isReady: boolean;
  user: IUserLoggedInDetails | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly legacyAccessTokenStorageKey = 'id_token';
  private readonly currentUserStorageKey = 'userData';
  private readonly sessionHintStorageKey = 'auth_session_hint';
  private readonly loginUrl = `${environment.api.url}login`;
  private readonly logoutUrl = `${environment.api.url}logout`;
  private readonly refreshTokenUrl = `${environment.api.url}refresh`;
  private readonly jwtHelper = new JwtHelperService();
  private readonly apiBaseUrls = [environment.api.url, environment.api.urlV2].filter(Boolean);

  private accessToken: string | null = null;
  private refreshRequest$: Observable<string | null> | null = null;
  private restoreRequest$: Observable<boolean> | null = null;
  private isRefreshing = false;
  private isRestoringSession = this.shouldRestoreSessionOnBootstrap();

  readonly badCredentials = new BehaviorSubject<boolean>(false);
  readonly helper = this.jwtHelper;
  readonly loginLogoutCheck = new BehaviorSubject<boolean>(this.loggedIn());

  private readonly currentUserSubject =
    new BehaviorSubject<IUserLoggedInDetails | null>(this.readStoredUser());
  private readonly sessionStateSubject = new BehaviorSubject<AuthSessionState>(
    this.buildSessionState(),
  );

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly sessionState$ = this.sessionStateSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.removeLegacyTokenStorage();

    if (!this.isBrowser) {
      this.isRestoringSession = false;
    }

    this.publishSessionState();
  }

  authenticateUser(user: unknown) {
    return this.login(user);
  }

  getLastUpdated(params?: { ulb?: string; state?: string }) {
    return this.http.get(
      `${environment.api.url}ledger/lastUpdated?ulb=${params?.ulb ?? ''}&state=${params?.state ?? ''}`,
    );
  }

  getCityData(ulbId: string) {
    return this.http.get(
      `${environment.api.url}all-dashboard/people-information?type=ulb&ulb=${ulbId}`,
    );
  }

  login(user: unknown) {
    return this.http
      .post(this.loginUrl, user, { withCredentials: true })
      .pipe(
        map((response: unknown) => {
          this.applyAuthResponse(response);
          this.badCredentials.next(false);
          return response;
        }),
        catchError((error) => {
          this.badCredentials.next(true);
          return throwError(() => error);
        }),
      );
  }

  signin(user: unknown) {
    return this.login(user);
  }

  refreshToken() {
    if (!this.isBrowser) {
      return of(null);
    }

    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.isRefreshing = true;
    this.publishSessionState();

    this.refreshRequest$ = this.http
      .post(this.refreshTokenUrl, {}, { withCredentials: true })
      .pipe(
        map((response: unknown) => {
          const accessToken = this.applyAuthResponse(response);
          return accessToken;
        }),
        catchError((error) => {
          this.handleRefreshFailure(error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest$ = null;
          this.isRefreshing = false;
          this.publishSessionState();
        }),
        shareReplay(1),
      );

    return this.refreshRequest$;
  }

  refreshAccessToken() {
    return this.refreshToken();
  }

  restoreSession(): Observable<boolean> {
    if (!this.isBrowser) {
      this.isRestoringSession = false;
      this.publishSessionState();
      return of(false);
    }

    if (this.loggedIn()) {
      this.isRestoringSession = false;
      this.publishSessionState();
      return of(true);
    }

    if (this.restoreRequest$) {
      return this.restoreRequest$;
    }

    if (!this.canAttemptSilentRefresh()) {
      this.isRestoringSession = false;
      this.publishSessionState();
      return of(false);
    }

    this.isRestoringSession = true;
    this.publishSessionState();

    this.restoreRequest$ = this.refreshToken().pipe(
      map(() => this.loggedIn()),
      catchError(() => of(false)),
      finalize(() => {
        this.restoreRequest$ = null;
        this.isRestoringSession = false;
        this.publishSessionState();
      }),
      shareReplay(1),
    );

    return this.restoreRequest$;
  }

  initializeSession() {
    return this.restoreSession();
  }

  ensureAuthenticated() {
    if (this.loggedIn()) {
      return of(true);
    }

    if (this.isRestoringSession) {
      return this.waitForAuthReady().pipe(map((state) => state.isAuthenticated));
    }

    if (!this.canAttemptSilentRefresh()) {
      return of(false);
    }

    return this.refreshToken().pipe(
      map(() => this.loggedIn()),
      catchError(() => of(false)),
    );
  }

  waitForAuthReady() {
    return this.sessionState$.pipe(
      filter((state) => state.isReady),
      take(1),
    );
  }

  waitForSessionRestore() {
    if (!this.isRestoringSession) {
      return of(this.buildSessionState());
    }

    return this.waitForAuthReady();
  }

  signup(newUser: unknown) {
    return this.http.post(`${environment.api.url}register`, newUser, {
      withCredentials: true,
    });
  }

  decodeToken() {
    const token = this.getToken();
    return token ? this.helper.decodeToken(token) : null;
  }

  getToken() {
    return this.getAccessToken();
  }

  getAccessToken() {
    return this.accessToken;
  }

  hasAccessToken() {
    return !!this.accessToken;
  }

  loggedIn() {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    return !this.jwtHelper.isTokenExpired(token);
  }

  canAttemptSilentRefresh() {
    return this.isBrowser && (
      this.hasSessionHint() ||
      !!this.getCurrentUserSnapshot() ||
      this.hasAccessToken()
    );
  }

  storeTokens(authResponse: unknown) {
    this.applyAuthResponse(authResponse);
  }

  extractAccessToken(authResponse: any) {
    return (
      authResponse?.token ??
      authResponse?.accessToken ??
      authResponse?.access_token ??
      authResponse?.data?.token ??
      authResponse?.data?.accessToken ??
      authResponse?.data?.access_token ??
      null
    );
  }

  extractUser(authResponse: any): IUserLoggedInDetails | null {
    return authResponse?.user ?? authResponse?.data?.user ?? null;
  }

  isRefreshRequest(url: string) {
    return this.isUrlMatch(url, this.refreshTokenUrl);
  }

  isLoginRequest(url: string) {
    return this.isUrlMatch(url, this.loginUrl);
  }

  isLogoutRequest(url: string) {
    return this.isUrlMatch(url, this.logoutUrl);
  }

  isAuthRequest(url: string) {
    return this.isLoginRequest(url) || this.isRefreshRequest(url) || this.isLogoutRequest(url);
  }

  isApiRequest(url: string) {
    return this.apiBaseUrls.some((baseUrl) => url.startsWith(baseUrl));
  }

  shouldAttachAccessToken(url: string) {
    return this.isApiRequest(url) && !this.isAuthRequest(url);
  }

  shouldSendCredentials(url: string) {
    return this.isApiRequest(url);
  }

  verifyCaptcha(recaptcha: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${environment.api.url}captcha_validate`,
      { recaptcha },
    );
  }

  logout() {
    if (!this.isBrowser) {
      this.clearLocalStorage();
      return of(null);
    }

    return this.http.post(this.logoutUrl, {}, { withCredentials: true }).pipe(
      catchError(() => of(null)),
      finalize(() => this.clearLocalStorage()),
      shareReplay(1),
    );
  }

  otpSignIn(body: unknown) {
    return this.http.post(`${environment.api.url}sendOtp`, body, {
      withCredentials: true,
    });
  }

  otpVerify(body: unknown) {
    return this.http.post(`${environment.api.url}verifyOtp`, body, {
      withCredentials: true,
    });
  }

  clearLocalStorage(excludeKeys = ['userInfo']) {
    this.clearAccessToken();

    if (this.isBrowser) {
      const allKeys = Object.keys(localStorage);
      allKeys.forEach((key) => {
        if (!excludeKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      this.removeStorageItem(localStorage, this.currentUserStorageKey);
      this.removeStorageItem(localStorage, this.sessionHintStorageKey);
      this.removeStorageItem(sessionStorage, 'sessionID');
    }

    this.loginLogoutCheck.next(false);
    this.currentUserSubject.next(null);
    this.isRefreshing = false;
    this.isRestoringSession = false;
    this.badCredentials.next(false);
    this.publishSessionState();
  }

  clearLocalStorageKey(key: string) {
    if (!this.isBrowser) {
      return;
    }

    this.removeStorageItem(localStorage, key);

    if (key === this.currentUserStorageKey) {
      this.currentUserSubject.next(null);
      this.publishSessionState();
    }
  }

  setCurrentUser(user: IUserLoggedInDetails | null) {
    if (this.isBrowser) {
      if (user) {
        this.setStorageItem(localStorage, this.currentUserStorageKey, JSON.stringify(user));
        this.setStorageItem(localStorage, this.sessionHintStorageKey, 'true');
      } else {
        this.removeStorageItem(localStorage, this.currentUserStorageKey);
      }
    }

    this.currentUserSubject.next(user);
    this.publishSessionState();
  }

  getCurrentUserSnapshot() {
    return this.currentUserSubject.getValue();
  }

  getSessionStateSnapshot() {
    return this.sessionStateSubject.getValue();
  }

  sendOtp(email: string) {
    if (!email) {
      throw new Error('Email is mandatory!');
    }

    return this.http.post(`${environment.api.urlV2}email/sendOtp`, { email });
  }

  verifyOtp(email: string, otp: string) {
    if (!email || !otp) {
      throw new Error('Email or OTP is missing!');
    }

    return this.http.post(`${environment.api.urlV2}email/verifyOtp`, {
      email,
      otp,
    });
  }

  private applyAuthResponse(authResponse: unknown) {
    const accessToken = this.extractAccessToken(authResponse);
    const currentUser = this.extractUser(authResponse) ?? this.getCurrentUserSnapshot();

    this.accessToken = accessToken;

    if (this.isBrowser) {
      if (accessToken || currentUser) {
        this.setStorageItem(localStorage, this.sessionHintStorageKey, 'true');
      }

      if (currentUser) {
        this.setStorageItem(localStorage, this.currentUserStorageKey, JSON.stringify(currentUser));
      }

      this.removeLegacyTokenStorage();
    }

    this.currentUserSubject.next(currentUser);
    this.loginLogoutCheck.next(!!accessToken && !this.jwtHelper.isTokenExpired(accessToken));
    this.publishSessionState();

    return accessToken;
  }

  private handleRefreshFailure(error: any) {
    if ([401, 403, 440, 441].includes(error?.status)) {
      this.clearLocalStorage();
      return;
    }

    this.clearAccessToken();
  }

  private readStoredUser(): IUserLoggedInDetails | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const user = localStorage.getItem(this.currentUserStorageKey);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  private buildSessionState(): AuthSessionState {
    return {
      isAuthenticated: this.loggedIn(),
      isRefreshing: this.isRefreshing,
      isRestoringSession: this.isRestoringSession,
      hasAccessToken: this.hasAccessToken(),
      isReady: !this.isRestoringSession,
      user: this.getCurrentUserSnapshot(),
    };
  }

  private publishSessionState() {
    const state = this.buildSessionState();
    this.loginLogoutCheck.next(state.isAuthenticated);
    this.sessionStateSubject.next(state);
  }

  private clearAccessToken() {
    this.accessToken = null;

    if (this.isBrowser) {
      this.removeLegacyTokenStorage();
    }

    this.publishSessionState();
  }

  private hasSessionHint() {
    return this.isBrowser && localStorage.getItem(this.sessionHintStorageKey) === 'true';
  }

  private shouldRestoreSessionOnBootstrap() {
    return this.isBrowser && !this.loggedIn() && (
      this.hasSessionHint() ||
      !!this.readStoredUser()
    );
  }

  private removeLegacyTokenStorage() {
    if (!this.isBrowser) {
      return;
    }

    this.removeStorageItem(localStorage, this.legacyAccessTokenStorageKey);
    this.removeStorageItem(sessionStorage, this.legacyAccessTokenStorageKey);
    this.removeStorageItem(localStorage, 'refresh_token');
    this.removeStorageItem(sessionStorage, 'refresh_token');
  }

  private isUrlMatch(url: string, targetUrl: string) {
    return url === targetUrl || url.endsWith(targetUrl.replace(environment.api.url, ''));
  }

  private setStorageItem(storage: Storage, key: string, value: string) {
    storage.setItem(key, value);
  }

  private removeStorageItem(storage: Storage, key: string) {
    storage.removeItem(key);
  }
}

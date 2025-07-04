import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { catchError, filter, Observable, Subject, throwError } from 'rxjs';
import { Login_Logout } from '../util/logout.util';
import { LocalStorageService } from '../services/local-storage.service';

export const customHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);
  const routerNavigationSuccess = new Subject<any>();

  initializeRequestCancelProcess(router, routerNavigationSuccess);

  if (req.body instanceof File && req.method === 'PUT') {
    return next(req);
  }

  // const id_token = localStorage.getItem('id_token');
  const id_token = localStorageService.getItem('id_token');
  const token = id_token ? JSON.parse(id_token) : '';
  // const sessionID = sessionStorage.getItem('sessionID');

  let headers = req.headers;
  if (!req.headers.has('Accept')) {
    headers = headers.set('Content-Type', 'application/json');
  }
  // if (sessionID) {
  //   headers = headers.set('sessionId', sessionID);
  // }
  if (token) {
    headers = headers.set('x-access-token', token);
  }

  const authReq = req.clone({ headers });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 401:
          clearLocalStorage();
          router.navigate(['login']);
          break;
        case 440: {
          clearLocalStorage();
          const url = !['/', ''].includes(router.url) ? router.url : location.pathname + location.search + location.hash;
          if (!url.includes('login')) {
            sessionStorage.setItem('postLoginNavigation', url);
          }
          router.navigate(['login'], {
            queryParams: { message: 'Session Expired. Kindly login again.' },
          });
          break;
        }
        case 441:
          clearLocalStorage();
          router.navigate(['login'], {
            queryParams: {
              message: 'Password Expired. Kindly reset your password.',
            },
          });
          break;
        case 0:
          return throwError(() => ({
            error: {
              message: 'Failed to connect with Server',
            },
          }));
      }
      return throwError(() => err.error);
    })
  );
};

function initializeRequestCancelProcess(router: Router, subject: Subject<any>) {
  router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(subject);
}

function clearLocalStorage() {
  localStorage.clear();
  Login_Logout.logout();
}

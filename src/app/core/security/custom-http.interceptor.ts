import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

const AUTH_RETRY_CONTEXT = new HttpContextToken<boolean>(() => false);

export const customHttpInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const authRequest = enrichRequest(request, authService);

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        return throwError(() => ({
          error: {
            message: 'Failed to connect with Server',
          },
        }));
      }

      if (error.status === 440 || error.status === 441) {
        authService.clearLocalStorage();
        void navigateToLogin(router);
        return throwError(() => error);
      }

      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!authService.shouldSendCredentials(request.url) || authService.isAuthRequest(request.url)) {
        return throwError(() => error);
      }

      if (request.context.get(AUTH_RETRY_CONTEXT)) {
        authService.clearLocalStorage();
        void navigateToLogin(router);
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap(() => {
          const retryRequest = enrichRequest(
            request.clone({
              context: request.context.set(AUTH_RETRY_CONTEXT, true),
            }),
            authService,
          );

          return next(retryRequest);
        }),
        catchError((refreshError) => {
          authService.clearLocalStorage();
          void navigateToLogin(router);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function enrichRequest(request: HttpRequest<unknown>, authService: AuthService) {
  let headers = request.headers;

  if (!headers.has('Content-Type') && !isMultipartRequest(request)) {
    headers = headers.set('Content-Type', 'application/json');
  }

  const accessToken = authService.getAccessToken();
  if (accessToken && authService.shouldAttachAccessToken(request.url)) {
    headers = headers
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-access-token', accessToken);
  }

  return request.clone({
    headers,
    withCredentials: authService.shouldSendCredentials(request.url) || request.withCredentials,
  });
}

function isMultipartRequest(request: HttpRequest<unknown>) {
  return request.body instanceof FormData || request.body instanceof Blob;
}

function navigateToLogin(router: Router) {
  const returnUrl = router.url && router.url !== '/login' ? router.url : '/';

  return router.navigate(['/login'], {
    queryParams: returnUrl && returnUrl !== '/login' ? { returnUrl } : undefined,
  });
}

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.waitForSessionRestore().pipe(
    map((sessionState) => {
      if (sessionState.isAuthenticated) {
        return true;
      }

      return router.createUrlTree(['/login'], {
        queryParams: {
          returnUrl: state.url,
        },
      });
    }),
  );
};

export const guestOnlyGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const returnUrl = route.queryParamMap.get('returnUrl') || '/municipal-data/national';

  return authService.waitForSessionRestore().pipe(
    map((sessionState) => {
      if (!sessionState.isAuthenticated) {
        return true;
      }

      return router.parseUrl(normalizeReturnUrl(returnUrl));
    }),
  );
};

function normalizeReturnUrl(returnUrl: string) {
  if (!returnUrl || !returnUrl.startsWith('/')) {
    return '/municipal-data/national';
  }

  if (returnUrl === '/login') {
    return '/municipal-data/national';
  }

  return returnUrl;
}

import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate() {
    return this.authService.waitForSessionRestore().pipe(
      map((sessionState) => {
        if (sessionState.isAuthenticated) {
          return true;
        }

        return this.router.createUrlTree(['/home']);
      }),
    );
  }
}

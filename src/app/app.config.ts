import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { customHttpInterceptor } from './core/security/custom-http.interceptor';
import { GtmService } from './core/services/gtm.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withInterceptors([customHttpInterceptor]),
      withFetch(),
    ),
    provideAppInitializer(() => {
      inject(GtmService).init();
    }),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return firstValueFrom(authService.initializeSession());
    }),
  ],
};
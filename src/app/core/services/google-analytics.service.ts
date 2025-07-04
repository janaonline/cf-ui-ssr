import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserUtility } from '../util/user/user';
import { GtmService } from './gtm.service';
import { isPlatformBrowser } from '@angular/common';

declare let gtag: (command: string, eventName: string | Date, params?: Record<string, any>) => void;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();

  constructor(private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object, private gtmService: GtmService) { }

  init() {
    // Ensure this runs only in the browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.appendScript();
    this.onPageView();
  }

  appendScript() {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalyticsId}`;
    script.async = true;
    document.getElementsByTagName('head')[0].appendChild(script);
    const gtagEl = document.createElement('script');
    const gtagBody = document.createTextNode(`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
    `);
    gtagEl.appendChild(gtagBody);
    document.body.appendChild(gtagEl);
  }

  onPageView() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // const url = event.urlAfterRedirects;
      gtag('js', new Date());
      this.setUserId();
      // gtag('config', environment.googleAnalyticsId, { page_path: url });
    });
  }

  /**
   * Set user ID for tracking logged-in users.
   */
  public setUserId(): void {
    const user = this.loggedInUserDetails;
    let args = {};
    if (user && user._id) {
      args = {
        user_id: user._id,
      };
    }
    gtag('config', environment.googleAnalyticsId, args);
  }

  trackEvent(action: string, params?: any) {
    gtag('event', action, params);
    const gtmTag = {
      event: 'button_click',
      // category: 'User Actions',
      category: params,
      action: 'Click',
      // label: 'Buy Now Button',
      label: action,
    };
    this.gtmService.pushEvent(gtmTag);
  }

  // trackEvent1(eventName: string, params: any) {
  //   if ((window as any).gtag) {
  //     (window as any).gtag('event', eventName, params);
  //   }
  // }
}

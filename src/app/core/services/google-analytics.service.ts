import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GtmService } from './gtm.service';
import { UserUtility } from '../util/user/user';

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  private loggedInUserDetails = new UserUtility().getLoggedInUserDetails();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private gtmService: GtmService
  ) { }

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = this.loggedInUserDetails;
    if (user?._id) {
      this.gtmService.pushEvent({
        event: 'cf_user_context',
        user_id: user._id
      });
    }
  }

  setUserId(): void {
    const user = this.loggedInUserDetails;
    if (!isPlatformBrowser(this.platformId) || !user?._id) return;

    this.gtmService.pushEvent({
      event: 'cf_user_context',
      user_id: user._id
    });
  }

  trackEvent(eventName: string, params: Record<string, any> = {}): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.gtmService.pushEvent({
      event: eventName,
      ...params
    });
  }
}
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    dataLayer: Array<Record<string, any>>;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GtmService {
  private initialized = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) { }

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.initialized) return;

    const gtm = environment.gtm;
    if (!gtm?.containerId) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    const script = this.document.createElement('script');
    script.async = true;

    let src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtm.containerId)}`;

    if (gtm.auth) {
      src += `&gtm_auth=${encodeURIComponent(gtm.auth)}`;
    }

    if (gtm.preview) {
      src += `&gtm_preview=${encodeURIComponent(gtm.preview)}&gtm_cookies_win=x`;
    }

    script.src = src;
    this.document.head.appendChild(script);

    this.initialized = true;
  }

  pushEvent(event: Record<string, any>): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }
}
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GtmService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // const gtmScript = document.createElement('script');
    // gtmScript.async = true;
    // gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-5NPJ9V8V';
    // document.head.appendChild(gtmScript);
  }

  initScript() {
    // Ensure this runs only in the browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-5NPJ9V8V';
    document.head.appendChild(gtmScript);
  }

  pushEvent(event: any) {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(event);
  }
}

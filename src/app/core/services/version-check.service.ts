import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { first } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VersionCheckService {
  private readonly platformId = inject(PLATFORM_ID);
  private currentHash: string | null = null;

  constructor(private http: HttpClient) {}

  /**
   * @param url      URL of version.json (e.g. '/version.json')
   * @param frequency polling interval in ms, default 5 minutes
   */
  public initVersionCheck(url: string, frequency = 1000 * 60 * 5): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (window.location.hostname === 'localhost') return;

    this.checkVersion(url);
    setInterval(() => this.checkVersion(url), frequency);
  }

  private checkVersion(url: string): void {
    this.http
      .get<{ hash: string }>(url + '?t=' + Date.now())
      .pipe(first())
      .subscribe({
        next: ({ hash }) => {
          if (this.currentHash !== null && this.currentHash !== hash) {
            location.reload();
          }
          this.currentHash = hash;
        },
        error: (err) => console.error('version-check: could not fetch version.json', err),
      });
  }
}

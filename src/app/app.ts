import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/components/template/header/header';
import { Footer } from './shared/components/template/footer/footer';
import { FeedbackWidget } from './shared/components/feedback-widget/feedback-widget';
import { LocalStorageService } from './core/services/local-storage.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GlobalLoaderService } from './core/services/loaders/global-loader.service';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, FeedbackWidget, MatProgressSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'cf-ui-ssr';
  showLoader: unknown;

  loaderService = inject(GlobalLoaderService);

  constructor(private gaService: GoogleAnalyticsService, private localStorage: LocalStorageService) {
    const userData = { "_id": "5feeb4866d0d5e3765284b0c", "name": "15fc", "email": "15fcgrant@cityfinance.in", "isActive": true, "role": "MoHUA", "designation": "PMU", "ulbCode": "", "stateCode": "", "isUA": null, "isMillionPlus": null, "isUserVerified2223": true };
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiMTVmYyIsImVtYWlsIjoiMTVmY2dyYW50QGNpdHlmaW5hbmNlLmluIiwicm9sZSI6Ik1vSFVBIiwiaXNBY3RpdmUiOnRydWUsImlzUmVnaXN0ZXJlZCI6ZmFsc2UsIl9pZCI6IjVmZWViNDg2NmQwZDVlMzc2NTI4NGIwYyIsInB1cnBvc2UiOiJXRUIiLCJsaF9pZCI6IjY4Nzc5MmRiMTdjMGJjZjVkZjNkNDBjMyIsInNlc3Npb25JZCI6IjY4Nzc5MjE4ZDZiYmY0ZjVlNmUzNTM5NSIsInBhc3N3b3JkRXhwaXJlcyI6MTYxNzI1NTMzNjM0MCwicGFzc3dvcmRIaXN0b3J5IjpbIiQyYSQxMCQzam1qaTh4clF0MjR5UmpVYlNkV2ZPQWRlY05HZHB2VE9TNHdtS1VGZWxuVEZSSzhXNVRpSyJdLCJpYXQiOjE3NTI2NjY4NDMsImV4cCI6MTc1MjcwMjg0M30.z8CVFcEWSaXgUBmSPoJEbb0NLAg_LTCzeGbVkLUmpaM";
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('id_token', JSON.stringify(token));
    // this.loaderService.showLoader();
  }

  ngOnInit(): void {
    this.gaService.init();

    // this.router.events
    //   .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    //   .subscribe((event: NavigationEnd) => {
    //     this.gaService.sendPageView(event.urlAfterRedirects);
    //   });
  }

}

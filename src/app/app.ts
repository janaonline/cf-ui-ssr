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
    // const userData = {};
    // localStorage.setItem('userData', JSON.stringify(userData));
    // localStorage.setItem('id_token', '');
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

import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterOutlet } from '@angular/router';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';
import { GlobalLoaderService } from './core/services/loaders/global-loader.service';
import { LocalStorageService } from './core/services/local-storage.service';
import { FeedbackWidget } from './shared/components/feedback-widget/feedback-widget';
import { Footer } from './shared/components/template/footer/footer';
import { Header } from './shared/components/template/header/header';

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
    // const token = '';
    // localStorage.setItem('userData', JSON.stringify(userData));
    // localStorage.setItem('id_token', JSON.stringify(token));
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

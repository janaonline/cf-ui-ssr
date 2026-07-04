import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';
import { GlobalLoaderService } from './core/services/loaders/global-loader.service';
import { LocalStorageService } from './core/services/local-storage.service';
import { VersionCheckService } from './core/services/version-check.service';
import { ReportIssueDialog } from './shared/components/report-issue-dialog/report-issue-dialog';
import { Footer } from './shared/components/template/footer/footer';
import { Header } from './shared/components/template/header/header';
const INCLUDED_ROUTES: string[] = ['^/municipal-data'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, MatProgressSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'cf-ui-ssr';
  showLoader: unknown;

  loaderService = inject(GlobalLoaderService);
  readonly dialog = inject(MatDialog);
  showReportIssueBtn = signal(false);

  constructor(
    private gaService: GoogleAnalyticsService,
    private localStorage: LocalStorageService,
    private router: Router,
    private versionCheck: VersionCheckService,
  ) {
    // const userData = {};
    // const token = '';
    // localStorage.setItem('userData', JSON.stringify(userData));
    // localStorage.setItem('id_token', JSON.stringify(token));
    // this.loaderService.showLoader();
  }

  ngOnInit(): void {
    this.gaService.init();
    this.trackReportIssueBtnVisibility();
    // Check for app updates every hour
    this.versionCheck.initVersionCheck('/version.json', 1000 * 60 * 60);

    // this.router.events
    //   .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    //   .subscribe((event: NavigationEnd) => {
    //     this.gaService.sendPageView(event.urlAfterRedirects);
    //   });
  }

  trackReportIssueBtnVisibility() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.urlAfterRedirects)
      )
      .subscribe((url) => {
        if (this.isIncludedRoute(url)) {
          this.showReportIssueBtn.set(true);
        } else {
          this.showReportIssueBtn.set(false);
        }
      });
  }

  private isIncludedRoute(url: string): boolean {
    return INCLUDED_ROUTES.some((pattern) => new RegExp(pattern).test(url));
  }

  openDialog() {
    const dialogRef = this.dialog.open(ReportIssueDialog, {
      data: { pageContext: this.router.url },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog closed with ${result}`);
    });
  }
}

import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../../../core/services/common.service';
import { SeoService } from '../../../core/services/seo/seo.service';
import { GridView } from '../../../shared/components/grid-view/grid-view';
import { InfoCards } from '../../../shared/components/info-cards/info-cards';
import { PreLoader } from '../../../shared/components/pre-loader/pre-loader';
import { NationalDashboard } from '../../../shared/services/national-dashboard';
import { DashboardService } from '../dashboard-service';
import { DataAvailability } from "./data-availability/data-availability";
import { FinancialIndicators } from "./financial-indicators/financial-indicators";
import { NationalService } from './national.service';
import { Resources } from "./resources/resources";

// const CREDIT_RATINGS_KEY = makeStateKey<any>('creditRatings');


@Component({
  selector: 'app-national',
  imports: [
    PreLoader,
    GridView,
    RouterModule,
    InfoCards,
    MatTabsModule,
    DatePipe,
    DataAvailability,
    Resources,
    FinancialIndicators
  ],
  templateUrl: './national.html',
  styleUrl: './national.scss'
})
export class National implements OnInit {
  readonly v1Url = environment.v1Url;
  selectedIndex = 0;
  // isLoading = signal(false);
  loadedTabs: boolean[] = [true, false, false, false];
  moneyInfo = signal<any[]>([]);
  ledgerYears = signal<string[]>([]);
  selectedLedgerYear = signal<string>('');
  dashboardTabs = signal<any[]>([]);
  private destroy$ = new Subject<void>();

  constructor(
    private _commonService: CommonService,
    private dashboardService: DashboardService,
    private seoService: SeoService,
    private nationalService: NationalService,
    public nationalDashboardService: NationalDashboard,
  ) { }

  ngOnInit() {
    this.setSeo();
    this.getDashboardTabData();
    this.nationalDashboardService.fetchCreditRatingsData('national');
    this.getLedgerYears();
  }

  setSeo() {
    const title = 'Municipal Financial Data of Indian Cities | City Finance';
    const url = `${environment.baseUrl}/municipal-data/national`;
    const keywords = `audited financial statements, municipal finance, budget`;
    const desc = `View aggregated data availability for municipal finance across Indian cities. Explore revenue and expenditure trends and benchmark performance.`

    this.seoService.updateTitle(title);

    this.seoService.updateMetaTags([
      { name: 'description', content: desc },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      // { property: 'robotsrobots', content: 'index, follow' }
    ]);

    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": title,
      "url": url,
      "keywords": keywords,
      "description": desc,
      "spatial": `India`,
      "temporalCoverage": "2021/2024",
    });
  }

  private getLedgerYears() {
    return this._commonService.getLedgerYears().subscribe({
      next: (res) => {
        this.ledgerYears.set(res.ledgerYears);
        this.selectedLedgerYear.set(this.ledgerYears()[1]);
      },
      error: () => console.error('Failed to get years'),
      complete: () => this.getMoneyInfo()
    });
  }

  // Drop down selection.
  public onMoneyInfoYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) {
      this.selectedLedgerYear.set(yearSelected);
      this.getMoneyInfo();
    }
  }

  // Money info cards.
  private getMoneyInfo() {
    if (this.selectedLedgerYear()) {
      this.dashboardService.getMoneyInfo(this.selectedLedgerYear()).subscribe({
        next: (res: any) => this.moneyInfo.set(res.result),
        error: () => console.error('Failed to get money info'),
      });
    }
  }

  // Add tabs dynamically.
  private getDashboardTabData() {
    this.dashboardService
      .getDashboardTabData('619cc10e6abe7f5b80e45c6d')
      .subscribe({
        next: (tabs: any) => {
          this.dashboardTabs.set(tabs);
          this.nationalService.selectedTabName.set(this.dashboardTabs()[0].name);
        },
        error: (error: any) => console.log(error)
      }
      );
  }

  public onTabChange(idx: number): void {
    this.loadedTabs[idx] = true;
    this.nationalService.selectedTabName.set(this.dashboardTabs()[idx].name);
    this.nationalService.selectedButtonKey.set('');
  }

  // Unsubscribe.
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
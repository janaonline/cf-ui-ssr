import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../../core/services/seo/seo.service';
import { CitySearch } from '../../../shared/components/city-search/city-search';
import { GridView } from '../../../shared/components/grid-view/grid-view';
import { InfoCards } from '../../../shared/components/info-cards/info-cards';
import { PreLoader } from '../../../shared/components/pre-loader/pre-loader';
import { StateSearch } from '../../../shared/components/state-search/state-search';
import { DashboardService } from '../dashboard-service';
import { FinancialIndicator } from '../state/financial-indicator/financial-indicator';
//import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-national',
  imports: [
    PreLoader, GridView, StateSearch, CitySearch, RouterModule,
    InfoCards, MatTabsModule, DatePipe, FinancialIndicator,
  ],
  templateUrl: './national.html',
  styleUrl: './national.scss'
})
export class National implements OnInit {
  isLoading = signal(false);

  ledgerYears = signal<string[]>([]);
  selectedLedgerYear = signal<string>('2021-22');
  dashboardTabs = signal<any[]>([]);
  details = signal<any>({});
  gridData = signal<any>({});
  moneyInfo = signal<any[]>([]);
  lastModifiedAt = '2024-12-03T14:10:45.247Z';
  loadedTabs: boolean[] = [true, false, false, false];

  constructor(
    private dashboardService: DashboardService,
    private seoService: SeoService,
  ) { }

  ngOnInit() {
    this.setSeo();
    this.loadData();
    this.getDashboardTabData();
    this.getMoneyInfo();
  }
  setSeo() {
    this.seoService.updateTitle('Municipal Financial Data of Indian Cities | City Finance ');

    this.seoService.updateMetaTags([
      { name: 'description', content: `View aggregated data availability for municipal finance across Indian cities. Explore revenue and expenditure trends and benchmark performance.` },
      { name: 'keywords', content: '' },
      { property: 'og:title', content: 'Municipal Financial Data of Indian Cities | City Finance ' },
      { property: 'og:description', content: 'View aggregated data availability for municipal finance across Indian cities. Explore revenue and expenditure trends and benchmark performance.' },
      { property: 'og:url', content: `https://cityfinance.in/dashboard/national/61e150439ed0e8575c881028` },
      { property: 'og:type', content: 'website' },
      //{ property: 'robotsrobots', content: 'index, follow' }
    ]);

    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "City Finance",
      "url": `https://cityfinance.in/dashboard/national/61e150439ed0e8575c881028`

    });
  }

  // Fetch data.
  loadData() {
    this.isLoading.set(true);
    // Check transfer state.
    // const params = { slug: slugName, year: this.selectedLedgerYear() || '2021-22' };
    this.dashboardService.getHomeData().subscribe({
      // next: (res: ExploreSectionResponse) => {
      next: (res: any) => {
        // this.details.set(res.data);
        this.gridData.set(res);
        console.log('gridData---', this.gridData());
        // this.stateDetails.set(res.data);
        // console.log(this.stateDetails())
      },
      error: (error: Error) => {
        this.isLoading.set(false);
        console.error('Failed to get state details');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    })
  }

  getMoneyInfo() {
    this.dashboardService.getMoneyInfo(this.selectedLedgerYear()).subscribe({
      next: (res: any) => {
        this.moneyInfo.set(res.result);
      },
      error: (error: Error) => {
        console.error('Failed to get money info');
      }
    });
  }


  getDashboardTabData() {
    this.dashboardService
      .getDashboardTabData('619cc10e6abe7f5b80e45c6d')
      .subscribe({
        next: (tabs: any) => {
          // this.setButtons(res["data"]);
          this.dashboardTabs.set(tabs);
        }, error: (error: any) => {
          console.log(error);
        }
      }
      );
  }

  public onTabChange(idx: number): void {
    this.loadedTabs[idx] = true;
  }

}

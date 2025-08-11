import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExploresectionTable, IMoneyInfoRes } from '../../../core/models/interfaces';
import { IULB } from '../../../core/models/ulb';
import { SeoService } from '../../../core/services/seo/seo.service';
import { ChartConfig } from '../../../shared/components/charts/chart-interfaces';
import { Charts } from "../../../shared/components/charts/charts";
import { gaugeChartOptions } from '../../../shared/components/charts/constants';
import { CitySearch } from "../../../shared/components/city-search/city-search";
import { GridView } from "../../../shared/components/grid-view/grid-view";
import { InfoCards } from "../../../shared/components/info-cards/info-cards";
import { Map } from "../../../shared/components/map/map";
import { PreLoader } from "../../../shared/components/pre-loader/pre-loader";
import { StateSearch } from "../../../shared/components/state-search/state-search";
import { DashboardService } from '../dashboard-service';
import { BorrowingCreditRating } from './borrowing-credit-rating/borrowing-credit-rating';
import { FinancialIndicator } from './financial-indicator/financial-indicator';

@Component({
  selector: 'app-state',
  imports: [
    PreLoader, GridView, StateSearch, CitySearch, RouterModule,
    Map, InfoCards, MatTabsModule, DatePipe, FinancialIndicator, BorrowingCreditRating, Charts],
  templateUrl: './state.html',
  styleUrl: './state.scss'
})
export class State implements OnInit {
  readonly v1Url = environment.v1Url;

  isLoading = signal(false);
  isMoneyInfoLoading = signal(false);
  loadedTabs: boolean[] = [false, false, true];
  showMap = signal(true);

  ledgerYears = signal<string[]>([]);
  selectedLedgerYear = signal<string>('');

  slugName = signal<string>('');
  stateIdSignal = signal('');
  stateDetails = signal<any>({});
  dataAvailable = signal<any>({});


  gridData: ExploresectionTable[] = [];
  moneyInfoRes = signal<IMoneyInfoRes>({
    "result": [
      {
        "sequence": 1,
        "label": "Total Tax Revenue",
        "value": "29743502907",
        "info": "",
        "src": "./assets/images/money-info/file.svg"
      },
      {
        "sequence": 2,
        "label": "Total Own Revenue",
        "value": "38504421948",
        "info": "",
        "src": "./assets/images/money-info/file.svg"
      },
      {
        "sequence": 3,
        "label": "Total Grant",
        "value": "16402148000",
        "info": "",
        "src": "./assets/images/money-info/coins.svg"
      },
      {
        "sequence": 4,
        "label": "Total Revenue",
        "value": "55867806918",
        "info": "",
        "src": "./assets/images/money-info/coins.svg"
      },
      {
        "sequence": 5,
        "label": "Total Expenditure",
        "value": "64648653961",
        "info": "",
        "src": "./assets/images/money-info/coins.svg"
      },
      {
        "sequence": 6,
        "label": "Total Balance Sheet Size",
        "value": "195642578182",
        "info": "",
        "src": "./assets/images/money-info/group.svg"
      }
    ],
    "year": "2021-22",
    "isActive": true,
    "audit_status": "Unaudited",
    "lastModifiedAt": "2024-12-03T14:10:45.247Z",
  });

  private destroy$ = new Subject<void>();
  dashboardTabs = signal<any>({});
  buttons: any;
  tabs: any[] = [];

  chartData: ChartConfig[] = [
    {
      "chartId": "slb0",
      "chartType": "gaugeChart",
      "labels": [""],
      "datasets": [
        {
          "label": "Data available",
          "data": [135, 20],
          "backgroundColor": ["#1b4965", "#e9ecef"],
          "borderWidth": 1,
          "borderRadius": 5
        }
      ],
      "options": gaugeChartOptions,
      "additionalInfo": {
        "value": 95,
        "indicatorName": "Data Standardized (2021-22)",
        "nationalAvg": 0,
        "unit": "%"
      }
    }
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private dashboardService: DashboardService,
  ) { }

  ngOnInit() {
    this.getDashboardTabData();
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        console.log(params)
        const slugName = params.get('slug') || '';
        this.selectedLedgerYear.set('');

        console.log(this.slugName(), slugName)

        if (slugName && slugName !== this.slugName()) {
          this.slugName.set(slugName);
          this.loadData(slugName);
        } else if (!slugName) this.isLoading.set(false);
      });
    // this.loadData('test');
  }

  setSeo() {
    this.seoService.updateTitle('Municipal Financial Data of AP Cities | City Finance ');

    this.seoService.updateMetaTags([
      { name: 'description', content: `View aggregated municipal finance data availability for Andhra Pradesh cities. Benchmark financial performance of ULBs and explore trends in revenue and expenditure. ` },
      { name: 'keywords', content: ' municipal finance, city data, ULB performance, revenue trends, expenditure analysis, city benchmarking,  cities, financial dashboard, urban governance' },
      { property: 'og:title', content: 'Municipal Financial Data of Ap Cities | City Finance ' },
      { property: 'og:description', content: 'View aggregated municipal finance data availability for Andhra Pradesh cities. Benchmark financial performance of ULBs and explore trends in revenue and expenditure. ' },
      { property: 'og:url', content: `https://cityfinance.in/dashboard/slb` },
      { property: 'og:type', content: 'website' },
      //{ property: 'robotsrobots', content: 'index, follow' }
    ]);

    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "City Finance",
      "url": `https://cityfinance.in/dashboard/slb`
    });
  }

  getDashboardTabData() {
    this.dashboardService
      .getDashboardTabData("619cc1016abe7f5b80e45c6b")
      .subscribe({
        next: (tabs: any) => {
          this.dashboardTabs.set(tabs);
        }, error: (error: any) => {
          console.log(error);
        }
      }
      );
  }

  // Fetch data.
  loadData(slugName: string) {
    this.isLoading.set(true);
    // Check transfer state.
    const params = { slug: slugName, year: this.selectedLedgerYear() || '2021-22' };
    this.dashboardService.getStateDetails(params).subscribe({
      // next: (res: ExploreSectionResponse) => {
      next: (res: any) => {
        this.stateDetails.set(res.data);
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

  getDataAvailable() {
    // this.isMoneyInfoLoading.set(true);
    const payload = { "financialYear": this.selectedLedgerYear(), "stateId": this.stateDetails().stateId };
    this.dashboardService.getDataAvailable(payload).subscribe({
      next: (res: any) => {
        this.dataAvailable.set(res);
      },
      error: (error: Error) => {
        console.error('Failed to get data availability');
      },
      complete: () => {
        // this.isMoneyInfoLoading.set(false);
      }
    });
  }

  // Ulb selected in city search drop down.
  onUlbSelected(ulbObj: IULB) {
    console.log("ULB selected from drop down: ", ulbObj)
  }

  // Ulb selected from map
  selectedUlbObjChange(ulbObj: IULB) {
    console.log("ULB selected from map: ", ulbObj)
  }

  // On tab changes call the chid components.
  public onTabChange(idx: number): void {
    this.loadedTabs[idx] = true;
  }
}




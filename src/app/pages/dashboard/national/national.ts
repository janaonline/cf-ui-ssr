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
import { ICreditRatingData } from '../../../core/models/creditRating/creditRatingResponse';
//import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-national',
  imports: [
    PreLoader, GridView,
    //  StateSearch, CitySearch, 
    RouterModule,
    InfoCards, MatTabsModule, DatePipe,
    //  FinancialIndicator,
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
  creditRatingData: any;
  gridDataFomat: any = {
    showMap: false,
    name: "National Performance",
    desc: "Summary of key national-level demographics and municipal (urban) indicators",
    dataIndicators: [
      {
        value: "",
        label: "ULBs With Financial Data",
        key: "coveredUlbCount",
      },
      {
        value: "",
        label: "Financial Statements ",
        // key: "Municipal_Corporation",
        key: "financialStatements",
      },
      {
        value: 223,
        label: "ULBs Credit Rating Reports",
        key: "ULBCreditRating",
      },
      {
        value: 95,
        label: "ULBs With Investment Grade Rating",
        key: "UlbsWithBBB",
      },
      {
        value: 22,
        label: "ULBs With Rating A & Above",
        key: "ulbsWithA",
      },
      {
        value: "",
        label: "",
        key: "totalMunicipalBonds",
      },
    ],
    footer: `Data shown is from audited/provisional financial statements for FY 20-21
  and data was last updated on 21st August 2021`,
  };
  creditRatingList!: ICreditRatingData[];
  creditRating: any;
  creditRatingAboveBBB_Minus: any;
  creditRatingAboveA: any;
  absCreditInfo: any = {
    title: "",
    ulbs: 0,
    creditRatingUlbs: 0,
    ratings: {
      "AAA+": 0,
      AAA: 0,
      "AAA-": 0,
      "AA+": 0,
      AA: 0,
      "AA-": 0,
      "A+": 0,
      A: 0,
      "A-": 0,
      "BBB+": 0,
      BBB: 0,
      "BBB-": 0,
      BB: 0,
      "BB+": 0,
      "BB-": 0,
      "B+": 0,
      B: 0,
      "B-": 0,
      "C+": 0,
      C: 0,
      "C-": 0,
      "D+": 0,
      D: 0,
      "D-": 0,
    },
  };

  constructor(
    private dashboardService: DashboardService,
    private seoService: SeoService,
  ) { }

  ngOnInit() {
    this.setSeo();
    this.getHomeData();
    this.getCreditRatingsData();
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
  getHomeData() {
    this.isLoading.set(true);
    // Check transfer state.
    // const params = { slug: slugName, year: this.selectedLedgerYear() || '2021-22' };
    this.dashboardService.getHomeData().subscribe({
      // next: (res: ExploreSectionResponse) => {
      next: (res: any) => {
        this.gridDataFomat.dataIndicators.forEach((indicator: any) => {
          if (res.data[indicator.key]) {
            indicator.value = res.data[indicator.key].toLocaleString('en-IN');
          }
        });
        this.gridData.set(this.gridDataFomat);

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

  // Fetch credit rating data from service
  private getCreditRatingsData(): void {
    // console.log('Fetching credit rating data...', abc);
    this.isLoading.set(true);
    this.dashboardService.getCreditRatings().subscribe({
      next: (res) => {
        // this.creditRatingData = res || [];
        this.computeStatesTotalRatings(res)
      },
      error: (err) => {
        console.error('Failed to fetch credit rating data', err);
        this.creditRatingData = [];
      },
      complete: () => {
        // this.processCreditRatingData();
        this.isLoading.set(false);
      },
    });
  }

  //  private fetchCreditRatingTotalCount() {
  //   this.assetService
  //     .fetchCreditRatingReport()
  //     .subscribe((res) => this.computeStatesTotalRatings(res));
  // }
  private computeStatesTotalRatings(res: ICreditRatingData[]) {
    this.creditRatingList = res;

    const computedData: any = { total: 0, India: 0 };
    res.forEach((data) => {
      if (computedData[data.state] || computedData[data.state] === 0) {
        computedData[data.state] += 1;
      } else {
        computedData[data.state] = 1;
      }
      computedData.total += 1;
      computedData["India"] += 1;
    });

    this.creditRating = computedData;
    this.gridDataFomat.dataIndicators.map((elem: any) => {
      if (elem.key == "ULBCreditRating") {
        elem.value = computedData?.total.toString();
      }
    });
    this.showCreditInfoByState();
  }

  showCreditInfoByState() {
    const ulbList = [];

    for (let i = 0; i < this.creditRatingList?.length; i++) {
      const ulb = this.creditRatingList[i];
      ulbList.push(ulb["ulb"]);
      const rating = ulb.creditrating?.trim();
      this.calculateRatings(this.absCreditInfo, rating);
    }

    this.creditRatingAboveA =
      this.absCreditInfo["ratings"]["A"] +
      this.absCreditInfo["ratings"]["A+"] +
      this.absCreditInfo["ratings"]["AA"] +
      this.absCreditInfo["ratings"]["AA+"] +
      this.absCreditInfo["ratings"]["AA-"] +
      this.absCreditInfo["ratings"]["AAA"] +
      this.absCreditInfo["ratings"]["AAA+"] +
      this.absCreditInfo["ratings"]["AAA-"];

    this.creditRatingAboveBBB_Minus =
      this.creditRatingAboveA +
      this.absCreditInfo["ratings"]["A-"] +
      this.absCreditInfo["ratings"]["BBB"] +
      this.absCreditInfo["ratings"]["BBB+"] +
      this.absCreditInfo["ratings"]["BBB-"];

    this.absCreditInfo["title"] = "India";
    this.absCreditInfo["ulbs"] = ulbList;

    this.gridDataFomat.dataIndicators.map((elem: any) => {
      if (elem.key == "ulbsWithA") {
        elem.value = this.creditRatingAboveA;
      } else if (elem.key == "UlbsWithBBB") {
        elem.value = this.creditRatingAboveBBB_Minus;
      }
    });

    console.log(' this.gridDataFomat.dataIndicators', this.gridDataFomat.dataIndicators);
  }
  calculateRatings(dataObject: any, ratingValue: any) {
    if (!dataObject && !dataObject["ratings"] && !dataObject["ratings"][ratingValue]) {
      dataObject["ratings"][ratingValue] = 0;
    }
    dataObject["ratings"][ratingValue] = dataObject["ratings"][ratingValue] + 1;
    dataObject["creditRatingUlbs"] = dataObject["creditRatingUlbs"] + 1;
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

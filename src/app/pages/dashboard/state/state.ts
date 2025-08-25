import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ExploresectionTable, IMoneyInfoRes } from '../../../core/models/interfaces';
import { IState } from '../../../core/models/state/state';
import { IULB } from '../../../core/models/ulb';
import { CommonService } from '../../../core/services/common.service';
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
import { gaugeChartConfig } from './chart-constant';

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
  isYearLoading = signal(false);
  isMoneyInfoLoading = signal(true);
  loadedTabs: boolean[] = [false, false, true];
  showMap = signal(true);

  ledgerYears = signal<string[]>([]);
  selectedLedgerYear = signal<string>('');

  slugName = signal<string>('');
  stateIdSignal = signal('');
  stateDetails = signal<any>({});
  dataAvailablePerc = signal<any>(0);
  dataAvailableUlbs = signal<string[]>(['']);

  percentValue = 0;
  selectedValue: string = '';
  selectedTabIndex = 0;


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

  chartDataCongfig: ChartConfig = gaugeChartConfig;
  chartData = signal<ChartConfig>(this.chartDataCongfig);
  isDataLoading = signal<boolean>(false);

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private seoService: SeoService,
    private _commonService: CommonService,
    private dashboardService: DashboardService,
  ) { }

  ngOnInit() {
    this.getDashboardTabData();
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        // console.log(params)
        const slugName = params.get('slug') || '';
        // this.selectedLedgerYear.set('');

        // console.log(this.slugName(), slugName)

        if (slugName && slugName !== this.slugName()) {
          this.slugName.set(slugName);
          this.resetTab();
          this.loadData(slugName);
        } else if (!slugName) this.isLoading.set(false);
      });
  }

  resetTab() {
    this.selectedTabIndex = 0;
    this.stateDetails.set({});
  }

  setSeo() {
    const state = this.stateDetails().state;
    const title = `Municipal Financial Data of ${state.name} Cities | City Finance`;
    const url = `${environment.baseUrl}/municipal-data/state/${state.slug}`;
    const desc = `View aggregated municipal finance data availability for ${state.name} cities. Benchmark financial performance of ULBs and explore trends in revenue and expenditure.`
    const keywords = `${state.name} audited financial statements, municipal finance, ${state.name} budget`;

    this.seoService.updateTitle(title);

    this.seoService.updateMetaTags([
      { name: 'description', content: desc },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      //{ property: 'robotsrobots', content: 'index, follow' }
    ]);

    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": title,
      "url": url,
      "keywords": keywords,
      "description": desc,
      "spatial": `${state.name}, India`,
      "temporalCoverage": "2021/2024",
    });
  }

  // Get tabs.
  private getDashboardTabData() {
    this.dashboardService
      .getDashboardTabData("619cc1016abe7f5b80e45c6b")
      .subscribe({
        next: (tabs: any) => {
          this.dashboardTabs.set(tabs)
        },
        error: (error: any) => console.log(error)
      }
      );
  }


  // Fetch data.
  loadData(slugName: string) {
    this.isLoading.set(true);
    const params = { slug: slugName, year: this.selectedLedgerYear() };
    this.dashboardService.getStateDetails(params).subscribe({
      next: (res: any) => {
        this.stateDetails.set(res.data);
        this.setSeo();
      },
      error: () => {
        this.isLoading.set(false);
        console.error('Failed to get state details');
      },
      complete: () => {
        this.getLedgerYears();
        this.isLoading.set(false);
      }
    })
  }

  loadTopPanelData() {
    this.getMoneyInfo();
    this.getDataAvailable();
  }

  private getLedgerYears() {
    const stateCode = this.stateDetails()?.state?.code;
    if (!stateCode) {
      console.error("State code not found!");
      return;
    }
    this._commonService.getLedgerYears(stateCode).subscribe({
      next: (res) => {
        this.ledgerYears.set(res.ledgerYears);
        this.selectedLedgerYear.set(this.ledgerYears()[1]);
      },
      error: () => console.error("Failed to get ledger years."),
      complete: () => {
        this.loadTopPanelData();
      }

    })
  }

  // Money info cards.
  private getMoneyInfo() {
    this.isMoneyInfoLoading.set(true);
    const stateId = this.stateDetails()?.state?._id;
    if (!stateId) {
      console.error("State id not found: money info");
      return;
    }
    const yearSelected = this.selectedLedgerYear();
    return this.dashboardService.getMoneyInfo(yearSelected, stateId).subscribe({
      next: (res) => {
        this.moneyInfoRes.set(res)
        this.isMoneyInfoLoading.set(false);
      },
      error: () => {
        console.error("Failed to get money info.");
        this.isMoneyInfoLoading.set(false);
      }
    })
  }

  // "Standardized Data Availability" section
  private getDataAvailable(csv: boolean = false) {
    const payload: { financialYear: string; stateId: any; csv?: boolean } = { financialYear: this.selectedLedgerYear(), stateId: this.stateDetails().state._id };
    if (csv) payload.csv = true;
    else {
      if ('csv' in payload) delete payload.csv;
      this.isDataLoading.set(true);
    }

    this.dashboardService.getDataAvailable(payload).subscribe({
      next: (res: any) => {
        if (csv) {
          // console.log('test',)
          this._commonService.downloadExcel(res, 'DataAvailable');
        } else {
          this.dataAvailablePerc.set(Math.round(res.data?.percent));
          this.dataAvailableUlbs.set(res.data?.names);
          this.chartDataCongfig.datasets[0].data = [this.dataAvailablePerc(), 100 - this.dataAvailablePerc()];
          if (this.chartDataCongfig.additionalInfo) {
            this.chartDataCongfig.additionalInfo.value = this.dataAvailablePerc();
            this.chartDataCongfig.additionalInfo.indicatorName = `Data Standardized (${this.selectedLedgerYear()})`;
          }
          this.chartData.set(this.chartDataCongfig);
          this.isDataLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Failed to get data availability', err)
        this.isDataLoading.set(false);
      },
    });
  }

  onStateSelection(state: IState) {
    this.router.navigate(['/municipal-data/state', state.slug]);
  }
  // Ulb selected in city search drop down.
  onUlbSelected(ulbObj: IULB) {
    // console.log("ULB selected from drop down: ", ulbObj)
    this.router.navigate(['/municipal-data/city', ulbObj.slug]);
  }

  // Ulb selected from map
  selectedUlbObjChange(ulbObj: IULB) {
    console.log("ULB selected from map: ", ulbObj)
  }

  // Year changed from drop-down.
  onMoneyInfoYearChange($event: Event) {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) {
      this.selectedLedgerYear.set(yearSelected);
      this.loadTopPanelData();
    }
  }

  // On tab changes call the chid components.
  public onTabChange(idx: number): void {
    this.loadedTabs[idx] = true;
    if (idx === 1) {
      this.getSLBYears();
    }
  }

  getSLBYears() {
    this.isYearLoading.set(true);
    this.dashboardService.getYearListSLB().subscribe(
      (res: any) => {
        this.isYearLoading.set(false);
        this.ledgerYears.set(res["data"]);
      },
      (err) => {
        console.log(err.message);
        this.isYearLoading.set(false);
      }
    );

  }

  // Downlaod data.
  downloadData(key: string) {
    console.log('key = ', key)
    if (key === 'dataAvailable') this.getDataAvailable(true);
  }
}




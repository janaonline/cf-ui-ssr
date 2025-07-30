import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ExploreSectionResponse, ExploresectionTable, IMoneyInfoRes } from '../../../core/models/interfaces';
import { IULB } from '../../../core/models/ulb';
import { SeoService } from '../../../core/services/seo/seo.service';
import { CitySearch } from "../../../shared/components/city-search/city-search";
import { GridView } from "../../../shared/components/grid-view/grid-view";
import { InfoCards } from "../../../shared/components/info-cards/info-cards";
import { Map } from "../../../shared/components/map/map";
import { PreLoader } from "../../../shared/components/pre-loader/pre-loader";
import { StateSearch } from "../../../shared/components/state-search/state-search";
import { single, Subject, takeUntil } from 'rxjs';
import { DashboardService } from '../dashboard-service';
import { FinancialIndicator } from './financial-indicator/financial-indicator';
import { IState } from '../../../core/models/state/state';

@Component({
  selector: 'app-state',
  imports: [PreLoader, GridView, StateSearch, CitySearch, Map, InfoCards, MatTabsModule, DatePipe, FinancialIndicator],
  templateUrl: './state.html',
  styleUrl: './state.scss'
})
export class State implements OnInit {
  readonly v1Url = environment.v1Url;

  isLoading = signal(false);
  isMoneyInfoLoading = signal(false);
  loadedTabs: boolean[] = [true, false, false, false];
  showMap = signal(true);

  ledgerYears = signal<string[]>([]);
  selectedLedgerYear = signal<string>('');

  slugName = signal<string>('');
  stateIdSignal = signal('');
  stateDetails = signal<any>({});


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

  constructor(
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private dashboardService: DashboardService,
  ) { }

  ngOnInit() {
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

  // Fetch data.
  loadData(slugName: string) {
    this.isLoading.set(true);
    // Check transfer state.
    const params = { slug: slugName, year: this.selectedLedgerYear() || '2021-22' };
    this.dashboardService.getStateDetails(params).subscribe({
      // next: (res: ExploreSectionResponse) => {
      next: (res: any) => {
        this.stateDetails.set(res.data);
        console.log(this.stateDetails())
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




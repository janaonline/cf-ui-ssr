import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, DestroyRef, inject, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { IULB } from '../../../../../core/models/ulb';
import { InrFormatPipe } from "../../../../../core/pipes/inr-format.pipe";
import { GlobalLoaderService } from '../../../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../../../core/services/utility-service';
import { DashboardService } from '../../../dashboard-service';
import { ChartConfig, ChartDataSet } from '../../../../../shared/components/charts/chart-interfaces';
import { Charts } from "../../../../../shared/components/charts/charts";
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../../shared/components/charts/constants';
import { CitySearch } from "../../../../../shared/components/city-search/city-search";
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, distinctUntilChanged, firstValueFrom, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';
import { ViewportScroller } from '@angular/common';
const GRAPH_COLORS = ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743", '#f43f5e', '#B388FF'];
import { SelectionModel } from '@angular/cdk/collections';
import html2canvas from 'html2canvas';
import { CreateExcelParams } from '../../../../../core/models/interfaces';
const DEFAULT_STYLES = {
  alignment: { vertical: 'middle' },
  font: { name: 'Aptos', size: 10 },
}
type HeaderItem = { key: string; label: string };
type RowItem = Record<string, string | number>;
type ApiBlock = { keyType: string; headers: HeaderItem[]; data: any[] };
interface CityGroup {
  name: string;          // city name (from selectedCities)
  startCol: number;      // Excel column index (1-based)
  endCol: number;        // Excel column index (1-based)
}
interface RadioOption {
  key: string;
  label: string;
  value?: string;
  isActive: boolean;
  children?: RadioOption[];
};

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    CitySearch,
    MatSelectModule,
    Charts,
    InrFormatPipe
  ],
  templateUrl: './compare.html',
  styleUrl: './compare.scss'
})
export class Compare implements OnInit {
  private destroyRef = inject(DestroyRef);
  readonly currencyOptions = { showSymbol: true, showUnit: false };
  readonly whatYouWillGet = [
    {
      header: 'Charts',
      label: 'Side-by-side visual comparison of city finances across years and indicators',
      src: './assets/images/chart.png'
    },
    {
      header: 'Tables',
      label: 'Downloadable data tables for deeper analysis',
      src: './assets/images/table.png'
    },
    {
      header: 'Exports',
      label: 'PNG or CSV exports for your reports and presentations',
      src: './assets/images/export.png'
    },
  ]
  readonly sampleComparisons = [
    {
      line1: '3Y Own Revenue Data',
      line2: 'for Mumbai–Bengaluru–Pune',
      cities: ['mumbai', 'bengaluru', 'pune'],   // <-- slugs here
      indicatorKey: 'receipts',
      yearsCount: 3
    },
    {
      line1: '3Y Property Tax',
      line2: 'of Ahmedabad–Surat–Indore',
      cities: ['ahmedabad', 'surat', 'indore'],
      indicatorKey: 'taxRevenue',
      yearsCount: 3
    },
    {
      line1: '3Y Debt Data',
      line2: 'of Mumbai–Indore–Hyderabad',
      cities: ['mumbai', 'indore', 'hyderabad'],
      indicatorKey: 'debt',
      yearsCount: 3
    }
  ];

  readonly introCheckBoxText = [
    'Standardized data',
    'Shaped by investor feedback',
    'No logins necessary',
  ]
  readonly indicatorsArr = signal<RadioOption[]>([
    // { label: "All Indicators", isActive: false },
    // {
    //   key: 'totExpenditureByTotRevenue',
    //   label: "Total Expenditure to Total Revenue (%)",
    //   isActive: false
    // },
    // {
    //   key: 'totOwnRevenueByTotRevenue',
    //   label: "Own Source Revenue to Total Revenue (%)",
    //   isActive: false
    // },
    // {
    //   key: 'grantsByTotRevenue',
    //   label: "Grants to Total Revenue (%)",
    //   isActive: false
    // },
    // {
    //   key: 'totExpenditureByTotOwnRevenue',
    //   label: "Own Source Revenue to Total Expenditure (%)",
    //   isActive: false
    // },
    // {
    //   key: 'capitalExpenditureByTotExpenditure',
    //   label: "Capital Expenditure to Total Expenditure (%)",
    //   isActive: false
    // },
    // {
    //   key: 'operatingSurplus',
    //   label: "Operating Surplus (Cr)",
    //   isActive: false
    // },
    // {
    //   key: 'totRevenue',
    //   label: "Total Revenue (Cr)",
    //   isActive: false,
    //   children: [
    //     {
    //       key: 'totOwnRevenue',
    //       label: 'Own Source Revenue (Cr)',
    //       isActive: false,
    //     },
    //     {
    //       key: '120',
    //       label: 'Assigned Revenue (Cr)',
    //       isActive: false,
    //     },
    //     {
    //       key: '160',
    //       label: 'Revenue Grants (Cr)',
    //       isActive: false,
    //     },
    //     {
    //       key: '100',
    //       label: 'Others (Cr)',
    //       isActive: false,
    //     },
    //   ]
    // }
  ]); // Will be sent from parent/ api call
  yearsArr = signal<string[]>(['2020-21', '2021-22', '2022-23']); // Will be sent from parent/ api call
  slug!: string;
  indicators = signal<RadioOption[]>([]);
  consolidatedIndicators = signal<RadioOption[]>([]);
  selectedIndicator: FormControl = new FormControl('');
  years = signal<RadioOption[]>([]);

  isYearsActive = signal<boolean>(false);
  isIndicatorsActive = signal<boolean>(false);
  isBrowser: boolean = false;

  selectedCities = signal<IULB[]>([]);

  chartConfig = signal<ChartConfig>({
    chartId: '',
    chartType: 'barChart',
    datasets: []
  });
  headers = signal<any[]>([]);
  displayedColumns: string[] = [];
  dataSource = signal<any[]>([]);
  res = {}
  cityHeaders: string[] = []; //, 'emptyCol','city-name','city-name1']; // will be dynamic based on selected cities.
  selectedYears: any = signal<string[]>([]);
  selectedRowIndices: any;
  excelData: any;
  isExporting = false;
  // {
  //   headers: [
  //     { key: 'indicator', label: 'Indicator' },
  //     { key: "5e4a75dc47cb2749e5a56be0_2020_21", label: '2020-21' },
  //     { key: "5e4a75dc47cb2749e5a56be0_2021_22", label: '2021-22' },
  //     { key: "5e4a75dc47cb2749e5a56be0_2022_23", label: '2022-23' },
  //     { key: "5eb5844f76a3b61f40ba0697_2020_21", label: '2020-21' },
  //     { key: "5eb5844f76a3b61f40ba0697_2021_22", label: '2021-22' },
  //     { key: "5eb5844f76a3b61f40ba0697_2022_23", label: '2022-23' },
  //     { key: "5f5610b3aab0f778b2d2cac0_2020_21", label: '2020-21' },
  //     { key: "5f5610b3aab0f778b2d2cac0_2021_22", label: '2021-22' },
  //     { key: "5f5610b3aab0f778b2d2cac0_2022_23", label: '2022-23' },
  //   ],
  //   data: [
  //     {
  //       indicator: "Capital Expenditure to Total Expenditure (%)",
  //       "5e4a75dc47cb2749e5a56be0_2020_21": 2000,
  //       "5e4a75dc47cb2749e5a56be0_2021_22": 1000,
  //       "5e4a75dc47cb2749e5a56be0_2022_23": "800",
  //       "5eb5844f76a3b61f40ba0697_2020_21": "1510",
  //       "5eb5844f76a3b61f40ba0697_2021_22": "1050",
  //       "5eb5844f76a3b61f40ba0697_2022_23": "570",
  //       "5f5610b3aab0f778b2d2cac0_2020_21": "200",
  //       "5f5610b3aab0f778b2d2cac0_2021_22": "100",
  //       "5f5610b3aab0f778b2d2cac0_2022_23": "400",
  //     },
  //     {
  //       indicator: "Own Source Revenue (Cr)",
  //       "5e4a75dc47cb2749e5a56be0_2020_21": "2000",
  //       "5e4a75dc47cb2749e5a56be0_2021_22": "1000",
  //       "5e4a75dc47cb2749e5a56be0_2022_23": "800",
  //       "5eb5844f76a3b61f40ba0697_2020_21": "1510",
  //       "5eb5844f76a3b61f40ba0697_2021_22": "1050",
  //       "5eb5844f76a3b61f40ba0697_2022_23": "570",
  //       "5f5610b3aab0f778b2d2cac0_2020_21": "200",
  //       "5f5610b3aab0f778b2d2cac0_2021_22": "100",
  //       "5f5610b3aab0f778b2d2cac0_2022_23": "400",
  //     },
  //     {
  //       indicator: "Assigned Revenue (Cr)",
  //       "5e4a75dc47cb2749e5a56be0_2020_21": "800",
  //       "5e4a75dc47cb2749e5a56be0_2021_22": "780",
  //       "5e4a75dc47cb2749e5a56be0_2022_23": "660",
  //       "5eb5844f76a3b61f40ba0697_2020_21": "550",
  //       "5eb5844f76a3b61f40ba0697_2021_22": "470",
  //       "5eb5844f76a3b61f40ba0697_2022_23": "590",
  //       "5f5610b3aab0f778b2d2cac0_2020_21": "400",
  //       "5f5610b3aab0f778b2d2cac0_2021_22": "480",
  //       "5f5610b3aab0f778b2d2cac0_2022_23": "800",
  //     },
  //     {
  //       indicator: "Revenue Grants (Cr)",
  //       "5e4a75dc47cb2749e5a56be0_2020_21": "920",
  //       "5e4a75dc47cb2749e5a56be0_2021_22": "810",
  //       "5e4a75dc47cb2749e5a56be0_2022_23": "780",
  //       "5eb5844f76a3b61f40ba0697_2020_21": "298",
  //       "5eb5844f76a3b61f40ba0697_2021_22": "100",
  //       "5eb5844f76a3b61f40ba0697_2022_23": "200",
  //       "5f5610b3aab0f778b2d2cac0_2020_21": "920",
  //       "5f5610b3aab0f778b2d2cac0_2021_22": "100",
  //       "5f5610b3aab0f778b2d2cac0_2022_23": "200",
  //     },
  //     {
  //       indicator: "Others (Cr)",
  //       "5e4a75dc47cb2749e5a56be0_2020_21": "800",
  //       "5e4a75dc47cb2749e5a56be0_2021_22": "100",
  //       "5e4a75dc47cb2749e5a56be0_2022_23": "10",
  //       "5eb5844f76a3b61f40ba0697_2020_21": "400",
  //       "5eb5844f76a3b61f40ba0697_2021_22": "100",
  //       "5eb5844f76a3b61f40ba0697_2022_23": "70",
  //       "5f5610b3aab0f778b2d2cac0_2020_21": "264",
  //       "5f5610b3aab0f778b2d2cac0_2021_22": "300",
  //       "5f5610b3aab0f778b2d2cac0_2022_23": "220",
  //     },
  //   ]
  // }


  constructor(
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private globalLoaderService: GlobalLoaderService,
    private dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }


  ngOnInit() {
    if (isPlatformServer(this.platformId)) return;
    this.isBrowser = isPlatformBrowser(this.platformId);

    const destroyRef = this.destroyRef ?? inject(DestroyRef); // ensure injected at class field ideally

    // 1) streams
    const slug$ = this.route.parent!.paramMap.pipe(
      map(pm => pm.get('slug') ?? ''),
      distinctUntilChanged()
    );

    const qp$ = this.route.queryParamMap.pipe(
      map(pm => {
        // ✅ Use the SAME names you write into the URL
        const cities = pm.getAll('cities');      // ULB IDs (or slugs if you switch API)
        const years = pm.getAll('years');       // ['2020-21','2021-22',...]
        const indicator = pm.get('indicator') ?? '';
        return { cities, years, indicator };
      }),
      // de-dup identical query states
      distinctUntilChanged((a, b) =>
        a.indicator === b.indicator &&
        a.cities.join('|') === b.cities.join('|') &&
        a.years.join('|') === b.years.join('|')
      )
    );

    // 2) combine slug + query params
    combineLatest([slug$, qp$]).pipe(
      takeUntilDestroyed(destroyRef),

      // default cities to slug if missing
      map(([slug, qp]) => ({
        slug,
        cities: qp.cities.length ? qp.cities : [slug],
        years: qp.years,
        indicator: qp.indicator
      })),

      // 3) fetch ULBs (no forkJoin)
      switchMap(({ slug, cities, years, indicator }) =>
        from(cities).pipe(
          mergeMap(key =>
            // If your URL uses **IDs**, keep ById; if it uses slugs, call BySlug.
            this.dashboardService.getUlbDetailsById(key).pipe(
              map(r => r?.ulb ?? r?.ulbDetails?.[0] ?? null),
              catchError(() => of(null))
            )
          ),
          toArray(),
          map(ulbs => ({
            slug,
            ulbs: (ulbs.filter(Boolean) as IULB[]),
            years,
            indicator
          }))
        )
      )

    ).subscribe(({ ulbs, years, indicator }) => {
      // 4) hydrate UI state BEFORE load

      // cities
      this.selectedCities.set(ulbs);

      // years: set isActive for exactly those present in URL
      const allYearOptions: RadioOption[] = this.yearsArr().map(label => ({
        key: String(label).replace(/-/g, '_'),
        label: String(label),
        isActive: false
      }));
      const selected = new Set<string>(years.map(String));
      const hydratedYears: RadioOption[] = allYearOptions.map(o => ({
        ...o,
        isActive: selected.has(o.label) // or selected.has(o.key)
      }));
      this.years.set(hydratedYears);

      // indicator: activate the one matching URL
      const updatedIndicators = this.indicators().map(i => ({
        ...i,
        isActive: i.key === indicator
      }));
      this.indicators.set(updatedIndicators);

      const consolidated = this.getIndicators(updatedIndicators.filter(i => i.isActive));
      this.consolidatedIndicators.set(consolidated);
      this.selectedIndicator.setValue(consolidated[0]?.key ?? indicator ?? '');

      // headers dependent on cities:
      this.cityHeaders = ['emptyCol', ...this.selectedCities().map(c => c.name)];

      // 5) build payload your API expects & load ONCE
      const yearsArr = this.years().filter(y => y.isActive);          // RadioOption[]
      const activeIndicators = updatedIndicators.filter(i => i.isActive);

      // microtask avoids NG0100 on first render
      queueMicrotask(() => this.loadData(yearsArr, ulbs, activeIndicators));
    });

    // 6) other page setup (make them reactive-safe)
    this.setYearsArr();
    this.setIndicatorsArr();

    // valueChanges should also auto-unsubscribe
    this.selectedIndicator!.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => this.createChartData());
  }

  // Based on yearsArr: string[] create years: RadioOption[] which has isActive etc..
  private setYearsArr() {
    const years = this.yearsArr().map((item: string) => {
      return { key: item.replace('-', '_'), label: item, isActive: false }
    });
    this.years.set(years)
  }
  activeYearCount(): any {
    return this.years().filter(y => y.isActive).length;
  }
  // Set indicators array.
  private setIndicatorsArr() {
    this.dashboardService.getIndicatorsListCompareBy().subscribe({
      next: (res: any) => {
        this.indicators.set(res.data);
      }
    });
    // const indicators = [...this.indicatorsArr()];
    // this.indicators.set(indicators);
  }

  // Remove city from searched cities list.
  removeCity(city: IULB) {
    this.selectedCities.update(cities => cities.filter(c => c._id !== city._id));
  }

  /**
   * @param index 
   *    - Index of the years to toggle.
   *    - If index === -1, the `isActive` status for all years will be set to the provided 
   * @param activeStatus 
   *    - Boolean flag to set all years' active state. 
   *    - Defaults to the inverse of `this.isYearsActive()` if not provided.
   */
  modifyYears(index: number, activeStatus: boolean = !this.isYearsActive()) {

    console.log("called", index, activeStatus);
    if (index === -1) {
      this.years().forEach(item => item.isActive = activeStatus);
    } else {
      this.years()[index].isActive = !this.years()[index].isActive;
    }
    this.selectedYears.set(this.years().filter(item => item.isActive).map(i => i.label));
    this.isYearsActiveFn();
    // console.log("modify year: ", index, this.years());
  }
  private lastNYearsLabels(n: number): string[] {
    const all = this.yearsArr();         // e.g. ['2020-21','2021-22','2022-23']
    return all.slice(-n);
  }

  async onComparisonClick(slugs: string[], index: number): Promise<void> {
    const preset = this.sampleComparisons[index];
    if (!preset) return;

    const slugInPath = this.route.snapshot.paramMap.get('slug')!;  // current page's city slug
    const years = this.lastNYearsLabels(preset.yearsCount ?? 3);

    await this.router.navigate(
      ['/municipal-data', 'city', slugInPath, 'compareby'],
      {
        queryParams: {
          cities: slugs,            // -> ?cities=mumbai&cities=bengaluru&cities=pune
          years,                    // -> ?years=2020-21&years=2021-22&years=2022-23
          indicator: preset.indicatorKey
        },
        replaceUrl: true
      }
    );

    this.scrollToTop?.();
  }

  // async onComparisonClick(ids: string[], index: number): Promise<void> {
  //   this.selectedCities.set([]); // reset
  //   this.years().forEach(item => item.isActive = false); // reset
  //   this.indicators().forEach(item => item.isActive = false); // reset
  //   // console.log('onComparisonClick ids:', ids, index);
  //   const promises = ids.map(id =>
  //     firstValueFrom(
  //       this.dashboardService.getUlbDetailsById(id).pipe(
  //         map(res => res?.ulb ?? res?.ulbDetails ?? null)
  //       )
  //     )
  //   );

  //   const results = await Promise.allSettled(promises);
  //   const ulbs = results
  //     .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && !!r.value)
  //     .map(r => r.value);

  //   this.selectedCities.set(ulbs); // update once with all results
  //   this.cityHeaders = ['emptyCol', ...this.selectedCities().map(c => c.name)];
  //   // this.cityHeaders = ['emptyCol', 'emptyCol', ...this.selectedCities().map(c => c.name)];

  //   this.modifyYears(-1, true);
  //   if (index === 0) this.modifyIndicators(1, true);
  //   else if (index === 1) this.modifyIndicators(2, true);
  //   else if (index === 2) this.modifyIndicators(6, true);
  //   this.applyFilter();
  //   this.scrollToTop();
  // }
  private scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 800]);
  }
  // Update isYearsActive variable if all years are active.
  private isYearsActiveFn() {
    const isActive = this.years().every(item => item.isActive);
    this.isYearsActive.set(isActive);
  }

  /**
   * @param index 
   *    - Index of the indicator to toggle.
   *    - If index === -1, the `isActive` status for all indicators will be set to the provided 
   * @param activeStatus 
   *    - Boolean flag to set all indicators' active state. 
   *    - Defaults to the inverse of `this.isIndicatorsActive()` if not provided.
   */
  modifyIndicators(index: number, activeStatus: boolean = !this.isIndicatorsActive()) {
    // console.log(index, activeStatus);
    if (index === -1) {
      this.indicators().forEach(item => item.isActive = activeStatus);
    } else {
      this.indicators()[index].isActive = !this.indicators()[index].isActive;
    }
    this.isIndicatorsActiveFn();
    // console.log("addIndicator: ", index, this.indicators())
  }

  // Update isIndicatorssActive variable if all years are active.
  private isIndicatorsActiveFn() {
    const isActive = this.indicators().every(item => item.isActive);
    this.isIndicatorsActive.set(isActive);
  }

  // When ULB is selected from drop down - update selectedCities()
  onUlbSelected = (city: IULB) => {
    if (this.selectedCities().length >= 3) {
      this.utilityService.triggerSnackbar('Maximum 3 cities can be selected.', 'snackbar-danger');
    } else if (this.selectedCities().find(c => c._id === city._id)) {
      this.utilityService.triggerSnackbar(`${city.name} is already selected.`, 'snackbar-danger');
    } else {
      console.log('Selected city:', city);
      this.selectedCities.update(cities => [...cities, city]);
      this.cityHeaders = ['emptyCol', ...this.selectedCities().map(c => c.name)];
      // this.cityHeaders = ['emptyCol', 'emptyCol', ...this.selectedCities().map(c => c.name)];
      // console.log('this.cityHeaders,', this.cityHeaders);
    }
  };

  isNumber(value: number | string) {
    return !isNaN(+value);
  }

  // Check if all filter options are selected to apply filter.
  isInvalidSelection() {
    return this.years().some(item => item.isActive) &&
      this.indicators().some(item => item.isActive) &&
      this.selectedCities().length > 0;
  }

  applyFilter() {
    // console.log("apply filter called");
    if (!this.isInvalidSelection()) {
      this.utilityService.triggerSnackbar('Kindly ensure all filter options are selected before applying the filter.', 'snackbar-danger');
      return;
    }
    const yearsArr = this.years().filter(item => item.isActive);
    const ulbs = this.selectedCities();
    const indicators = this.indicators().filter(item => item.isActive);
    // console.log(indicators, 'this is blah')


    if (ulbs.length < 2) {
      this.utilityService.triggerSnackbar('Kindly ensure atleast 2 ulbs/cities are selected before applying the filter.', 'snackbar-danger');
      return;
    }
    const consolidatedIndicators = this.getIndicators(indicators);
    // console.log("consolidatedIndicators: ", consolidatedIndicators);
    this.consolidatedIndicators.set(consolidatedIndicators);
    this.selectedIndicator.setValue(this.consolidatedIndicators()[0]?.key ?? '');
    this.globalLoaderService.showLoader();

    const slug = this.route.snapshot.paramMap.get('slug')!;
    const qp = {
      cities: ulbs.map(u => u.slug),       // or u.id if you prefer IDs
      years: yearsArr.map(y => y.label),  // 🔑 use value, not label
      indicator: indicators[0].key ?? '' // or make it an array if you support multi
    };
    console.log('navigating to compareby with', ulbs, yearsArr, indicators[0].key);
    this.router.navigate(
      ['/municipal-data', 'city', slug, 'compareby'],
      { queryParams: qp, replaceUrl: true }
    );
    // this.loadData(yearsArr, ulbs, indicators);
    this.globalLoaderService.hideLoader();
  }

  private loadData(yearsArr: any[], ulbs: IULB[], consolidatedIndicators: any[]) {
    // console.log('loadData called', yearsArr, ulbs, consolidatedIndicators);
    // TODO: change to string[] - based on api requirement.
    var years = yearsArr.map(item => item.label);
    var ulbIds = ulbs.map(item => item._id);
    var indicators = consolidatedIndicators.map(item => item.key);

    // console.log("filters = ", years, ulbIds, indicators);
    this.dashboardService.getCompareByIndicators(ulbIds, years, indicators).subscribe({
      next: (res: any) => {
        // console.log("compare by res: ", res[0]);
        this.res = res[0];
        this.excelData = res
        this.getTableData(this.res);
        this.createChartData(this.res);
      }
    });
    // setTimeout(() => {
    //   this.getTableData(this.res);
    //   // this.createChartData(this.res); // This is called from valueChanges.
    // }, 1000);
  }

  selection = new SelectionModel<any>(true, []);
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource().length;
    return numSelected === numRows;
  }
  onRowToggle(row: any, i: any, checked: boolean) {
    // i is the row’s index in the rendered table (after sort/filter)
    if (checked) this.selection.select(row);
    else this.selection.deselect(row);

    // track indices if you want
    this.selectedRowIndices ??= new Set<number>();
    checked ? this.selectedRowIndices.add(i) : this.selectedRowIndices.delete(i);

    // console.log('clicked row index:', i, row, checked);
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    console.log('toggle all rows');
    if (this.isAllSelected()) {
      console.log('clear all selection');
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource());
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }

    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  private getTableData(resData: any) {
    this.headers.set(resData.headers);
    this.displayedColumns = [...resData.headers.map((item: any) => item.key)];
    // this.displayedColumns = ['select', ...resData.headers.map((item: any) => item.key)];
    this.dataSource.set(resData.data);
  }

  private createChartData(resData: any = this.res) {
    // console.log('Create chart called');
    // Create chart labels.
    const labelsWithDup: string[] = resData.headers
      .filter((item: any) => item.key !== 'indicator')
      .map((item: any) => item.label);
    const labels = Array.from(new Set(labelsWithDup));

    // Create data set.
    const indicatorLabel = this.consolidatedIndicators()
      .find(({ key }) => key === this.selectedIndicator.value)
      ?.label;
    const indicatorsData = resData.data.find((item: any) => item.indicator === indicatorLabel);

    const datasets: ChartDataSet[] = [];
    this.selectedCities().forEach((city: IULB, idx: number) => {
      const cityId = city._id;
      const data: number[] = [];
      for (const year of this.years()) {
        const key = cityId + '_' + year.key;
        data.push(indicatorsData[key]);
      }
      const obj = {
        label: city.name,
        data,
        "backgroundColor": GRAPH_COLORS[idx],
        "borderRadius": 5,
        "barThickness": 50,
      };
      datasets.push(obj);
    })


    this.chartConfig.set({
      "chartId": "bar-0",
      "chartType": "barChart",
      labels,
      datasets,
      "options": baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in Cr')
    })
  }
  downloadImg() {
    // downloadImg(selectedIndicator: string = 'CityPageChart') {
    this.globalLoaderService.showLoader();
    setTimeout(() => {
      console.log('capture chart process started');
      const chartContainer = document.getElementById('chartContainer');
      if (!chartContainer) return;

      // Create the outer div
      const cfLogo = document.createElement('div');
      cfLogo.className = 'cfLogo text-end';

      // Inject the inner HTML
      cfLogo.innerHTML = `
      <span class="fw-bold custom-font-size-6 text-shadow-custom text-info">city</span><span class="fw-bold custom-font-size-6 text-shadow-custom text-cfSecondary">finance.in</span>
    `;

      // Append to chart container
      chartContainer.appendChild(cfLogo);

      const elementsToHide = chartContainer.querySelectorAll('.hide-while-download');
      elementsToHide.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

      // Wait briefly to render new DOM changes
      setTimeout(() => {
        html2canvas(chartContainer)
          .then(canvas => {
            // Remove logo divs
            chartContainer.querySelectorAll('.cfLogo').forEach(el => el.remove());
            elementsToHide.forEach(el => (el as HTMLElement).style.visibility = 'visible');
            // Download the image
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'abc.png';
            // link.download = `${selectedIndicator}.png`;
            link.click();
          })
          .catch(err => {
            chartContainer.querySelectorAll('.cfLogo').forEach(el => el.remove());
            elementsToHide.forEach(el => (el as HTMLElement).style.visibility = 'visible');
            console.error('Error capturing chart:', err);
          })
          .finally(() => {
            // console.log('capture chart process completed');
            this.globalLoaderService.hideLoader();
          });
      }, 100);
    }, 0);
  }
  selectedIndicatorKey = signal<string>('all');

  selectIndicator(key: string) {
    this.selectedIndicatorKey.set(key);

    // flip isActive so exactly one is true (or none when 'all')
    const next = this.indicators().map(i => ({
      ...i,
      isActive: key !== 'all' && i.key === key
    }));
    this.indicators.set(next);

    // keep your other state in sync
    const active = next.filter(i => i.isActive);
    const consolidated = this.getIndicators(active); // your existing helper
    this.consolidatedIndicators.set(consolidated);
    this.selectedIndicator.setValue(
      key === 'all' ? '' : (consolidated[0]?.key ?? key)
    );
  }
  private buildExcelFrom(block: ApiBlock): {
    columns: { header: string; key: string; width?: number; style?: any }[];
    yearHeaders: string[];        // e.g. ['Indicator','2020-21','2021-22',...]
    groups: CityGroup[];          // e.g. [{ name:'Bengaluru', startCol:2, endCol:4 }, ...]
    rows: (string | number)[][];  // array-of-arrays aligned to yearHeaders
  } {
    // 1) Columns meta (kept for widths/styles)
    const columns = block.headers.map(h => ({
      header: h.label,
      key: h.key,
      width: h.key === 'indicator' ? 42 : 16,
      style: DEFAULT_STYLES,
    }));

    // 2) Year header labels in order (first cell shows "Indicator")
    const yearHeaders = block.headers.map((h, i) => (i === 0 ? 'Indicator' : h.label));

    // 3) Compute city groups from header keys (skip the first 'indicator' col)
    //    Excel columns are 1-based; our first data column is at index 2.
    const cityNameById = new Map(this.selectedCities().map(c => [c._id, c.name]));
    const groups: CityGroup[] = [];

    let currentCityId: string | null = null;
    let currentStartCol = 0;

    block.headers.forEach((h, idx) => {
      if (idx === 0) return; // skip 'indicator'
      const [ulbId] = h.key.split('_'); // everything before first underscore
      const colIndex = 1 /* indicator */ + 1 /* first year col */ + (idx - 1);

      if (ulbId !== currentCityId) {
        // close previous group
        if (currentCityId) {
          groups.push({
            name: cityNameById.get(currentCityId) ?? currentCityId,
            startCol: currentStartCol,
            endCol: colIndex - 1,
          });
        }
        // start new group
        currentCityId = ulbId;
        currentStartCol = colIndex;
      }
    });

    // close last group, if any
    if (currentCityId) {
      // last column index is total headers count (indicator + all years)
      groups.push({
        name: cityNameById.get(currentCityId) ?? currentCityId,
        startCol: currentStartCol,
        endCol: block.headers.length, // because columns are 1-based
      });
    }

    // 4) Body rows as arrays (Indicator first, then values in the same header order)
    const rows: (string | number)[][] = block.data.map(item => {
      const row: (string | number)[] = [];

      // indicator column
      row.push(item['indicator'] ?? '');

      // all year columns in order
      for (let i = 1; i < block.headers.length; i++) {
        const key = block.headers[i].key;
        let v = item[key];

        if (v === 'N/A' || v === null || v === undefined) {
          row.push('N/A');
        } else if (typeof v === 'string') {
          // convert numeric strings (with or without commas) to numbers
          const n = Number(v.replace?.(/,/g, '') ?? v);
          row.push(Number.isFinite(n) ? n : v);
        } else {
          row.push(v);
        }
      }

      return row;
    });

    return { columns, yearHeaders, groups, rows };
  }
  async downloadExcel() {
    // 1) pick the API block you want to export
    const block = this.excelData?.[0];         // or find by keyType
    if (!block) return;

    // 2) build columns/year headers/city groups/rows for Excel
    const { columns, yearHeaders, groups, rows } = this.buildExcelFrom(block);

    // 3) call the shared utility with grouped headers
    await this.utilityService.createExcel({
      addLogo: true,
      addContactUsNote: true,
      fileName: `CityFinance_${block.keyType}`,
      sheetName: 'CityFinance',
      columns,              // widths/styles
      rows,                 // array-of-arrays aligned to yearHeaders
      yearHeaders,          // ['Indicator', '2020-21', ...]
      cityGroups: groups,   // [{ name:'Bengaluru', startCol:2, endCol:4 }, ...]
      header: { index: 3, fontSize: 12, fontFamily: 'Aptos' },
      logoUrl: 'assets/images/excel-cf-logo.png',
      contactText: 'For any queries: support@cityfinance.in',
    });
  }
  // Flattens a list of indicators by extracting child indicators if present.
  private getIndicators(indicators: RadioOption[]) {
    const consolidatedIndicators: RadioOption[] = [];
    // console.log("indicators: ", indicators);
    const _getIndicators = (indicator: RadioOption) => {
      if (indicator.children && indicator.children.length > 0) {
        consolidatedIndicators.push(...indicator.children);
      } else {
        consolidatedIndicators.push(indicator);
      }
      return;
    }

    for (const indicator of indicators) {
      _getIndicators(indicator);
    }
    return consolidatedIndicators;
  }

  onReset() {
    this.selectedCities.set([]);
    this.cityHeaders = [];
    this.modifyIndicators(-1, false);
    this.modifyYears(-1, false);
    this.consolidatedIndicators.set([]);
    this.chartConfig.set({
      chartId: '',
      chartType: 'barChart',
      datasets: []
    });
    this.dataSource.set([]);
    this.selectedIndicator.setValue('');
  }
}
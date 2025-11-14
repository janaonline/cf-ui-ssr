import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, DestroyRef, effect, EventEmitter, inject, Inject, Input, input, OnInit, Output, PLATFORM_ID, signal, TemplateRef, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, filter, firstValueFrom, from, map, mergeMap, of, Subject, switchMap, takeUntil, toArray } from 'rxjs';
import { ViewportScroller } from '@angular/common';
const GRAPH_COLORS = ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743", '#f43f5e', '#B388FF'];
import { SelectionModel } from '@angular/cdk/collections';
import html2canvas from 'html2canvas';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonService } from '../../../../../core/services/common.service';
const DEFAULT_STYLES = {
  alignment: { vertical: 'middle' },
  font: { name: 'Aptos', size: 10 },
}
type HeaderItem = { key: string; label: string };
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
    MatSelectModule,
    Charts,
    InrFormatPipe,
    MatButtonToggleModule,
    MatAutocompleteModule
  ],
  templateUrl: './compare.html',
  styleUrl: './compare.scss'
})
export class Compare implements OnInit {
  @ViewChild('helpDialog') helpDialogTemplate!: TemplateRef<any>;
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
  applybutton: boolean = false;
  readonly sampleComparisons = [
    {
      line1: '3Y Own Revenue Data',
      line2: 'for Mumbai–Bengaluru–Pune',
      cities: ['mumbai', 'bengaluru', 'pune'],
      indicatorKey: 'receipts',
      yearsCount: 3
    },
    {
      line1: '3Y Property Tax',
      line2: 'of Ahmedabad–Surat–Indore',
      cities: ['amdavad', 'surat', 'indore'],
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
  popularCities = signal<any[]>([
    { _id: 'bengaluru', name: 'Bengaluru' },
    { _id: 'mumbai', name: 'Mumbai' },
    { _id: 'pune', name: 'Pune' },
    { _id: 'hyderabad', name: 'Hyderabad' },
    { _id: 'chennai', name: 'Chennai' },
    { _id: 'kolkata', name: 'Kolkata' },
    { _id: 'ahmedabad', name: 'Ahmedabad' },
    { _id: 'indore', name: 'Indore' }
  ]);
  comparisonMode: string = 'compareWith';
  readonly indicatorsArr = signal<RadioOption[]>([]);
  yearsArr = signal<string[]>(['2020-21', '2021-22', '2022-23']);
  slug!: string;
  indicators = signal<RadioOption[]>([]);
  consolidatedIndicators = signal<RadioOption[]>([]);
  selectedIndicator: FormControl = new FormControl('');
  years = signal<RadioOption[]>([]);
  conditionCheckFilterName: any;
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
  cityHeaders: string[] = [];
  selectedYears: any = signal<string[]>([]);
  selectedRowIndices: any;
  excelData: any;
  isExporting = false;
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();
  readonly myForm: FormGroup = this.fb.group({ ulbName: [''], year: [''], compareBy: [''], indicator: [''] });
  readonly noDataFound = signal<boolean>(false);
  readonly selectCity = input<(city: IULB) => void>();
  readonly stateId = input<string>('');
  readonly cityName = input<string>('');

  @Input() resetOnChange: boolean = false;

  @Output() onUlbSelect = new EventEmitter<IULB>();

  get ulbNameControl(): FormControl {
    return this.myForm.get('ulbName') as FormControl;
  }
  readonly filteredUlbs = signal<IULB[]>([]);

  constructor(
    private ngZone: NgZone,
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private globalLoaderService: GlobalLoaderService,
    private dashboardService: DashboardService,
    private CommonService: CommonService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  ngOnInit() {
    if (isPlatformServer(this.platformId)) return;
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.setupSearchEffect();
    const destroyRef = this.destroyRef ?? inject(DestroyRef);
    const slug$ = this.route.parent!.paramMap.pipe(
      map(pm => pm.get('slug') ?? ''),
      distinctUntilChanged()
    );

    const qp$ = this.route.queryParamMap.pipe(
      map(pm => {
        const cities = pm.getAll('cities');      // ULB IDs (or slugs if you switch API)
        const years = pm.getAll('years');       // ['2020-21','2021-22',...]
        const indicator = pm.get('indicator') ?? '';
        console.log(cities, years, indicator, 'query param map');
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
      console.log('activeIndicators', activeIndicators, 'yearsArr', yearsArr);
      if (yearsArr.length === 3) {
        this.modifyYears(-1, true);
      }
      if (yearsArr && activeIndicators.length > 0 && ulbs.length > 0) {
        this.applybutton = true;
      } else {
        this.applybutton = false;
      }
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
  private setupSearchEffect(): void {
    this.ulbNameControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        distinctUntilChanged(),
        filter((value) => value?.length > 1),
        switchMap((value) => {
          if (!value?.trim()) {
            return of({ data: [] });
          }
          return this.CommonService.postGlobalSearchDataMarketDashboard(
            value.trim(),
            'ulb',
            this.stateId()
          );
        })
      )
      .subscribe({
        next: (res: any) => {
          const ulbs = res?.['data'] ?? [];

          // Fix ExpressionChangedAfterItHasBeenCheckedError
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              this.filteredUlbs.set(ulbs);
              this.noDataFound.set(ulbs.length === 0);
            });
          });
        },
        error: (err) => {
          console.error('Error fetching ULBs:', err);

          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              this.filteredUlbs.set([]);
              this.noDataFound.set(true);
            });
          });
        },
      });
  }
  applyFilter1() {
    this.globalLoaderService.showLoader();
    const { ulbName, year, indicator, compareBy } = this.myForm.value;

    if (!ulbName || !year || !indicator || !compareBy) {
      this.utilityService.triggerSnackbar('Please select all filters', 'snackbar-danger');
      return;
    }
    const yearsArray = this.getLastThreeYears(year);

    this.CommonService.postAverageCompareByIndicators(yearsArray, compareBy, ulbName._id, indicator)
      .subscribe((res: any) => {
        if (res && res.success) {
          this.createCompareByChart(res.data);
          this.globalLoaderService.hideLoader();
        }
      });
  }
  private getLastThreeYears(selectedYear: string): string[] {
    // expected format: "2021-22"
    const [startStr, endStr] = selectedYear.split('-');
    let startYear = parseInt(startStr);

    const years: string[] = [];
    for (let i = 2; i >= 0; i--) {
      const from = startYear - i;
      const to = (from + 1).toString().slice(-2); // keep last 2 digits for next year
      years.push(`${from}-${to}`);
    }
    return years;
  }

  private createCompareByChart(resData: any) {
    if (!resData) return;

    const labels = resData.labels;
    const datasets = resData.data.map((d: any) => ({
      type: d.type,
      label: d.label,
      data: d.data,
      backgroundColor: d.backgroundColor,
      borderColor: d.borderColor,
      fill: d.fill || false,
      borderWidth: 2,
      borderRadius: 6,
      barThickness: 50
    }));

    this.chartConfig.set({
      chartId: 'bar-compare-1',
      chartType: 'barChart',
      labels,
      datasets,
      options: baseChartOptions('DEFAULT_FONT_FAMILY', true, 'Years', resData.axes.y)
    });
  }

  // private baseChartOptions(font: string, responsive: boolean, xLabel: string, yLabel: string) {
  //   return {
  //     responsive,
  //     plugins: {
  //       legend: { position: 'bottom' },
  //       tooltip: {
  //         callbacks: {
  //           label: (context: any) => {
  //             return `${context.dataset.label}: ${context.parsed.y} Cr`;
  //           }
  //         }
  //       }
  //     },
  //     scales: {
  //       x: { title: { display: true, text: xLabel, font: { family: font } } },
  //       y: { title: { display: true, text: yLabel, font: { family: font } } }
  //     }
  //   };
  // }


  onReset1() {
    this.myForm.reset();
    this.chartConfig.set({
      chartId: '',
      chartType: 'barChart',
      datasets: []
    });
  }

  onCitySelection(city: IULB): void {
    this.onUlbSelect.emit(city);
    const callback = this.selectCity();
    if (callback) callback(city);
    // console.log('this.myForm.value---', this.myForm.value);
    if (this.resetOnChange) {
      this.myForm.patchValue({ ulbName: '' }, { emitEvent: false });
      this.filteredUlbs.set([]);
      // console.log('after', this.myForm.value);
    }
    // console.log('ULB obj is sent from child to parent: ', city);
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
      ['/municipal-data', 'city', 'comparewith'],
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

  private scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 500]);
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
      const currIndicatorStatus = !this.indicators()[index].isActive;
      this.indicators().forEach(item => item.isActive = false);
      this.indicators()[index].isActive = currIndicatorStatus;
    }
    this.isIndicatorsActiveFn();
    // console.log("addIndicator: ", index, this.indicators())
  }

  // Update isIndicatorssActive variable if all years are active.
  private isIndicatorsActiveFn() {
    const isActive = this.indicators().every(item => item.isActive);
    this.isIndicatorsActive.set(isActive);
  }
  displayUlbName(ulb: any): string {
    return ulb?.name || '';
  }
  onUlbSelected(city: IULB) {
    if (this.selectedCities().length >= 3) {
      this.utilityService.triggerSnackbar('Maximum 3 cities can be selected.', 'snackbar-danger');
      return;
    }

    if (this.selectedCities().find(c => c._id === city._id)) {
      this.utilityService.triggerSnackbar(`${city.name} is already selected.`, 'snackbar-danger');
      return;
    }

    this.selectedCities.update(cities => [...cities, city]);
    this.cityHeaders = ['emptyCol', ...this.selectedCities().map(c => c.name)];

    // ✅ Reset input back to text state
    this.myForm.get('ulbName')?.setValue('');
  }



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
    this.applybutton = true;
    const yearsArr = this.years().filter(item => item.isActive);
    const ulbs = this.selectedCities();
    const indicators = this.indicators().filter(item => item.isActive);
    console.log(indicators, 'this is blah')


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
      ['/municipal-data', 'city', 'comparewith'],
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
    this.conditionCheckFilterName = indicators
    console.log("filters = ", years, ulbIds, indicators);
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
  private toCrOrSame<

    T extends string | number | bigint | null | undefined

  >(value: T, decimals = 2): number | T {

    if (typeof value === 'string' && value.trim().toUpperCase() === 'N/A') return value;



    const n = typeof value === 'bigint' ? Number(value) : Number(value);

    if (Number.isFinite(n)) {

      return Number((n / 1e7).toFixed(decimals)); // crores

    }

    return value; // preserves original (e.g., '', null, undefined, '—', etc.)

  }
  private createChartData(resData: any = this.res) {
    if (Object.keys(resData).length === 0) return;

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

    if (!indicatorsData) return;

    const datasets: ChartDataSet[] = [];
    this.selectedCities().forEach((city: IULB, idx: number) => {
      const cityId = city._id;
      const data: number[] = [];
      for (const year of this.years()) {
        const key = cityId + '_' + year.key;
        data.push(this.toCrOrSame(indicatorsData[key]));
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

  // Download chart as img.
  downloadImg(selectedIndicator: string = 'CityPageChart') {
    this.globalLoaderService.showLoader();

    setTimeout(() => {
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
            link.download = `${selectedIndicator}.png`;
            link.click();
          })
          .catch(err => {
            chartContainer.querySelectorAll('.cfLogo').forEach(el => el.remove());
            elementsToHide.forEach(el => (el as HTMLElement).style.visibility = 'visible');
            console.error('Error capturing chart:', err);
          })
          .finally(() => {
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
  onComparisonModeChange(event: any) {
    this.comparisonMode = event.value;
    console.log('Selected Mode:', this.comparisonMode);
    this.onReset();
    this.onReset1();
  }
  onReset() {
    this.applybutton = false;
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
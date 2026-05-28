import { Component, effect, input, OnDestroy, signal, AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList, Inject, PLATFORM_ID, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../shared/components/charts/constants'; import cloneDeep from 'lodash-es/cloneDeep';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { ICreditRatingData } from '../../../../core/models/creditRating/creditRatingResponse';
import {
  BorrowingsData,
  BorrowingsKeys,
} from '../../../../core/models/interfaces';
import { CommonService } from '../../../../core/services/common.service';
import { NoDataFound } from '../../../../shared/components/no-data-found/no-data-found';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { DashboardService } from '../../dashboard-service';
import { TABLE_STRUCTURE } from './constants';
import { PreLoader } from '../../../../shared/components/pre-loader/pre-loader';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { isPlatformBrowser } from '@angular/common';
const GRAPH_COLORS = ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743",]
import { NavigationEnd, Router } from '@angular/router';
import { MatTabGroup } from '@angular/material/tabs';
@Component({
  selector: 'app-borrowing-credit-rating',
  imports: [
    TabButtons,
    NoDataFound,
    MatTableModule,
    ReactiveFormsModule,
    PreLoader,
    MatFormFieldModule,
    MatSelectModule,
    Charts
  ],
  templateUrl: './borrowing-credit-rating.html',
  styleUrl: './borrowing-credit-rating.scss',
})

export class BorrowingCreditRating implements OnDestroy, AfterViewInit {

  doughnutValues = [33, 10, 12, 40, 50];



  myForm!: FormGroup;
  readonly buttons = [
    { key: 'borrowing', label: 'Borrowing' },
    { key: 'creditRating', label: 'Credit Rating' },
     { key: 'marketReadiness', label: 'Market Readiness' },
  ];

  indicatorTableData = signal<any[]>([]);
  doughnutCharts = signal<any[]>([]);
  readonly displayedColumnsStructure: string[] = ['header'];
  currentSelectedButtonKey = signal<string>('');
  readonly ulbIdSignal = input.required<string>();
  borrowingYears = signal<string[]>([]);
  private readonly COLS_PER_PAGE = 3;
  currentPage = 0;
  totalPages = 0;

  isPrevDisabled = true;
  isNextDisabled = true;

  isLoading = signal<boolean>(true);
  displayedColumns: string[] = [];

  dataSource!: BorrowingsData[];
  dataSource_0!: BorrowingsData[];
  dataSource_1!: BorrowingsData[];
  dataSource_2!: BorrowingsData[];
  dataSource_3!: BorrowingsData[];
  dataSource_4!: BorrowingsData[];
  dataSource_5!: BorrowingsData[];
  dataSource_6!: BorrowingsData[];

  bondsData!: BorrowingsKeys[];

  // Input signal to receive default button index.
  readonly buttonIdx = input(-1);
  outOfRange: any[] = []
  footNote: any
  private destroy$ = new Subject<void>();
  marketReadinessYears = [
    "2022-23",
    "2021-22",
  ];
  intro: string | null = null;
  dataThere: boolean = true;
  Datamessage: string = '';
  // chartRenderKey = signal(0);
  @Input() chartRenderKey!: number;
  constructor(
    private dashboardService: DashboardService,
    private _commonService: CommonService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) { }
  ngOnChanges() {
    this.rebuildCharts();
  }
  private rebuildCharts() {
    if (this.currentSelectedButtonKey() === 'marketReadiness') {
      this.loadMarketReadiness(this.yearForm.value.year);
    }
  }
  ngAfterViewInit() {

  }




  // ngOnInit() {
  // this.getBorrowingsData();
  // this.getCreditRatingsData();
  // this.getBorrowingsYears();
  // }





  ngOnInit(): void {
    this.yearForm = this.fb.group({
      year: ['2022-23'],
    });
    this.loadMarketReadiness(this.yearForm.value.year);
    this.yearForm.get('year')!
      .valueChanges
      .subscribe((year: string) => {
        if (year) {
          this.loadMarketReadiness(year);
        }
      });
  }
  getMarketReadinessIntro(
    cityName: string,
    marketReadinessBand: string | null | undefined
  ) {
    if (!marketReadinessBand) return null;

    const bandKey = marketReadinessBand.split(' ')[0]; // A1, A2, A3, B, C, D 
    const messages: Record<string, string> = {
      A1: 'falls in the highly prepared category and is ready for further assessments to access municipal borrowings.',
      A2: 'falls in the well-prepared category and is ready for further assessments to access municipal borrowings.',
      A3: 'falls in the moderately prepared category and is ready for further assessments to access municipal borrowings.',
      B: 'falls in the aspirational category and shows potential for commercial borrowings.',
      C: 'falls in the needs intervention category and requires revenue mobilisation efforts to improve self-reliance.',
      D: 'falls in the low category continued grant support is needed.'
    };
    const message = messages[bandKey];
    if (!message) return null;
    return `${cityName} ${message}`;
  }


  loadMarketReadiness(year: string) {
    const ulbId = this.ulbIdSignal();
    // this.isLoading.set(true);
    this.dashboardService.getMarketReadinessData(ulbId, year)
      .subscribe({
        next: (res) => {
          if (res.message === 'Data not found for the specified ULB and years') {

            this.dataThere = false
            this.isLoading.set(true);
            this.Datamessage = res.message
            this.isLoading.set(false);
          }
          // console.log('Market Readiness Data:', res);
          /* ---------- TABLE ---------- */
          else {
            this.isLoading.set(true);
            this.dataThere = true
            this.indicatorTableData.set(res.sections);

            /* ---------- DOUGHNUTS ---------- */
            this.doughnutCharts.set(
              this.buildDoughnutCharts(res.sectionScores, res.overallScore)
            );
            this.outOfRange = res.outOfRange ?? [];
            this.footNote = res.footNote ?? '';
            this.intro = this.getMarketReadinessIntro(res.ulbName, res.marketReadinessBand);
            this.isLoading.set(false);
          }

        },
        error: () => this.isLoading.set(false)
      });
  }

  private buildDoughnutCharts(
    sectionScores: any[],
    overallScore: number
  ) {
    // 1. Check if both Expenditure and Cash scores are 0
    const isExpZero = sectionScores.find(s => s.section.toUpperCase().includes('EXPENDITURE'))?.score === 0;
    const isCashZero = sectionScores.find(s => s.section.toUpperCase().includes('CASH'))?.score === 0;

    // The condition to trigger "Data Insufficient"
    const showInsufficient = isExpZero && isCashZero;

    const charts = sectionScores.map((sec) => {
      const secName = sec.section?.toUpperCase();
      const isDebt = secName.includes('DEBT');
      const isExpenditure = secName.includes('EXPENDITURE');
      const isCash = secName.includes('CASH');

      // 2. Determine if this specific donut should show the "Insufficient" label
      const isDataInsufficient = showInsufficient && (isDebt || isExpenditure || isCash);

      const isDisabled = (isDebt && sec.derived === true) || isDataInsufficient;

      const color = isDisabled
        ? '#CFCFCF' // grey
        : this.getScoreColor(sec.score, sec.maxScore);

      return {
        ...this.createDoughnut(
          sec.section,
          sec.score,
          sec.maxScore,
          color,
          isDisabled
        ),
        title: sec.section.split('(')[0].trim(),
        // 3. Add the subtitle property
        subtitle: isDataInsufficient ? 'Data Insufficient' : '',
        isDisabled
      };
    });

    const totalMax = sectionScores.reduce(
      (sum, s) => sum + s.maxScore,
      0
    );

    const isOverallDisabled = overallScore === 0;
    const overallColor = isOverallDisabled
      ? '#CFCFCF'
      : this.getScoreColor(overallScore, totalMax);

    charts.push({
      ...this.createDoughnut(
        'overall',
        overallScore,
        totalMax,
        overallColor,
        isOverallDisabled
      ),
      title: 'Overall Score',
      subtitle: isOverallDisabled ? 'Data Insufficient' : '',
      isDisabled: isOverallDisabled
    });

    return charts.sort((a, b) =>
      a.title === 'Overall Score' ? -1 : b.title === 'Overall Score' ? 1 : 0
    );
  }
  getScoreCategory(score: number | string) {
    if (score === 'N/A' || score == null || score === 0) return 'na';

    const numScore = Number(score);
    if (numScore >= 8 || numScore === 4) return 'highest';
    if (numScore >= 6 || numScore === 3) return 'high';
    if (numScore >= 4 || numScore === 2) return 'low';
    return 'lowest';
  }
  getZeroRow(score: number | string) {
    if (score === 0) return 0;
    return '';
  }
  // Helper to calculate rowspan for 'na' rows
  getZeroRowSpan(rows: any[], currentIndex: number): number {
    const currentCategory = this.getZeroRow(rows[currentIndex].score);

    // If it's not 'na', we don't need to span.
    if (currentCategory !== 0) return 1;

    // If the previous row was also 'na', this row is already covered by the previous rowspan.
    // Return 0 so we don't render a cell here.
    if (currentIndex > 0 && this.getZeroRow(rows[currentIndex - 1].score) === 0) {
      return 0;
    }

    // Calculate how many consecutive 'na' rows exist starting from here
    let count = 1;
    for (let i = currentIndex + 1; i < rows.length; i++) {
      if (this.getZeroRow(rows[i].score) === 0) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }
  private getScoreColor(score: number, maxScore: number): string {
    if (!maxScore || maxScore <= 0) {
      return '#E6E6E6'; // fallback
    }

    const percentage = (score / maxScore) * 100;

    if (percentage <= 25) return '#F9EA94';
    if (percentage <= 50) return '#CCDF92';
    if (percentage <= 75) return '#99CE85';
    return '#33C075'; // >75%
  }

  private createDoughnut(
    id: string,
    score: number,
    maxScore: number,
    color: string,
    disabled = false
  ): ChartConfig {
    return {
      chartId: `market-readiness-${id}`,
      chartType: 'pieChart',
      labels: ['Score', 'Remaining'],
      centerText: score,
      datasets: [
        {
          data: [
            score,
            Math.max(0, maxScore - score)
          ],
          backgroundColor: disabled
            ? ['#CFCFCF', '#EFEFEF']
            : [color, '#E6E6E6'],
          borderWidth: disabled ? 1 : 0,
          borderColor: disabled ? '#BDBDBD' : undefined,
          // borderDash: disabled ? [4, 4] : undefined, // 👈 dotted ring
          // backgroundColor: [color, '#E6E6E6'],
          // borderWidth: 0,
          label: ''
        }
      ],
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },

      }

    };
  }





  navigatePage() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.navigate(['/municipal-data/market-readiness']);

  }


  onSelectedButtonChange(key: string): void {

    this.currentSelectedButtonKey.set(key);
    // if (this.currentSelectedButtonKey() === this.buttons[1].key) this.getCreditRatingsData('onbuttonchange');
  }
  hasDerivedRows(section: any): boolean {
    return section.section.includes('DEBT MANAGEMENT') && section.rows?.some((r: any) => r.derived === true)
  }
  getZeroScoreRows(section: any) {
    return section.rows?.filter(
      (r: any) => r.score === 0 || r.score === '0'
    ) || [];
  }
  shouldHideRow(row: any): boolean {
    return false; // never hide normal rows
  }


  // Distinct bonds years.
  private getBorrowingsYears() {
    this.isLoading.set(true);
    this._commonService.borrowingYears(this.ulbIdSignal()).subscribe({
      next: (res) => {
        this.borrowingYears.set(res.borrowingYears);
        if (res.borrowingYears.length) this.getBorrowingsData();
        this.isLoading.set(false);
      },
      error: (error) => console.error('Failed to get borrowingYears: ', error),
    });
  }

  readonly ulbIdChangeEffect = effect(() => {
    const ulbId = this.ulbIdSignal();
    if (ulbId) this.getBorrowingsYears();
  });

  private getBorrowingsData(): void {
    // console.log('Get borrowings data called');
    if (
      !this.ulbIdSignal() &&
      this.currentSelectedButtonKey() === this.buttons[1].key
    )
      return;

    this.isLoading.set(true);
    this.dashboardService
      .getBorrowingsData(this.ulbIdSignal())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.bondsData = res.data;
          this.totalPages = Math.ceil(
            this.bondsData.length / this.COLS_PER_PAGE
          );
          this.createStructure();
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Failed to fetch borrowings data: ', error);
          this.isLoading.set(false);
        },
      });
  }

  private createStructure(): void {
    this.isLoading.set(true);
    const tableStructure = cloneDeep(TABLE_STRUCTURE);
    this.displayedColumns = [...this.displayedColumnsStructure];

    this.bondsData.forEach((bondObj, index) => {
      for (const row of tableStructure) {
        const key = row.key;
        row[index.toString()] = bondObj[key] ?? '';
      }
    });

    this.dataSource_0 = tableStructure.filter((e) => e.table === '0');
    this.dataSource_1 = tableStructure.filter((e) => e.table === '1');
    this.dataSource_2 = tableStructure.filter((e) => e.table === '2');
    this.dataSource_3 = tableStructure.filter((e) => e.table === '3');
    this.dataSource_4 = tableStructure.filter((e) => e.table === '4');
    this.dataSource_5 = tableStructure.filter((e) => e.table === '5');
    this.dataSource_6 = tableStructure.filter((e) => e.table === '6');

    this.currentPage = 0;
    this.updateDisplayedColumns();
    this.isLoading.set(false);
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = [...this.displayedColumnsStructure];

    const startIndex = this.currentPage * this.COLS_PER_PAGE;
    const endIndex = Math.min(
      startIndex + this.COLS_PER_PAGE,
      this.bondsData.length
    );

    for (let i = startIndex; i < endIndex; i++) {
      this.displayedColumns.push(i.toString());
    }

    this.isPrevDisabled = this.currentPage === 0;
    this.isNextDisabled = this.currentPage >= this.totalPages - 1;

    // console.log(`Page: ${this.currentPage + 1}/${this.totalPages}`);
    // console.log('Displayed Columns:', this.displayedColumns);
  }

  // ---- Pagination -----
  get paginationRange(): (number | '..')[] {
    const pages: (number | '..')[] = [];
    const maxButtons = 1;

    if (this.totalPages <= maxButtons) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const left = Math.max(this.currentPage - 1, 1);
      const right = Math.min(this.currentPage + 1, this.totalPages - 2);

      pages.push(0); // always show first

      if (left > 1) pages.push('..');

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }

      if (right < this.totalPages - 2) pages.push('..');

      pages.push(this.totalPages - 1);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;

    this.currentPage = page;
    this.updateDisplayedColumns();
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // ----- Credit ratings -----
  // readonly creditRatingYears = input.required<string[]>();
  // TODO: add year and ulb id in credit rating data.
  readonly ulbName = input.required<string>();

  creditRatingYears: string[] = [];
  filteredCreditRating: ICreditRatingData[] = [];
  creditRatingData: ICreditRatingData[] = [];

  private subscriptions: Subscription[] = [];
  yearForm!: FormGroup;

  // Watch ULB changes
  readonly ulbNameEffect = effect(() => {
    const ulbName = this.ulbName();

    if (!ulbName) return;
    if (this.currentSelectedButtonKey() === this.buttons[1].key) {
      // Reset state when ULB changes
      this.creditRatingYears = [];
      this.filteredCreditRating = [];

      if (this.creditRatingData.length) {
        this.processCreditRatingData();
      } else {
        this.getCreditRatingsData();
      }
    }
  });

  // Fetch credit rating data from service
  private getCreditRatingsData(): void {
    // console.log('Fetching credit rating data...', abc);
    this.isLoading.set(true);
    this.dashboardService.getCreditRatingsData().subscribe({
      next: (res) => {
        this.creditRatingData = res || [];
      },
      error: (err) => {
        console.error('Failed to fetch credit rating data', err);
        this.creditRatingData = [];
      },
      complete: () => {
        this.processCreditRatingData();
        this.isLoading.set(false);
      },
    });
  }

  // Handle post-fetch data processing
  private processCreditRatingData(): void {
    this.extractDistinctYears();
    if (this.creditRatingYears.length > 0) {
      this.initializeForm(this.creditRatingYears[0]);
    }
  }

  // Extract years for current ULB
  private extractDistinctYears(): void {
    this.isLoading.set(true);

    const ulbName = this.ulbName();
    const yearSet = new Set<string>();

    for (const item of this.creditRatingData) {
      if (item?.ulb === ulbName && item?.date?.includes('/')) {
        const year = this.extractYear(item.date);
        if (year) yearSet.add(year);
      }
    }

    this.creditRatingYears = Array.from(yearSet).sort((a, b) =>
      b.localeCompare(a)
    );

    this.isLoading.set(false);
  }

  // Build the form and set up listeners
  private initializeForm(defaultYear: string = ''): void {
    this.isLoading.set(true);

    if (!this.creditRatingYears.length) return;

    if (this.myForm) {
      this.subscriptions.forEach((s) => s.unsubscribe());
      this.subscriptions = [];
    }

    this.myForm = this.fb.group({
      year: [defaultYear],
    });

    this.filterCreditRatings();

    const sub = this.myForm.get('year')?.valueChanges.subscribe(() => {
      this.filterCreditRatings();
    });

    if (sub) this.subscriptions.push(sub);
    this.isLoading.set(false);
  }

  // Filter data by selected year and ULB
  private filterCreditRatings(): void {
    const selectedYear = this.selectedYear;
    const ulbName = this.ulbName();

    if (!selectedYear || !ulbName) {
      this.filteredCreditRating = [];
      return;
    }

    this.filteredCreditRating = this.creditRatingData.filter(
      (item) =>
        item.ulb === ulbName && this.extractYear(item.date) === selectedYear
      // (item) => this.extractYear(item.date) === selectedYear,
    );

    // console.log('Filtered data:', this.filteredCreditRating);
  }

  // Extract year from date string
  private extractYear(date: string): string | null {
    return date?.split('/')?.[2] ?? null;
  }

  get selectedYear(): string | null {
    return this.myForm?.get('year')?.value ?? null;
  }

  // Cleanup
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];

    this.ulbIdChangeEffect?.destroy();
    this.ulbNameEffect?.destroy();

    this.destroy$.next();
    this.destroy$.complete();
  }
}

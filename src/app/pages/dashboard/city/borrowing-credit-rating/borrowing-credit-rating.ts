import { Component, effect, input, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import cloneDeep from 'lodash-es/cloneDeep';
import { Subject, Subscription, takeUntil } from 'rxjs';
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

@Component({
  selector: 'app-borrowing-credit-rating',
  imports: [TabButtons, NoDataFound, MatTableModule, ReactiveFormsModule],
  templateUrl: './borrowing-credit-rating.html',
  styleUrl: './borrowing-credit-rating.scss',
})
export class BorrowingCreditRating implements OnDestroy {
  readonly buttons = [
    { key: 'borrowing', label: 'Borrowing' },
    { key: 'creditRating', label: 'Credit Rating' },
  ];
  readonly displayedColumnsStructure: string[] = ['header'];
  currentSelectedButtonKey = signal<string>('');
  readonly ulbIdSignal = input.required<string>();
  // readonly borrowingYears = input.required<string[]>();
  borrowingYears = signal<string[]>([]);
  isBorrowingDisabled: boolean = true;

  private readonly COLS_PER_PAGE = 3;
  currentPage = 0;
  totalPages = 0;

  isPrevDisabled = true;
  isNextDisabled = true;

  isLoading = true;
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

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private _commonService: CommonService,
    private fb: FormBuilder
  ) {}

  // ngOnInit() {
  // this.getBorrowingsData();
  // this.getCreditRatingsData();
  // this.getBorrowingsYears();
  // }

  onSelectedButtonChange(key: string): void {
    this.currentSelectedButtonKey.set(key);
    // if (this.currentSelectedButtonKey() === this.buttons[1].key) this.getCreditRatingsData('onbuttonchange');
  }

  // Distinct bonds years.
  private getBorrowingsYears() {
    this._commonService.borrowingYears(this.ulbIdSignal()).subscribe({
      next: (res) => {
        this.isBorrowingDisabled = false;
        if (res.borrowingYears.length === 0) this.isBorrowingDisabled = true;
        this.borrowingYears.set(res.borrowingYears);

        // console.log('bonds years: ', res.borrowingYears, this.isBorrowingDisabled);
      },
      error: (error) => console.error('Failed to get borrowingYears: ', error),
      complete: () => this.getBorrowingsData(),
    });
  }

  readonly ulbIdChangeEffect = effect(() => {
    const ulbId = this.ulbIdSignal();
    if (ulbId && this.currentSelectedButtonKey() === this.buttons[0].key) {
      this.getBorrowingsYears();
      // this.getBorrowingsData();
    }
  });

  private getBorrowingsData(): void {
    // console.log('Get borrowings data called');
    if (
      !this.ulbIdSignal() &&
      this.currentSelectedButtonKey() === this.buttons[1].key
    )
      return;

    this.isLoading = true;
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
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Failed to fetch borrowings data: ', error);
        },
      });
  }

  private createStructure(): void {
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
    this.isLoading = false;
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
  isCreditRatingDisabled = true;
  myForm!: FormGroup;

  // Watch ULB changes
  readonly ulbNameEffect = effect(() => {
    const ulbName = this.ulbName();

    if (!ulbName) return;
    if (this.currentSelectedButtonKey() === this.buttons[1].key) {
      // Reset state when ULB changes
      this.creditRatingYears = [];
      this.filteredCreditRating = [];
      this.isCreditRatingDisabled = true;

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
      },
    });
  }

  // Handle post-fetch data processing
  private processCreditRatingData(): void {
    this.extractDistinctYears();
    if (this.creditRatingYears.length > 0) {
      this.initializeForm(this.creditRatingYears[0]);
    } else {
      this.isCreditRatingDisabled = true;
    }
  }

  // Extract years for current ULB
  private extractDistinctYears(): void {
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
    this.isCreditRatingDisabled = this.creditRatingYears.length === 0;
  }

  // Build the form and set up listeners
  private initializeForm(defaultYear: string = ''): void {
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

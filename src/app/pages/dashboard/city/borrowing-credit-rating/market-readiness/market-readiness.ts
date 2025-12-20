
import {
  Component,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
  OnInit,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CitySearch } from "../../../../../shared/components/city-search/city-search";
import { IULB } from '../../../../../core/models/ulb';
import { state } from '@angular/animations';
import { DashboardService } from '../../../dashboard-service';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
interface CityScore {
  sno: number;
  city: string;
  populationCategory: string;
  state: string;
  bandPrevYear: string | null;
  bandCurrYear: string | null;
  score: number;
  delta: number;
}

@Component({
  selector: 'app-market-readiness',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CitySearch, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule, MatChipsModule, MatTableModule],
  templateUrl: './market-readiness.html',
  styleUrl: './market-readiness.scss'
})
export class MarketReadiness implements OnInit {
  @ViewChild('citySearch') citySearch!: CitySearch;
  @ViewChild('scrollIndicator') scrollIndicator!: ElementRef;
  filterForm!: FormGroup;
  dataSource: CityScore[] = [];
  isLoading = signal(false);
  showActiveFilters = false;

  filters = {
    city: '',
    state: '',
    population: '',
    band: ''
  };
  /** Pagination */
  currentPage = 1;
  pageSize = 5;
  totalRecords = 0;
  totalPages = 0;
  paginationWindow = 5; // how many page numbers to show
  /** Sorting */
  sortBy = 'marketReadinessScore.overallScore';
  sortOrder: 'asc' | 'desc' = 'desc';

  states: any[] = [];
  bands = ['A1 (Highly Prepared)', 'A2 (Well Prepared)', 'A3 (Moderately Prepared)', 'B (Aspirational)', 'C (Needs Intervention)'];
  populationBands = [
    { value: '4M+', label: ' > 4Million' },
    { value: '1M–4M', label: '1 – 4 Million' },
    { value: '500K–1M', label: '500K – 1 Million' },
    { value: '100K–500K', label: '100K – 500K' }
  ];

  displayedColumns = [
    'sno',
    'city',
    'populationCategory',
    'state',
    'band2022',
    'band2023',
    'score',
    'stauts'
  ];

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object

  ) {
    this.filterForm = this.fb.group({
      city: [''],
      state: [''],
      population: [''],
      band: [''],
    });

  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      city: [''],
      state: [''],
      population: [''],
      band: ['']
    });

    this.filterForm.valueChanges
      .pipe(debounceTime(400))
      .subscribe(values => {
        this.applyFilters(values);
      });

    this.dashboardService.getAllStates().subscribe({
      next: res => this.states = res.states,
      error: err => console.error(err)
    });

    this.fetchTableData();
  }
  get visiblePages(): number[] {
    if (!this.totalPages) return [];

    const half = Math.floor(this.paginationWindow / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = start + this.paginationWindow - 1;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - this.paginationWindow + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  getStatus(delta: number): 'IMPROVED' | 'SAME' | 'DECLINED' {
    if (delta > 0) return 'IMPROVED';
    if (delta < 0) return 'DECLINED';
    return 'SAME';
  }
  goToRoute(row: any): void {
    const city = row.city;
    // console.log('Navigating to city:', city);
    if (!city) return;
    this.dashboardService.getUlbSlugByName(city).subscribe({
      next: (res) => {
        this.router.navigate(['/municipal-data/city', res.slug], {
          queryParams: {
            tabIndex: 2, // 'borrowing',
            subTabIndex: 2, // 'marketReadiness'
          }
        });
      },
      error: () => {
        console.error('Failed to fetch ULB slug');
      }
    });
  }
  applyFilters(filters: any): void {
    this.currentPage = 1;
    this.showActiveFilters = this.hasAnyFilter(filters);
    this.fetchTableData();
  }
  private hasAnyFilter(filters: any): boolean {
    return Object.values(filters).some(
      v => v !== null && v !== undefined && v !== ''
    );
  }
  onUlbSelected = (ulb: any) => {
    this.filterForm.patchValue(
      {
        city: ulb?.name || '',
        state: ulb?.state?.name || ''
      },
      { emitEvent: true } // 👈 important
    );
    // console.log('Selected ULB:', ulb);
  };

  /** Bootstrap sorting */
  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }

    this.currentPage = 1;
    this.fetchTableData();
  }


  /** API fetch */
  fetchTableData(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const filters = this.filterForm.value;

    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      year: '2022-23',

      sortBy: this.sortBy,
      sortOrder: this.sortOrder,

      city: filters.city || '',
      state: filters.state || '',
      band: filters.band || '',
      populationCategory: filters.population || ''
    };

    this.isLoading.set(true);

    this.dashboardService.getMarketReadinessTable(params).subscribe({
      next: res => {
        this.dataSource = res.data;
        this.totalRecords = res.totalRecords;
        this.totalPages = res.totalPages;
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /** Pagination */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchTableData();
  }

  changePageSize(size: number): void {
    this.pageSize = +size;
    this.currentPage = 1;
    this.fetchTableData();
  }

  clearFilters(): void {
    this.filterForm.reset({
      city: '',
      state: '',
      population: '',
      band: ''
    });

    this.citySearch?.clear();   // 👈 IMPORTANT
    this.showActiveFilters = false;
    this.currentPage = 1;

    this.fetchTableData();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}

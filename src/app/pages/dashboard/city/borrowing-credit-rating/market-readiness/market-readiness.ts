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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ChangeDetectorRef } from '@angular/core';
import { CitySearch } from "../../../../../shared/components/city-search/city-search";
import { IULB } from '../../../../../core/models/ulb';
import { state } from '@angular/animations';
import { DashboardService } from '../../../dashboard-service';
interface CityScore {
  sno: number;
  city: string;
  populationCategory: string;
  state: string;
  band2022: string;
  band2023: string;
  score: number;
  delta: number;
}
@Component({
  selector: 'app-market-readiness',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule, MatChipsModule, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule, CitySearch],
  templateUrl: './market-readiness.html',
  styleUrl: './market-readiness.scss'
})
export class MarketReadiness implements OnInit, AfterViewInit {
  @ViewChild('scrollIndicator') scrollIndicator!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  // @ViewChild('citySearch') citySearch!: any;
  @ViewChild('citySearch') citySearch!: CitySearch;

  filterForm!: FormGroup;
  tableData = [
    { indicator: 'Water Supply Coverage', maxScore: 25, score: 18 },
    { indicator: 'Sewerage Coverage', maxScore: 25, score: 20 },
    { indicator: 'Solid Waste Collection Efficiency', maxScore: 25, score: 22 },
    { indicator: 'Storm Water Drainage Coverage', maxScore: 25, score: 15 }
  ];
  filters = {
    city: '',
    state: '',
    population: '',
    band: ''
  };

  // states = [
  //   'Karnataka',
  //   'Maharashtra',
  //   'Tamil Nadu',
  //   'Kerala',
  //   'Telangana'
  // ];
  states: any[] = [];
  bands = ['A', 'B', 'C'];

  populationBands = [
    { value: 'lt1m', label: '< 1 Million' },
    { value: '1to5m', label: '1 – 5 Million' },
    { value: 'gt5m', label: '> 5 Million' }
  ];
  displayedColumns = [
    'sno',
    'city',
    'populationCategory',
    'state',
    'band2022',
    'band2023',
    'score'
  ];
  isLoading = signal(true)
  showActiveFilters = false;
  skeletonRows = Array.from({ length: 5 });
  DUMMY_CITY_DATA: CityScore[] = [
    {
      sno: 1,
      city: 'Surat Municipal Corporation',
      populationCategory: '4M+',
      state: 'Gujarat',
      band2022: 'B (Moderately Performing)',
      band2023: 'A (High Performer)',
      score: 70,
      delta: 10
    },
    {
      sno: 2,
      city: 'Kanpur Municipal Corporation',
      populationCategory: '1M–4M',
      state: 'Uttar Pradesh',
      band2022: 'A (High Performer)',
      band2023: 'A (High Performer)',
      score: 70,
      delta: 0
    },
    {
      sno: 3,
      city: 'Navi Mumbai Municipal Corporation',
      populationCategory: '1M–4M',
      state: 'Maharashtra',
      band2022: 'C (Needs Intervention)',
      band2023: 'B (Moderately Performing)',
      score: 60,
      delta: 12
    },
    {
      sno: 4,
      city: 'Warangal Municipal Corporation',
      populationCategory: '500K–1M',
      state: 'Telangana',
      band2022: 'B (Moderately Performing)',
      band2023: 'B (Moderately Performing)',
      score: 52,
      delta: 0
    },
    {
      sno: 5,
      city: 'Mangalore Corporation',
      populationCategory: '100K–500K',
      state: 'Karnataka',
      band2022: 'B (Moderately Performing)',
      band2023: 'C (Needs Intervention)',
      score: 40,
      delta: -5
    },
    {
      sno: 6,
      city: 'Bhubaneswar Municipal Corporation',
      populationCategory: '500K–1M',
      state: 'Odisha',
      band2022: 'B (Moderately Performing)',
      band2023: 'C (Needs Intervention)',
      score: 35,
      delta: -5
    }
  ];

  dataSource = new MatTableDataSource<CityScore>([]);


  constructor(private fb: FormBuilder, @Inject(PLATFORM_ID) private platformId: object, private cdr: ChangeDetectorRef, private dashboardService: DashboardService) {
    this.filterForm = this.fb.group({
      city: [''],
      state: [''],
      population: [''],
      band: [''],
    });
    this.filterForm.valueChanges.pipe(debounceTime(400)).subscribe(values => {
      this.applyFilters(values);
    });
  }
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.attachTableControls();
  }
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      city: [''],
      state: [''],
      population: [''],
      band: [''],
    });

    /**
     * IMPORTANT for SSR:
     * We update a boolean instead of using `filterForm.dirty` directly in template
    */
    this.filterForm.valueChanges.subscribe(() => {
      this.showActiveFilters = this.filterForm.dirty;
    });
    this.dashboardService.getAllStates().subscribe({
      next: (res) => {
        this.states = res.states;
      },
      error: (err) => {
        console.error('Failed to load states', err);
      }
    });
    this.fetchTableData();
  }
  applyFilters(filters: any) {
    // 🔌 API call will go here
    console.log('Applying filters:', filters);
  }
  onUlbSelected = (ulb: any) => {
    // console.log('Selected ULB:', ulb.state.name);
    this.filterForm.patchValue({
      city: ulb?.name || '',
      state: ulb?.state?.name || ''
    });
    this.showActiveFilters = true;
  };

  clearFilters(): void {
    this.filterForm.reset({
      city: '',
      state: '',
      population: '',
      band: '',
    });
    this.citySearch?.clear();
    this.showActiveFilters = false;
  }

  fetchTableData(): void {
    this.isLoading.set(true)

    setTimeout(() => {
      this.dataSource.data = this.DUMMY_CITY_DATA; // ✅ only update data
      this.isLoading.set(false)

      this.attachTableControls();
      this.cdr.detectChanges(); // ✅ fixes NG0100
    }, 1500);
  }

  /* ---------------- SAFE ATTACH ---------------- */
  attachTableControls(): void {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
}

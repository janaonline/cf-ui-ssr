import { Component, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TableColumns } from '../../../../core/models/interfaces';
import { MaterialModule } from "../../../../material.module";
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { CreditRating } from './credit-rating/credit-rating';
import { IBondsData } from './models/bondIssuerResponse';

@Component({
  selector: 'app-borrowing-credit-rating',
  imports: [FormsModule, TabButtons, CreditRating, MatSelectModule, MatProgressSpinnerModule, MatTableModule, MaterialModule],
  templateUrl: './borrowing-credit-rating.html',
  styleUrl: './borrowing-credit-rating.scss'
})
export class BorrowingCreditRating {

  readonly stateIdSignal = signal('');
  readonly stateDetails = input.required<any>();
  readonly dashboardTabData = input.required<any>();
  readonly tabName = input.required<any>();

  currentSelectedButtonKey = signal<string>('Borrowing');
  subButton = signal<string>('');
  currentSelectedButton: any = signal<any>({});

  filterForm!: FormGroup;

  ulbsList = signal<string[]>([]);

  filteredData = new MatTableDataSource<IBondsData>([]);
  dataSource!: IBondsData[];
  displayedColumns!: string[];
  headers!: TableColumns[];

  yearsList = signal<string[]>([]);

  isLoading = signal<boolean>(false);

  constructor(
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    console.log(this.dashboardTabData());
    this.initializeForm();
    this.loadData();
  }

  // Borrowing, Credit Rating
  onSelectedButtonChange(key: string): void {
    this.currentSelectedButtonKey.set(key);
  }

  private initializeForm() {
    this.filterForm = this._formBuilder.group({
      ulbs: [[]],
      years: [[]],
    });
  }

  loadData() {

    this.isLoading.set(true);
    const res: { headers: TableColumns[]; data: IBondsData[] } = {
      headers: [
        {
          "key": "municipality",
          "value": "Municipality ",
        },
        {
          "key": "ulbType",
          "value": "ULB Type",
        },
        {
          "key": "year",
          "value": "Year",
        },
        {
          "key": "rating",
          "value": "Rating",
        },
        {
          "key": "amount",
          "value": "Amount (in Cr.)",
        },
        {
          "key": "couponRate",
          "value": "Coupon Rate",
        }
      ],
      data: [
        {
          "year": '2010',
          "municipality": 'Karnataka Water and Sanitation Pooled Fund',
          "ulbType": "N/A",
          "rating": '12',
          "amount": '3435',
          "couponRate": '21%',
        },
        {
          "year": '2011',
          "municipality": 'Karnataka Water and Sanitation Pooled Fund',
          "ulbType": "N/A",
          "rating": '12',
          "amount": '3435',
          "couponRate": '21%',
        },
        {
          "year": '2011',
          "municipality": 'Bangalore Municipal Corporation',
          "ulbType": "N/A",
          "rating": '12',
          "amount": '32413',
          "couponRate": '11%',
        },
      ]
    }
    setTimeout(() => {
      const ulbList = res.data.map(e => e.municipality);
      const yearList = res.data.map(e => e.year);
      this.ulbsList.set(ulbList);
      this.yearsList.set(yearList);

      this.headers = res.headers;
      this.displayedColumns = this.headers.map(e => e.key);
      this.dataSource = res.data;
      this.searchFilter();
      this.isLoading.set(false);
    }, 500);
  }

  // Helper to return ulb values from form.
  ulbsCtrlValue() {
    return this.filterForm.get('ulbs')?.value;
  }

  // Helper to return year values from form.
  yearsCtrlValue() {
    return this.filterForm.get('years')?.value;
  }


  clearFilters() {
    this.filteredData.data = this.dataSource;
    this.filterForm.setValue({ ulbs: [], years: [] });
  }

  searchFilter() {
    const ulbs = this.ulbsCtrlValue() || [];
    const years = this.yearsCtrlValue() || [];

    const _filteredData = this.dataSource.filter(e => {
      const matchesUlb = ulbs.length === 0 || ulbs.includes(e.municipality);
      const matchesYear = years.length === 0 || years.includes(e.year);
      return matchesUlb && matchesYear;
    });

    this.filteredData.data = _filteredData;
  }

}

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
import { MunicipalBondsService } from './municipal-bonds.service';
import { NoDataFound } from "../../../../shared/components/no-data-found/no-data-found";

@Component({
  selector: 'app-borrowing-credit-rating',
  imports: [FormsModule, TabButtons, CreditRating, MatSelectModule, MatProgressSpinnerModule, MatTableModule, MaterialModule, NoDataFound],
  templateUrl: './borrowing-credit-rating.html',
  styleUrl: './borrowing-credit-rating.scss'
})
export class BorrowingCreditRating {

  readonly stateDetails = input.required<any>();
  readonly dashboardTabData = input.required<any>();
  readonly tabName = input.required<any>();

  currentSelectedButtonKey = signal<string>('Borrowing');
  subButton = signal<string>('');
  currentSelectedButton: any = signal<any>({});

  filterForm!: FormGroup;

  ulbsList = signal<string[]>([]);

  filteredData = new MatTableDataSource<IBondsData>([]);
  dataSource: IBondsData[] = [];
  displayedColumns: string[] = [];
  headers: TableColumns[] = [];

  yearsList = signal<string[]>([]);

  isLoading = signal<boolean>(false);

  constructor(
    private _formBuilder: FormBuilder,
    private municipalBondService: MunicipalBondsService,
  ) { }

  ngOnInit() {
    // console.log(this.dashboardTabData());
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

    const stateId = this.stateDetails().state._id;
    if (!stateId) return;
    this.municipalBondService.getBondsData(stateId).subscribe({
      next: (res: { headers: TableColumns[]; data: IBondsData[] }) => {
        const ulbList = [...new Set(res.data.map(e => e.ulb))];
        const yearList = [...new Set(res.data.map(e => e.yearOfBondIssued))];

        this.ulbsList.set(ulbList);
        this.yearsList.set(yearList);

        this.headers = res.headers;
        this.displayedColumns = this.headers.map(e => e.key);
        this.dataSource = res.data;

        this.searchFilter();
        this.isLoading.set(false);
      },
      error: () => console.error("Failed to fetch bonds data!"),
    })
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
      const matchesUlb = ulbs.length === 0 || ulbs.includes(e.ulb);
      const matchesYear = years.length === 0 || years.includes(e.yearOfBondIssued);
      return matchesUlb && matchesYear;
    });

    this.filteredData.data = _filteredData;
  }

}

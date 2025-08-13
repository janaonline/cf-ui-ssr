import { Component, effect, Inject, input, Input, PLATFORM_ID, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TabButtons } from "../../../../shared/components/tab-buttons/tab-buttons";
import { ButtonObj } from '../../../../core/models/interfaces';
import { StateSearch } from "../../../../shared/components/state-search/state-search";
import { IState } from '../../../../core/models/state/state';
import { NationalService } from '../national.service';
import { NationalChart } from "../national-chart/national-chart";
import { isPlatformBrowser } from '@angular/common';
import { PreLoader } from "../../../../shared/components/pre-loader/pre-loader";
import { NoDataFound } from "../../../../shared/components/no-data-found/no-data-found";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-national-table',
  imports: [FormsModule, MatTableModule, TabButtons, StateSearch, NationalChart, PreLoader, NoDataFound, MatButtonToggleModule],
  templateUrl: './national-table.html',
  styleUrl: './national-table.scss'
})
export class NationalTable {
  headers: any[] = [];
  tableData: any;
  responseData: any;
  dataSource: any[] = [];
  displayedColumns: any[] = [];
  viewType = signal<string>('table');
  hideViewType = false;

  isLoadingData = signal<boolean>(false);


  selectedStateName = signal<string>('');
  selectedStateCode = signal<string>('');
  selectedStateId = signal<string>('');
  selectedType = signal<string>('populationCategory');

  readonly ledgerYears = input.required<string[]>();
  readonly isFullWidth = input<boolean>(true);
  // ledgerYears = signal<string[]>(this.year.data);
  selectedLedgerYear = signal<string>('2021-22');

  // currentSelectedButton: any = signal<any>({});
  // currentSelectedButtonKey = signal<string>('');

  buttons = signal<ButtonObj[]>([
    { label: 'Population Category', key: 'populationCategory' },
    { label: 'ULB Type', key: 'ulbType' },
  ]);

  lastSubButtonValue: string | null = null;

  constructor(public nationalService: NationalService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    effect(() => {
      // if (!isPlatformBrowser(this.platformId)) return;

      if (this.nationalService.selectedButtonKey() && this.nationalService.selectedButtonKey() !== this.lastSubButtonValue) {
        this.lastSubButtonValue = this.nationalService.selectedButtonKey();
        // console.log('Signal changed to:', this.nationalService.selectedButtonKey());

        this.getNationalData();
      }
    });
  }

  // readonly stateIdChangeEffect = effect(() => {

  // })


  ngOnInit() {
  }

  getType() {
    const activeTab = this.nationalService.selectedButtonKey();
    let lineItem = '';
    if (activeTab == "Total Revenue") {
      lineItem = "totalRevenue";
    } else if (activeTab == "Revenue Mix ") {
      // this.RevenueMixInput.type = "revenueMix";
      lineItem = "revenueMix";
    } else if (activeTab == "Total Expenditure") {
      lineItem = "totalExpenditure";
    } else if (activeTab == "Expenditure Mix") {
      // this.RevenueMixInput.type = "expenditureMix";
      lineItem = "expenditureMix";
    } else if (activeTab == "Deficit or Surplus") {
      lineItem = "deficitOrSurplus";
    } else if (activeTab == "Total Own Revenue") {
      lineItem = "totalOwnRevenue";
    } else if (activeTab == "Own Revenue Mix ") {
      // this.RevenueMixInput.type = "OwnrevenueMix";
      lineItem = "OwnrevenueMix";
    } else if (activeTab == "Capital Expenditure") {
      lineItem = "totalCapexpense";
      // this.downloadInputEndPoint = "capital-expenditure";
    }
    return lineItem;
  }
  getNationalData() {
    this.isLoadingData.set(true);
    const params = {
      financialYear: this.selectedLedgerYear(),
      formType: this.selectedType(),
      type: this.getType(),
      stateId: this.selectedStateId(),
      // csv: false
    }
    // /dashboard/national/data-availability?financialYear=2021-22&stateId=&population=true&ulbType=
    let apiEndpoint = 'dashboard/national/data-availability'
    if (this.nationalService.selectedTabName() !== 'Data Availability') {
      const slug = this.nationalService.selectedTabName().toLowerCase().replace(/\s+/g, '-');
      apiEndpoint = `national-dashboard/${slug}`
    }
    this.nationalService.getNationalData(params, apiEndpoint)
      .subscribe(
        {
          next: (res: any) => {
            // console.log("res", res);
            if (this.nationalService.selectedButtonKey().includes('Mix')) {
              this.responseData = res.data;
              // this.setMixChart(res.data);
            } else {
              this.tableData = res.data;
              this.setTable();
            }
            this.isLoadingData.set(false);
          },
          error: () => {
            this.isLoadingData.set(false);
          }
        });
  }

  setTable() {
    this.dataSource = this.tableData.rows;
    this.headers = this.tableData.columns;
    this.displayedColumns = this.tableData.columns?.map((ele: any) => ele.key);
  }
  onSelectedType(key: string): void {
    this.selectedType.set(key);
    this.getNationalData();
  }

  // Year changed from Drop down.
  public onYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) {
      this.selectedLedgerYear.set(yearSelected);
    }
    // console.log("year changed", this.selectedLedgerYear())
    this.getNationalData();
  }

  onStateSelection = (stateObj: IState) => {
    console.log("state selection", stateObj)
    // this.setStateData(stateObj.code, stateObj._id, stateObj.name)
    this.selectedStateId.set(stateObj._id);
    this.getNationalData();
  }

  // Helper: Update signal values with latest state data.
  // private setStateData(code: string = '', _id: string = '', name: string = ''): void {
  //   this.selectedStateCode.set(code);
  //   this.selectedStateName.set(name);
  //   this.selectedStateId.set(_id);
  // }

  resetFilter() {
    console.log("resetFilter called")
    this.selectedLedgerYear.set(this.ledgerYears()[0]);
    this.selectedStateId.set('');
    this.getNationalData();
    // this.resetMap();
  }
}

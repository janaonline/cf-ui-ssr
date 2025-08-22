import { Component, effect, input, Output, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { ButtonObj } from '../../../../core/models/interfaces';
import { IState } from '../../../../core/models/state/state';
import { CommonService } from '../../../../core/services/common.service';
import { NoDataFound } from "../../../../shared/components/no-data-found/no-data-found";
import { PreLoader } from "../../../../shared/components/pre-loader/pre-loader";
import { StateSearch } from "../../../../shared/components/state-search/state-search";
import { TabButtons } from "../../../../shared/components/tab-buttons/tab-buttons";
import { NationalChart } from "../national-chart/national-chart";
import { NationalService } from '../national.service';
import { EventEmitter } from '@angular/core';
@Component({
  selector: 'app-national-table',
  imports: [FormsModule, MatTableModule, TabButtons, StateSearch, NationalChart, PreLoader, NoDataFound, MatButtonToggleModule],
  templateUrl: './national-table.html',
  styleUrl: './national-table.scss'
})
export class NationalTable {

  @Output() filterChange = new EventEmitter<{ reset: boolean, year: string; stateObj: IState; type: string, timestamp: number }>();

  headers: any[] = [];
  tableData: any;
  responseData: any;
  dataSource: any[] = [];
  displayedColumns: any[] = [];
  viewType = signal<string>('table');
  hideViewType = false;

  isLoadingData = signal<boolean>(false);

  selectedState = signal<IState>({ _id: '', name: '', code: '' });
  selectedStateName = signal<string>('');
  selectedStateCode = signal<string>('');
  selectedStateId = signal<string>('');
  selectedType = signal<string>('populationCategory');

  readonly ledgerYears = input.required<string[]>();
  readonly isFullWidth = input<boolean>(true);
  // readonly isResetFilter = input<boolean>(false);
  readonly selectedstateObj = input<IState>({ _id: '', name: '', code: '' });

  // ledgerYears = signal<string[]>(this.year.data);
  selectedLedgerYear = signal<string>('');

  // currentSelectedButton: any = signal<any>({});
  // currentSelectedButtonKey = signal<string>('');

  buttons = signal<ButtonObj[]>([
    { label: 'Population Category', key: 'populationCategory' },
    { label: 'ULB Type', key: 'ulbType' },
  ]);

  lastSubButtonValue: string | null = null;

  constructor(
    public commonService: CommonService,
    public nationalService: NationalService,
    // @Inject(PLATFORM_ID) private platformId: Object,
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

  ngOnInit() {
    this.selectedLedgerYear.set(this.ledgerYears()[1]);
  }


  readonly stateObjEffect = effect(() => {
    const stateObj = this.selectedstateObj();
    if (stateObj._id !== this.selectedState()._id && this.nationalService.selectedTabName() === 'Data Availability') {
      this.onStateSelection(stateObj);
    }
  })

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
  getNationalData(csv: boolean = false) {
    this.isLoadingData.set(true);
    let params: {
      financialYear: string;
      formType: string;
      type: string;
      stateId: string;
      csv?: boolean;
      ulbType?: any;
      population?: any;
    } = {
      financialYear: this.selectedLedgerYear(),
      formType: this.selectedType(),
      type: this.getType(),
      stateId: this.selectedStateId(),
      ulbType: this.selectedType() === 'ulbType' ? true : '',
      population: this.selectedType() === 'populationCategory' ? true : '',
    }

    if (csv) params['csv'] = true;
    else if ('csv' in params) delete params['csv'];

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
            if (csv) {
              this.commonService.downloadExcel(res);
              this.isLoadingData.set(false);
            } else {
              if (this.nationalService.selectedButtonKey().includes('Mix')) {
                this.responseData = res.data;
                // this.setMixChart(res.data);
              } else {
                this.tableData = res.data;
                this.setTable();
              }
              this.isLoadingData.set(false);
            }
          },
          error: (err: Error) => {
            console.error('API error:', err);
            this.isLoadingData.set(false);
          }
        });
  }

  setTable() {
    this.dataSource = this.tableData.rows.filter((row: any) => Object.keys(row).length > 0);
    this.headers = this.tableData.columns;
    this.displayedColumns = this.tableData.columns?.map((ele: any) => ele.key);
  }
  onSelectedType(key: string): void {
    // console.log(key)
    this.selectedType.set(key);
    this.emitFilterValue(false, key);
    this.getNationalData();
  }

  private emitFilterValue(reset: boolean, key = 'populationCategory') {
    // console.log("emite called from: ", abc);
    const payload = {
      year: this.selectedLedgerYear(),
      stateObj: this.selectedState(),
      type: key,
      reset,
      timestamp: Date.now()
    }
    this.filterChange.emit({ ...payload });
  }

  // Year changed from Drop down.
  public onYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) {
      this.selectedLedgerYear.set(yearSelected);
    }
    this.emitFilterValue(false);
    // console.log("year changed", this.selectedLedgerYear())
    this.getNationalData();
  }

  onStateSelection(stateObj: IState) {
    // console.log("state selection", stateObj)
    this.setStateData(stateObj.code, stateObj._id, stateObj.name)
    this.selectedState.set(stateObj);
    this.emitFilterValue(false);
    this.getNationalData();
  }

  // Helper: Update signal values with latest state data.
  private setStateData(code: string = '', _id: string = '', name: string = ''): void {
    this.selectedStateCode.set(code);
    this.selectedStateName.set(name);
    this.selectedStateId.set(_id);
  }

  downloadData() {
    this.getNationalData(true);
  }

  resetFilter() {
    const stateObj = { _id: '', code: '', name: '' };
    this.selectedState.set(stateObj);
    this.setStateData();
    this.selectedLedgerYear.set(this.ledgerYears()[0]);
    this.getNationalData();

    // Emit value to parent.
    this.emitFilterValue(true);
  }
}

import { Component, input, Input, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TabButtons } from "../../../../shared/components/tab-buttons/tab-buttons";
import { ButtonObj } from '../../../../core/models/interfaces';
import { StateSearch } from "../../../../shared/components/state-search/state-search";
import { IState } from '../../../../core/models/state/state';
import { NationalService } from '../national.service';
import { NationalChart } from "../national-chart/national-chart";

@Component({
  selector: 'app-national-table',
  imports: [MatTableModule, TabButtons, StateSearch, NationalChart],
  templateUrl: './national-table.html',
  styleUrl: './national-table.scss'
})
export class NationalTable {
  headers: any[] = [];
  tableData: any;
  dataSource: any[] = [];
  displayedColumns: any[] = [];

  selectedStateName = signal<string>('');
  selectedStateCode = signal<string>('');
  selectedStateId = signal<string>('');

  readonly ledgerYears = input.required<string[]>();
  readonly isFullWidth = input<boolean>(true);
  // ledgerYears = signal<string[]>(this.year.data);
  selectedLedgerYear = signal<string>('');


  buttons = signal<ButtonObj[]>([
    { label: 'Population Category', key: 'popCat' },
    { label: 'ULB Type', key: 'ulbType' },
  ]);

  constructor(private nationalService: NationalService) { }


  ngOnInit() {
    // if (this.tableData) {
    //   this.dataSource = this.tableData.rows;
    //   this.headers = this.tableData.columns;
    //   this.displayedColumns = this.tableData.columns.map((ele: any) => ele.key);
    // }

    this.getNationalData();

  }

  getNationalData() {
    const params = {
      financialYear: '2021-22',
      // formType: 'Annual',
      // stateId: '',
      // type: 'Revenue',
      // csv: false
    }
    // /dashboard/national/data-availability?financialYear=2021-22&stateId=&population=true&ulbType=
    const apiEndpoint = 'dashboard/national/data-availability'
    this.nationalService.getNationalData(params, apiEndpoint)
      .subscribe(
        {
          next: (res: any) => {
            console.log("res", res);
            this.tableData = res.data;
            this.setTable();
          },
          error: () => { },
          complete: () => { }
        });
  }

  setTable() {
    this.dataSource = this.tableData.rows;
    this.headers = this.tableData.columns;
    this.displayedColumns = this.tableData.columns?.map((ele: any) => ele.key);
  }
  // Year changed from Drop down.
  public onYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) {
      this.selectedLedgerYear.set(yearSelected);
    }

    console.log("year changed", this.selectedLedgerYear())
  }

  onStateSelection = (stateObj: IState) => {
    console.log("state selection", stateObj)
    this.setStateData(stateObj.code, stateObj._id, stateObj.name)
  }

  // Helper: Update signal values with latest state data.
  private setStateData(code: string = '', _id: string = '', name: string = ''): void {
    this.selectedStateCode.set(code);
    this.selectedStateName.set(name);
    this.selectedStateId.set(_id);
  }

  resetFilter() {
    console.log("resetFilter called")
    // this.selectedLedgerYear.set(this.ledgerYears()[0]);
    // this.resetMap();
  }
}

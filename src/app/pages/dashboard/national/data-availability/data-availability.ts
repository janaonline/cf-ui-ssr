import { Component, input, signal, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ButtonObj } from '../../../../core/models/interfaces';
import { IState } from '../../../../core/models/state/state';
import { Map } from "../../../../shared/components/map/map";
import { StateSearch } from "../../../../shared/components/state-search/state-search";
import { TabButtons } from "../../../../shared/components/tab-buttons/tab-buttons";
import { NationalTable } from "../national-table/national-table";


export interface PeriodicElement {
  name: string;
  popCat: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { popCat: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { popCat: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { popCat: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { popCat: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { popCat: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { popCat: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
];

const RES = {
  "success": true,
  "data": {
    "columns": [
      {
        "key": "populationCategory",
        "display_name": "Population Category",
      },
      {
        "key": "numberOfULBs",
        "display_name": "Number Of ULBs",
      },
      {
        "key": "ulbsWithData",
        "display_name": "ULBs With Data",
      },
      {
        "key": "DataAvailPercentage",
        "display_name": "Data Availability Percentage",
      }
    ],
    "rows": [
      // {},
      {
        "populationCategory": "4M+",
        "numberOfULBs": 8,
        "ulbsWithData": 7,
        "DataAvailPercentage": "88 %"
      },
      {
        "populationCategory": "1M-4M",
        "numberOfULBs": 37,
        "ulbsWithData": 35,
        "DataAvailPercentage": "95 %"
      },
      {
        "populationCategory": "500K-1M",
        "numberOfULBs": 46,
        "ulbsWithData": 41,
        "DataAvailPercentage": "89 %"
      },
      {
        "populationCategory": "100K-500K",
        "numberOfULBs": 382,
        "ulbsWithData": 326,
        "DataAvailPercentage": "85 %"
      },
      {
        "populationCategory": "<100K",
        "numberOfULBs": 4445,
        "ulbsWithData": 3395,
        "DataAvailPercentage": "76 %"
      },
      {
        "populationCategory": "All ULBs",
        "numberOfULBs": 4918,
        "ulbsWithData": 3804,
        "DataAvailPercentage": "77 %"
      }
    ]
  },
  "dataAvailability": 77,
  "fromCache": true
}

@Component({
  selector: 'app-data-availability',
  imports: [Map, StateSearch, TabButtons, MatTableModule, NationalTable],
  templateUrl: './data-availability.html',
  styleUrl: './data-availability.scss'
})
export class DataAvailability {
  @ViewChild('map') mapComponent!: Map;
  selectedStateName = signal<string>('');
  selectedStateCode = signal<string>('');
  selectedStateId = signal<string>('');

  selectedLedgerYear = signal<string>('');
  readonly ledgerYears = input.required<string[]>();

  buttons = signal<ButtonObj[]>([
    { label: 'Population Category', key: 'popCat' },
    { label: 'ULB Type', key: 'ulbType' },
  ]);
  tableData = RES;
  headers!: any[];
  displayedColumns!: string[];
  dataSource!: any[];

  showMap = signal<boolean>(false);
  mapData!: any;

  ngOnInit() {
    this.fetchTableData();
    this.fetchMapData();
  }

  private fetchTableData() {
    this.tableData = RES;
    this.headers = this.tableData.data.columns;
    this.displayedColumns = this.tableData.data.columns.map(ele => ele.key);
    this.dataSource = this.tableData.data.rows;
  }

  private fetchMapData() {
    this.showMap.set(false);


    setTimeout(() => {
      this.mapData = {
        "success": true,
        "data": {
          BR: { _id: "Bihar", stateId: "5dcf9d7216a06aed41c748e0", percentage: 93, shade: "#2c448c" },
          TR: { _id: "Tripura", stateId: "5dcf9d7516a06aed41c748fc", percentage: 70, shade: "#3e5db1" },
          UP: { _id: "Uttar Pradesh", stateId: "5dcf9d7516a06aed41c748fe", percentage: 84, shade: "#2c448c" },
          TN: { _id: "Tamil Nadu", stateId: "5dcf9d7516a06aed41c748fa", percentage: 83, shade: "#2c448c" },
          RJ: { _id: "Rajasthan", stateId: "5dcf9d7516a06aed41c748f8", percentage: 51, shade: "#7a91d1" },
          OD: { _id: "Odisha", stateId: "5dcf9d7416a06aed41c748f5", percentage: 93, shade: "#2c448c" },
          MP: { _id: "Madhya Pradesh", stateId: "5dcf9d7416a06aed41c748ef", percentage: 94, shade: "#2c448c" },
          GJ: { _id: "Gujarat", stateId: "5dcf9d7316a06aed41c748e7", percentage: 92, shade: "#2c448c" },
          MZ: { _id: "Mizoram", stateId: "5dcf9d7416a06aed41c748f3", percentage: 50, shade: "#7a91d1" },
          KL: { _id: "Kerala", stateId: "5dcf9d7316a06aed41c748ed", percentage: 96, shade: "#2c448c" },
          AP: { _id: "Andhra Pradesh", stateId: "5dcf9d7216a06aed41c748dd", percentage: 91, shade: "#2c448c" },
          HR: { _id: "Haryana", stateId: "5dcf9d7316a06aed41c748e8", percentage: 13, shade: "#c3cdee" },
          HP: { _id: "Himachal Pradesh", stateId: "5dcf9d7316a06aed41c748e9", percentage: 42, shade: "#7a91d1" },
          SK: { _id: "Sikkim", stateId: "5dcf9d7516a06aed41c748f9", percentage: 29, shade: "#7a91d1" },
          UK: { _id: "Uttarakhand", stateId: "5dcf9d7516a06aed41c748fd", percentage: 83, shade: "#2c448c" },
          TS: { _id: "Telangana", stateId: "5dcf9d7516a06aed41c748fb", percentage: 74, shade: "#3e5db1" },
          WB: { _id: "West Bengal", stateId: "5dcf9d7616a06aed41c748ff", percentage: 64, shade: "#3e5db1" },
          AS: { _id: "Assam", stateId: "5dcf9d7216a06aed41c748df", percentage: 89, shade: "#2c448c" },
          MH: { _id: "Maharashtra", stateId: "5dcf9d7416a06aed41c748f0", percentage: 74, shade: "#3e5db1" },
          ML: { _id: "Meghalaya", stateId: "5dcf9d7416a06aed41c748f2", percentage: 14, shade: "#c3cdee" },
          PB: { _id: "Punjab", stateId: "5dcf9d7516a06aed41c748f7", percentage: 54, shade: "#7a91d1" },
          JH: { _id: "Jharkhand", stateId: "5dcf9d7316a06aed41c748eb", percentage: 98, shade: "#2c448c" },
          CG: { _id: "Chhattisgarh", stateId: "5dcf9d7216a06aed41c748e2", percentage: 100, shade: "#2c448c" },
          KA: { _id: "Karnataka", stateId: "5dcf9d7316a06aed41c748ec", percentage: 95, shade: "#2c448c" }
        },
        "fromCache": true
      }
      this.showMap.set(true);
    }, 10);
  }

  // When state is selected from drop down.
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

  // When state is selected from map.
  selectedStateCodeChange(stateCode: string) {
    console.log("State changed from map: ", stateCode);
    this.setStateData(stateCode)
  }

  // Year changed from Drop down.
  public onYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) {
      this.selectedLedgerYear.set(yearSelected);
    }

    console.log("year changed", this.selectedLedgerYear())
  }



  // Reset filters.
  resetFilter() {
    console.log("resetFilter called")
    this.selectedLedgerYear.set(this.ledgerYears()[0]);
    this.resetMap();
  }

  // Reset map to india.
  public resetMap(): void {
    this.mapComponent?.resetMap();
    this.setStateData();
  }
}

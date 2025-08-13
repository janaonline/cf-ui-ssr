import { Component, input, signal, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ButtonObj } from '../../../../core/models/interfaces';
import { IState } from '../../../../core/models/state/state';
import { StateDataByCode } from '../../../../shared/components/map/interfaces';
import { Map } from "../../../../shared/components/map/map";
import { NationalTable } from "../national-table/national-table";
import { NationalChart } from "../national-chart/national-chart";

type StateInput = {
  _id: string;
  stateId: string;
  code: string;
  percentage: number;
};

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
  imports: [Map, MatTableModule, NationalTable, NationalChart],
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
      const apiRes = {
        "success": true,
        "data": [
          {
            "_id": "Bihar",
            "stateId": "5dcf9d7216a06aed41c748e0",
            "code": "BR",
            "percentage": 93
          },
          {
            "_id": "Tripura",
            "stateId": "5dcf9d7516a06aed41c748fc",
            "code": "TR",
            "percentage": 70
          },
          {
            "_id": "Uttar Pradesh",
            "stateId": "5dcf9d7516a06aed41c748fe",
            "code": "UP",
            "percentage": 84
          },
          {
            "_id": "Tamil Nadu",
            "stateId": "5dcf9d7516a06aed41c748fa",
            "code": "TN",
            "percentage": 83
          },
          {
            "_id": "Rajasthan",
            "stateId": "5dcf9d7516a06aed41c748f8",
            "code": "RJ",
            "percentage": 51
          },
          {
            "_id": "Odisha",
            "stateId": "5dcf9d7416a06aed41c748f5",
            "code": "OD",
            "percentage": 93
          },
          {
            "_id": "Madhya Pradesh",
            "stateId": "5dcf9d7416a06aed41c748ef",
            "code": "MP",
            "percentage": 94
          },
          {
            "_id": "Gujarat",
            "stateId": "5dcf9d7316a06aed41c748e7",
            "code": "GJ",
            "percentage": 92
          },
          {
            "_id": "Mizoram",
            "stateId": "5dcf9d7416a06aed41c748f3",
            "code": "MZ",
            "percentage": 50
          },
          {
            "_id": "Kerala",
            "stateId": "5dcf9d7316a06aed41c748ed",
            "code": "KL",
            "percentage": 96
          },
          {
            "_id": "Andhra Pradesh",
            "stateId": "5dcf9d7216a06aed41c748dd",
            "code": "AP",
            "percentage": 91
          },
          {
            "_id": "Haryana",
            "stateId": "5dcf9d7316a06aed41c748e8",
            "code": "HR",
            "percentage": 13
          },
          {
            "_id": "Himachal Pradesh",
            "stateId": "5dcf9d7316a06aed41c748e9",
            "code": "HP",
            "percentage": 42
          },
          {
            "_id": "Sikkim",
            "stateId": "5dcf9d7516a06aed41c748f9",
            "code": "SK",
            "percentage": 29
          },
          {
            "_id": "Uttarakhand",
            "stateId": "5dcf9d7516a06aed41c748fd",
            "code": "UK",
            "percentage": 83
          },
          {
            "_id": "Telangana",
            "stateId": "5dcf9d7516a06aed41c748fb",
            "code": "TS",
            "percentage": 74
          },
          {
            "_id": "West Bengal",
            "stateId": "5dcf9d7616a06aed41c748ff",
            "code": "WB",
            "percentage": 64
          },
          {
            "_id": "Assam",
            "stateId": "5dcf9d7216a06aed41c748df",
            "code": "AS",
            "percentage": 89
          },
          {
            "_id": "Maharashtra",
            "stateId": "5dcf9d7416a06aed41c748f0",
            "code": "MH",
            "percentage": 74
          },
          {
            "_id": "Meghalaya",
            "stateId": "5dcf9d7416a06aed41c748f2",
            "code": "ML",
            "percentage": 14
          },
          {
            "_id": "Punjab",
            "stateId": "5dcf9d7516a06aed41c748f7",
            "code": "PB",
            "percentage": 54
          },
          {
            "_id": "Jharkhand",
            "stateId": "5dcf9d7316a06aed41c748eb",
            "code": "JH",
            "percentage": 98
          },
          {
            "_id": "Chhattisgarh",
            "stateId": "5dcf9d7216a06aed41c748e2",
            "code": "CG",
            "percentage": 100
          },
          {
            "_id": "Karnataka",
            "stateId": "5dcf9d7316a06aed41c748ec",
            "code": "KA",
            "percentage": 95
          }
        ],
        "fromCache": true
      }

      this.mapData = this.transformStateData(apiRes.data)
      this.showMap.set(true);
    }, 10);
  }

  // Get map shade
  private getShade(percentage: number): string {
    if (percentage >= 85) return "#2c448c";
    if (percentage >= 70) return "#3e5db1";
    if (percentage >= 50) return "#7a91d1";
    return "#c3cdee";
  }

  // Restructure api res.
  private transformStateData(data: StateInput[]): StateDataByCode {
    return data.reduce((acc, state) => {
      acc[state.code] = {
        _id: state._id,
        stateId: state.stateId,
        percentage: state.percentage,
        shade: this.getShade(state.percentage),
      };
      return acc;
    }, {} as StateDataByCode);
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

  // Download clicked.
  downloadData() {
    console.log("Download button clicked - Data availability");
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

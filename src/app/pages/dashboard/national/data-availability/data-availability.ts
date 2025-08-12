import { Component, input, signal, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ButtonObj } from '../../../../core/models/interfaces';
import { IState } from '../../../../core/models/state/state';
import { Map } from "../../../../shared/components/map/map";
import { StateSearch } from "../../../../shared/components/state-search/state-search";
import { TabButtons } from "../../../../shared/components/tab-buttons/tab-buttons";


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
        "className": " text-center "
      },
      {
        "key": "numberOfULBs",
        "display_name": "Number Of ULBs",
        "className": " text-end "
      },
      {
        "key": "ulbsWithData",
        "display_name": "ULBs With Data",
        "className": " text-end "
      },
      {
        "key": "DataAvailPercentage",
        "display_name": "Data Availability Percentage",
        "className": " text-end "
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
  imports: [Map, StateSearch, TabButtons, MatTableModule],
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
  RES = RES;
  headers = this.RES.data.columns;
  displayedColumns: string[] = this.RES.data.columns.map(ele => ele.key);
  dataSource = this.RES.data.rows;


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

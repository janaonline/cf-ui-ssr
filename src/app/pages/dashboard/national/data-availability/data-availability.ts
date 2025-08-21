import { ChangeDetectorRef, Component, input, signal, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ButtonObj } from '../../../../core/models/interfaces';
import { IState } from '../../../../core/models/state/state';
import { StateDataByCode } from '../../../../shared/components/map/interfaces';
import { Map } from "../../../../shared/components/map/map";
import { NationalTable } from "../national-table/national-table";
import { NationalService } from '../national.service';

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
@Component({
  selector: 'app-data-availability',
  imports: [Map, MatTableModule, NationalTable],
  templateUrl: './data-availability.html',
  styleUrl: './data-availability.scss'
})
export class DataAvailability {
  @ViewChild('map') mapComponent!: Map;
  selectedstate = signal<IState>({ _id: '', name: '', code: '' });
  type = signal<string>('populationCategory');

  selectedLedgerYear = signal<string>('');
  readonly ledgerYears = input.required<string[]>();

  buttons = signal<ButtonObj[]>([
    { label: 'Population Category', key: 'popCat' },
    { label: 'ULB Type', key: 'ulbType' },
  ]);
  headers!: any[];
  displayedColumns!: string[];
  dataSource!: any[];

  showMap = signal<boolean>(false);
  mapData!: any;

  constructor(
    private nationalService: NationalService,
  ) { }

  ngOnInit() {
    this.selectedLedgerYear.set(this.ledgerYears()[0]);
    this.loadData();
  }

  private loadData() {
    this.fetchMapData();
  }

  private fetchMapData() {
    this.showMap.set(false);

    if (this.selectedLedgerYear()) {
      this.nationalService
        .getDataAvailabilityMapData(
          this.selectedLedgerYear(),
          this.type(),
          this.selectedstate()._id
        ).subscribe({
          next: (res) => {
            // console.log(res)
            this.mapData = this.transformStateData(res.data)
            this.showMap.set(true);
          },
          error: () => console.error('Failed to fetch map data, data availabilty section.')
        })
    }
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

  // Filter changed from national-table.
  filterChanged(data: { reset: boolean, year: string, stateObj: IState, type: string }) {
    // console.log("data", data)
    if (data.reset) {
      this.resetFilter();
    } else {

      this.selectedLedgerYear.set(data.year);
      this.selectedstate.set(data.stateObj);
      this.type.set(data.type);

      this.loadData();
    }
  }

  // // When state is selected from drop down.
  // onStateSelection = (stateObj: IState) => {
  //   this.selectedstate.set(stateObj)
  //   console.log("state selection", this.selectedstate())
  // }

  // When state is selected from map.
  selectedStateCodeChange(stateCode: string) {
    this.selectedstate.set({ code: stateCode, _id: '', name: '' });
    // console.log("state selection", this.selectedstate())
  }

  // Year changed from Drop down.
  public onYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) {
      this.selectedLedgerYear.set(yearSelected);
    }

    this.loadData();
  }

  // Reset map to india.
  public resetFilter(): void {
    this.mapComponent?.resetMap();
    this.selectedLedgerYear.set(this.ledgerYears()[0]);
    this.selectedstate.set({ _id: '', code: '', name: '' });
    this.loadData();
  }
}

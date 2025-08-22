import { ChangeDetectorRef, Component, input, signal, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ButtonObj } from '../../../../core/models/interfaces';
import { IState } from '../../../../core/models/state/state';
import { StateDataByCode } from '../../../../shared/components/map/interfaces';
import { Map } from "../../../../shared/components/map/map";
import { NationalTable } from "../national-table/national-table";
import { NationalService } from '../national.service';
import { CommonService } from '../../../../core/services/common.service';

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
  selectedstateObj = signal<IState>({ _id: '', name: '', code: '' });
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
  mapData = signal<StateDataByCode>({});

  // isResetFilter = signal<boolean>(false);
  stateList: any = {};

  constructor(
    private nationalService: NationalService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.selectedLedgerYear.set(this.ledgerYears()[0]);
    this.getStatesList();
  }

  private getStatesList() {
    this.commonService.fetchStateList().subscribe({
      next: (statesArr) => {
        for (const state of statesArr) {
          const stateCode = state.code;
          if (stateCode) {
            if (!(stateCode in this.stateList)) this.stateList[stateCode] = {};
            this.stateList[stateCode] = state;
          }
        }
      },
      error: () => console.error("Failed to fetch states list"),
    })
  }

  private loadData() {
    if (!this.selectedstateObj()._id)
      this.fetchMapData();
  }

  private fetchMapData() {
    this.showMap.set(false);
    // console.log("selected state = ", abc, "---", this.selectedstateObj())
    if (this.selectedLedgerYear()) {
      this.nationalService
        .getDataAvailabilityMapData(
          this.selectedLedgerYear(),
          this.type(),
          this.selectedstateObj()._id
        ).subscribe({
          next: (res) => {
            // console.log(res)
            const data = this.transformStateData(res.data);
            this.mapData.set(data);
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
    if (data.reset) {
      this.resetFilter();
      // this.mapComponent?.resetMap();
    } else {
      this.selectedLedgerYear.set(data.year);
      this.selectedstateObj.set(data.stateObj);
      this.type.set(data.type);

      this.loadData();
    }
  }

  // When state is selected from map.
  selectedStateCodeChange(stateCode: string) {
    const stateObj = this.stateList[stateCode];
    this.selectedstateObj.set(stateObj);
  }

  // Year changed from Drop down.
  public onYearChange($event: Event): void {
    const yearSelected = ($event.target as HTMLSelectElement).value;
    if (this.selectedLedgerYear() !== yearSelected) {
      this.resetFilter()
      this.selectedLedgerYear.set(yearSelected);
    }
    this.loadData();
  }

  // Reset map to india.
  public resetFilter(): void {
    this.mapComponent?.resetMap();
    this.selectedstateObj.set({ _id: '', code: '', name: '' });
    // this.selectedLedgerYear.set(this.ledgerYears()[0]);
    // this.loadData('reset filter');
  }
}

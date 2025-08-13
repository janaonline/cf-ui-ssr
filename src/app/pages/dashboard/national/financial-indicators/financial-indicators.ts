import { Component, input, signal } from '@angular/core';
import { TabButtons } from "../../../../shared/components/tab-buttons/tab-buttons";
import { LineItemType } from '../../../../core/models/interfaces';
import { FormGroup } from '@angular/forms';
import { NationalService } from '../national.service';
import { NationalTable } from "../national-table/national-table";

@Component({
  selector: 'app-financial-indicators',
  imports: [TabButtons, NationalTable],
  templateUrl: './financial-indicators.html',
  styleUrl: './financial-indicators.scss'
})
export class FinancialIndicators {

  selectedLedgerYear = signal<string>('');
  readonly ledgerYears = input.required<string[]>();

  readonly stateIdSignal = signal('');
  // readonly stateDetails = input.required<any>();
  readonly dashboardTabData = input.required<any>();

  currentSelectedButtonKey = signal<string>('Revenue');
  currentSelectedButton: any = signal<any>({});

  myForm!: FormGroup;
  years = signal<string[]>([]);
  constructor(private nationalService: NationalService) {

  }
  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    // this.currentSelectedButtonKey.set(key as LineItemType);
    this.nationalService.selectedButtonKey.set(key);
  }

  ngOnInit() {
    // console.log(this.dashboardTabData(), 'dashboardTabData')
  }

  downloadData() {
    console.log("Download button clicked - Financial indicators");
  }

  // getFinancialData() {
  //   const params = {
  //     financialYear: '2021-22',
  //     formType: 'Annual',
  //     stateId: '',
  //     type: 'Revenue',
  //     csv: false
  //   }
  //   this.nationalService.getNationalRevenueData(params, this.currentSelectedButtonKey())
  //     .subscribe(
  //       {
  //         next: (res) => { },
  //         error: () => { },
  //         complete: () => { }
  //       });
  // }

  //  tableLoader: boolean = false;
  // getNationalTableData(endPoint) {
  //   this.tableLoader = true;
  //   this._loaderService.showLoader();
  //   try {
  //     this.nationalService
  //       .getNationalRevenueData(this.nationalInput, endPoint)
  //       .subscribe((res: any) => {
  //         // console.log("")
  //         this.tableLoader = false;
  //         this._loaderService.stopLoader();
  //         this.tableData = res?.data;
  //         // this.dataAvailabilityvalue = res?.dataAvailability;

  //         this.creatBarChartData(this.selectedGraphValue);
  //       });
  //   } catch (err) {
  //     this.tableLoader = false;
  //     this._loaderService.stopLoader();
  //   }
  // }

  // creatBarChartData(value) {
  //   console.log({ value });
  //   // let newValue;
  //   if (this.CurrentHeadTab.toLowerCase() == "revenue") {
  //     this.newValue =
  //       value.toLowerCase() == "revenue" ? "revenue" : "revenuePerCapita";
  //   } else if (this.CurrentHeadTab.toLowerCase() == "expenditure") {
  //     if (this.activetab == "Deficit or Surplus") {
  //       console.log("this....tableData", this.tableData);
  //       let deficitData = this.tableData.rows.map((elem) => {
  //         return parseInt(elem.revenue);
  //       });
  //       let expenseData = this.tableData.rows.map((elem) => {
  //         return parseInt(elem.expense);
  //       });

  //       this.deficitBarChartData[2].data = deficitData.slice(1);
  //       this.deficitBarChartData[3].data = expenseData.slice(1);

  //       let calculatedData = deficitData;
  //       let newCalcualtesData = expenseData;
  //       let firstLine = [];
  //       let secondLine = [];
  //       for (let index = 0; index < deficitData.length - 1; index++) {
  //         firstLine.push(...calculatedData.slice(0, 1));
  //       }
  //       for (let index = 0; index < expenseData.length - 1; index++) {
  //         secondLine.push(...newCalcualtesData.slice(0, 1));
  //       }
  //       this.deficitBarChartData[0].data = firstLine;
  //       this.deficitBarChartData[1].data = secondLine;

  //       console.log("deficitData==>", this.barChartData);
  //     }
  //     this.newValue =
  //       value.toLowerCase() == "expenditure"
  //         ? "expenditure"
  //         : "expenditurePerCapita";
  //   } else if (this.CurrentHeadTab.toLowerCase() == "own revenue") {
  //     this.newValue =
  //       value.toLowerCase() == "ownrevenue"
  //         ? "Ownrevenue"
  //         : "OwnrevenuePerCapita";
  //   } else if (this.CurrentHeadTab.toLowerCase() == "capital expenditure") {
  //     this.newValue = value == "capitalExpenditure" ? "amount" : "perCapita";
  //   }
  //   console.log("newValue==>", this.newValue);

  //   // this.yAxesLabel = this.newValue;

  //   if (this.tableData)
  //     this.revnueChartData = this.tableData?.rows?.map((elem) => {
  //       return parseInt(elem[this.newValue]);
  //     });

  //   let calculatedData = this.revnueChartData;
  //   if (this.barLineData) {
  //     this.barLineData = [];
  //   }
  //   for (let index = 0; index < this.revnueChartData?.length - 1; index++) {
  //     this.barLineData.push(...calculatedData);
  //   }

  //   this.revnueChartData = this.revnueChartData.slice(1);

  //   this.barChartData[1].data = this.revnueChartData;
  //   this.barChartData[0].data = this.barLineData;
  //   console.log(
  //     "this.revenueChartData",
  //     this.revnueChartData,
  //     this.newValue,
  //     this.barChartData
  //   );
  //   this.barChartInit();
  // }

  // selectGraphMode(event) {
  //   this.selectedGraphValue = event.target.value;

  //   this.creatBarChartData(this.selectedGraphValue);
  // }
}

import { Component, Input, input, signal } from '@angular/core';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { LineItemType } from '../../../../core/models/interfaces';
import { IULBResponse, ULB } from './models/ulbsResponse';
import { ICell, IIExcelInput } from './models/excelFormat';
import { IBondIssuerItem, IBondIssureItemResponse } from './models/bondIssureItemResponse';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MunicipalBondsService } from './municipal-bonds.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../../core/services/common.service';
import { GeographicalService } from '../../../../core/services/geographical/geographical.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IBondIssuer } from './models/bondIssuerResponse';

@Component({
  selector: 'app-borrowing-credit-rating',
  imports: [TabButtons],
  templateUrl: './borrowing-credit-rating.html',
  styleUrl: './borrowing-credit-rating.scss'
})
export class BorrowingCreditRating {

  readonly stateIdSignal = signal('');
  readonly stateDetails = input.required<any>();
  readonly dashboardTabData = input.required<any>();
  readonly tabName = input.required<any>();

  currentSelectedButtonKey = signal<string>('Revenue');
  subButton = signal<string>('');
  currentSelectedButton: any = signal<any>({});

  onSelectedButtonChange(key: string): void {
    this.currentSelectedButtonKey.set(key as LineItemType);
    this.currentSelectedButton.set(this.dashboardTabData().find((btn: any) => btn.key === this.currentSelectedButtonKey()));
  }
  getCurrentBtn() {
  }

  filterForm!: FormGroup;
  ulbFilteredByName!: ULB[];
  stateList!: IULBResponse["data"];
  originalULBList!: IULBResponse["data"];
  yearsAvailable: { name: string }[] = [];
  statesAvailable = [];
  @Input() value: any;
  yearsDropdownSettings = {
    singleSelection: false,
    text: "All Years",
    enableSearchFilter: false,
    badgeShowLimit: 1,
    showCheckbox: true,
    labelKey: "name",
    primaryKey: "name",
    classes: "dropdown-year",
  };
  stateDropdownSettings = {
    ...this.yearsDropdownSettings,
    text: "All States",
    classes: "dropdown-state",
  };

  ulbDropdownConfiguration = {
    primaryKey: "name",
    singleSelection: false,
    text: "All ULBs",
    enableSearchFilter: true,
    badgeShowLimit: 1,
    labelKey: "name",
    showCheckbox: true,
    noDataLabel: "No Data available",
    classes: "ulbDropdown",
  };

  stateDropdownConfiguration = {
    primaryKey: "state",
    singleSelection: false,
    text: "All States",
    enableSearchFilter: true,
    badgeShowLimit: 1,
    labelKey: "stateName",
    showCheckbox: true,
    noDataLabel: "No Data available",
    classes: "ulbDropdown state-dropdown",
  };

  mainRows!: IBondIssuer;
  bondIssuerItemData!: IBondIssuerItem[];
  paginatedbondIssuerItem!: IBondIssuerItem[];

  accordianHeaderFormattedName: { [originalHeader: string]: string } = {};
  object = Object;

  formattedNamesMapping: { [nameIdentifier: string]: string } = {};

  ulbItemLimitPerPage = 5;
  defaultPageView = 1;
  currentPageInView = 1;
  totalCount: any;
  private regexToSplitWordOnCapitalLetters = /([A-Z]+[^A-Z]*|[^A-Z]+)/;

  // defaultDailogConfiuration: IDialogConfiguration = {
  //   message:
  //     "<p class='text-center'>You need to be Login to download the data.</p>",
  //   buttons: {
  //     confirm: {
  //       text: "Proceed to Login",
  //       callback: () => {
  //         sessionStorage.setItem("postLoginNavigation", this.router.url);
  //         this.router.navigate(["/", "login"]);
  //       },
  //     },
  //     signup: {
  //       text: "Signup",
  //       callback: () => {
  //         this.router.navigate(["/register/user"]);
  //       },
  //     },
  //     cancel: { text: "Cancel" },
  //   },
  // };

  queryParams: any = {};
  window = window;
  ulbList = JSON.parse(localStorage.getItem("ulbMapping") || '{}');
  ulbNameMapping: any;

  allUlbList = JSON.parse(localStorage.getItem("ulbList") || '{}').data;
  ulbStateMapping = JSON.parse(localStorage.getItem("ulbStateCodeMapping") || '{}');
  stateIdsMap = JSON.parse(localStorage.getItem("stateIdsMap") || '{}');
  cityId: any;
  stateId: any;
  notFound = false;
  stateUlbList: any;

  selectedUlbList: any = [];
  selectedYears: any = [];
  ulbType: any;
  constructor(
    private _formBuilder: FormBuilder,
    private _bondService: MunicipalBondsService,
    // private _excelService: ExcelService,
    private authService: AuthService,
    // private diaglog: MatDialog,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    protected _commonService: CommonService,
    protected _geoService: GeographicalService,
    private snackbar: MatSnackBar
  ) {
    this.loadMapGeoJson();
    this._activatedRoute.queryParams.subscribe((params) => {
      console.log("queryParams==>", params);
      this.queryParams = params;
      this.cityId = params['cityId'];
      this.stateId = params['stateId'];
      this.initializeForm();
      this.initializeFormListeners();
      this._bondService
        .getBondIssuer()
        .subscribe((res) => this.onGettingBondIssuerSuccess(res));
      this._bondService
        .getBondIssuerItem()
        .subscribe((res) => this.onGettingBondIssuerItemSuccess(res));
      this._bondService
        .getULBS()
        .subscribe((res) => this.onGettingULBResponseSuccess(res));
    });
    this.createUlbNameMap();
  }

  StatesJSONForMapCreation: any;
  loadMapGeoJson() {
    const prmsArr = [];

    const prms1 = this._geoService.loadConvertedIndiaGeoData().toPromise();
    prmsArr.push(prms1);

    prms1.then((data) => (this.StatesJSONForMapCreation = data));
    console.log("StatesJSONForMapCreation", this.StatesJSONForMapCreation);

    return Promise.all(prmsArr).then((value) => {
      console.log("value", value);
      this.getFormValue();
    });
  }

  createUlbNameMap() {
    let obj: any = {};
    for (const key in this.ulbList) {
      const element = this.ulbList[key];
      obj[element.name] = element;
    }
    this.ulbNameMapping = obj;
  }

  onStateDropdownClose() {
    const statesSelected: IULBResponse["data"] = this.filterForm.value.states;

    // Update the ulb list
    let newULBList: IULBResponse["data"];
    const yearsSelected = this.filterForm.value.years;
    if (statesSelected.length) {
      newULBList = this.getULBByState(
        statesSelected.map((state: any) => state.state),
        this.originalULBList
      );
    } else {
      if (yearsSelected.length) {
        newULBList = this.getULBHavingYears(
          yearsSelected,
          this.originalULBList
        );
      } else {
        newULBList = [...this.originalULBList];
      }
    }

    // Filter Out ULBs based on years if selected.
    if (yearsSelected.length) {
      newULBList = this.getULBHavingYears(yearsSelected, newULBList);
    }

    this.ulbFilteredByName = newULBList;
    this.updateSelectedULB();
  }

  onULBDropdownClose() {
    setTimeout(() => {
      const ulbSelected = this.filterForm.value.ulbs;
      const yearsSelected = this.filterForm.value.years;
      if (ulbSelected.length) {
        this.initializeStateList(ulbSelected);
      } else if (yearsSelected.length) {
        this.initializeStateList(this.ulbFilteredByName);
      } else {
        this.initializeStateList(this.originalULBList);
      }
    });
  }

  onyearSelected() {
    // debugger
    const yearList = this.filterForm.controls["years"].value;
    console.log("mainRows", this.paginatedbondIssuerItem);
    let newULBList: IULBResponse["data"];
    // Update the ULBs
    if (!yearList.length) {
      newULBList = this.originalULBList;
    } else {
      newULBList = this.getULBHavingYears(yearList, this.originalULBList);
    }
    // Check with state.
    const statesSelected = this.filterForm.value.states;
    if (statesSelected.length) {
      newULBList = this.getULBByState(
        statesSelected.map((state: any) => state.state),
        newULBList
      );
    }

    this.ulbFilteredByName = newULBList;
    this.updateSelectedULB();

    // Update the State List.
    const ulbsSelected = this.filterForm.value.ulbs;
    if (ulbsSelected.length) {
      this.initializeStateList(ulbsSelected);
    } else {
      if (yearList.length) {
        this.initializeStateList(newULBList);
      } else {
        this.initializeStateList(this.originalULBList);
      }
    }

    this.updateSelectedState();
    this.onSubmittingFilterForm();
  }

  resetFilters() {
    this.filterForm.patchValue({ ulbs: [], years: [], states: [] });
    this.initializeStateList(this.originalULBList);
    this.initializeYearList(this.originalULBList);
    this.issueLength.patchValue("4");
  }

  private onGettingBondIssuerSuccess(res: IBondIssuer) {
    console.log("onGettingBondIssuerSuccess", res);
    Object.keys(res).forEach((name: string) => {
      const capitalizedName = this.capitalizedName(name);
      this.formattedNamesMapping[name] = capitalizedName;
      res[name].forEach((name: any) => {
        const formattedName = this.capitalizedName(name);
        this.formattedNamesMapping[name] = formattedName;
      });
    });
    this.mainRows = res;
  }

  private onGettingBondIssuerItemSuccess(datas: {
    total: number;
    data: IBondIssureItemResponse["data"];
  }) {
    console.log("onGettingBondIssuerItemSuccess", datas);
    if (datas.data) {
      this.getFormValue();
    }
    console.log("newData", datas);
    this.bondIssuerItemData = datas.data;
    if (this.cityId) { this.bondIssuerItemData = datas.data.filter((e: any) => e.ulbId === this.cityId); }

    if (this.queryParams['stateId']) {
      this.filterdData = this.bondIssuerItemData.filter(
        (elem: any) => elem.state == this.stateId
      );
      this.newYearsList = new Set(
        this.filterdData.map((elem: any) => elem.yearOfBondIssued)
      );
      this.newYearsList = [...this.newYearsList].sort((a, b) => a - b);
      this.yearsList = this.newYearsList;
      console.log(
        "main years",
        typeof this.yearsList,
        this.yearsList,
        this.filterdData,
        this.newYearsList
      );
      this.makeDataForState(this.filterdData);
      // this.makeDataForState(datas.data);
    }
    //this.paginatedbondIssuerItem = this.sliceDataForCurrentView(datas.data);
    this.paginatedbondIssuerItem = this.cityId ? this.sliceDataForCurrentView(this.bondIssuerItemData) : this.sliceDataForCurrentView(datas.data);

    let tempArr: any = [];
    let tempIssueArr: any = [];

    this.paginatedbondIssuerItem.forEach((elem) => {
      let bidValue = elem.bidsReceived;
      console.log("bidValue", bidValue, elem);
      let issueValue = elem.issueSize;
      if (bidValue !== "Not Available" && bidValue) {
        if (bidValue.includes(",")) {
          let commaValue = bidValue.split(" ")[1].split(",");
          tempArr.push(commaValue[0] + commaValue[1]);
        } else {
          tempArr.push(bidValue.split(" ")[1]);
        }
      }

      if (issueValue) {
        tempIssueArr.push(issueValue.split(" ")[1]);
      }
    });

    console.log("tempArr", tempArr, tempIssueArr);

    this.bidReceivedAmount = tempArr.reduce((prevValue: any, currentValue: any) => {
      return parseInt(prevValue) + parseInt(currentValue);
    }, 0);

    this.issueSize = tempIssueArr.reduce((prevValue: any, currentValue: any) => {
      return parseInt(prevValue) + parseInt(currentValue);
    }, 0);

    console.log("bidReceivedAmount", this.bidReceivedAmount, this.issueSize);
    //this.totalCount = datas.total;
    this.totalCount = this.cityId ? this.bondIssuerItemData.length : datas.total;

    console.log("currentData===>", this.bondIssuerItemData);
  }
  totalDataSource: any;
  filterdData: any;
  finalFileteredData: any;

  searchFilter() {
    console.log(
      "finalData",
      this.selectedUlbList,
      this.selectedYears,
      this.ulbType
    );
    let names = this.selectedUlbList.map((elem: any) => elem.name);
    let stringVal: string = "";

    if (this.tableDataSource.length == 0) {
      stringVal = "No data Present to filter";
    } else if (
      this.selectedUlbList.length == 0 &&
      this.selectedYears.length == 0
    ) {
      stringVal = "Please select a ulb and year";
    } else {
      stringVal = "Please select both ulb and year";
    }

    if (this.selectedUlbList.length > 0 && this.selectedYears.length > 0) {
      // this.finalFileteredData = this.bondIssuerItemData.filter((elem) => {
      //   if (
      //     names.includes(elem.ulb) &&
      //     this.selectedYears.includes(elem.yearOfBondIssued)
      //   ) {
      //     return elem;
      //   }
      // });
      this.finalFileteredData = this.bondIssuerItemData.filter((elem) => {
        return (
          names.includes(elem.ulb) &&
          this.selectedYears.includes(elem.yearOfBondIssued)
        );
      });
      console.log("this.finalFileteredData", this.finalFileteredData);
      this.makeDataForState(this.finalFileteredData);
    } else {
      this.snackbar.open(stringVal, '', {
        duration: 5000,
        verticalPosition: "bottom",
      });
      return;
    }
  }

  sortDirection = false;
  sortTableData(index: any) {
    this.sortDirection = !this.sortDirection;
    this.tableDataSource = this.tableDataSource.sort((a: any, b: any) => {
      return this.sortDirection
        ? a[index].localeCompare(b[index])
        : b[index].localeCompare(a[index]);
    });
  }

  makeDataForState(rawData: any) {
    this.tableDataSource = rawData.map((val: any) => {
      let temp = {
        municipality: val.ulb == "" ? "NA" : val.ulb,
        ulbType: this.ulbNameMapping == undefined ? "N/A" :
          this.ulbNameMapping[val.ulb]?.type == ""
            ? "NA"
            : this.ulbNameMapping.hasOwnProperty(val.ulb)
              ? this.ulbNameMapping[val.ulb]?.type
              : "NA",
        year: val.yearOfBondIssued == "" ? "NA" : val.yearOfBondIssued,
        rating: val.CRISIL == "" ? "NA" : val.CRISIL,
        amount: val.amountAccepted == "" ? "NA" : val.amountAccepted,
        couponRate: val.couponRate == "" ? "NA" : val.couponRate,
        _id: val._id == "" ? "NA" : val._id,
      };
      return temp;
    });
    // this.StatesJS
    this.tableDataSource = this.tableDataSource.sort(
      (a: any, b: any) => b.year - a.year
    );
    this.totalDataSource = this.tableDataSource;
    console.log(this.tableDataSource, "tableDataSource");
  }

  clearAllValue() {
    console.log("filteredData", this.filterdData);
    this.selectedUlbList = [];
    this.selectedYears = [];
    this.yearsList = this.newYearsList;
    this.makeDataForState(this.filterdData);
  }

  getFormValue() {
    let stateName = this.stateIdsMap[this.stateId];
    console.log("this.filterFomr", this.filterForm);
    console.log("StatesJSONForMapCreation", this.StatesJSONForMapCreation);
    let stateCode = this.StatesJSONForMapCreation?.features?.find(
      (code: any) => code.properties.ST_NM == stateName
    );
    console.log("stateCode", stateCode, this.tableDataSource);
    if (stateCode && this.tableDataSource.length > 0) {
      let ulbList = this.allUlbList[stateCode?.properties?.ST_CODE];
      console.log("ulbList", ulbList.ulbs);
      this.stateUlbList = ulbList?.ulbs;
      if (this.originalULBList && this.originalULBList.length > 0) {
        this.stateUlbList = this.originalULBList.filter((el) => {
          return ulbList.ulbs.filter((f: any) => {
            return f.name === el.name;
          });
        });
      }
    } else {
      this.stateUlbList = [];
    }
    console.log("stateUlbList", this.stateUlbList);
  }

  ulbTypeList: any = [];
  yearsList: any = [];
  newYearsList: any = [];

  selectMultipleUlb(e: any) {
    this.selectedUlbList = e;

    this.ulbTypeList = new Set(this.selectedUlbList.map((elem: any) => elem.type));

    let myArrayFiltered: any = this.originalULBList
      .filter((el) => {
        return this.selectedUlbList.some((f: any) => {
          return f.name === el.name;
        });
      })
      .map((elem) => elem.years);

    let tempArr = myArrayFiltered.flat();
    this.yearsList = new Set(tempArr);
    this.yearsList = [...this.yearsList].sort((a, b) => a - b);

    console.log(
      "myArrayFiltered",
      myArrayFiltered,
      this.yearsList,
      this.newYearsList
    );
  }

  selectMultipleYear(e: any) {
    this.selectedYears = e;
    console.log("this.selectedYears", this.selectedYears);
  }

  selectUlbType(e: any) {
    console.log("new event", e.target.value);
    this.ulbType = e.target.value;
  }

  selectedUlb: any = [];
  private onGettingULBResponseSuccess(response: IULBResponse) {
    console.log("onGettingULBResponseSuccess", response);
    if (this.state) {
      let foundState;
      foundState = response.data.filter(
        (value) => value.stateName === this.stateIdsMap[this.stateId]
      );
      if (!foundState) {
        this.notFound = true;
        return;
      } else {
        this.filterForm.controls["states"].patchValue([...foundState]);
        this.notFound = false;
      }
    } else {
      let foundUlb;
      foundUlb = response.data.find(
        (value) => value.name === this.ulbList[this.cityId].name
      );
      if (!foundUlb) {
        this.notFound = true;
        return;
      } else {
        this.filterForm.controls["ulbs"].patchValue([foundUlb]);
        this.selectedUlb.push(foundUlb);
        this.notFound = false;
      }
    }
    this.originalULBList = response.data;

    console.log("originalULBList", this.originalULBList);
    this.ulbFilteredByName = response.data;
    this.initializeStateList(response.data);

    // this.initializeYearList(response.data);

    // Auto select state from query Params
    this.setStateFromQueryParams(this.queryParams);
    // this.onSubmittingFilterForm();
  }

  private setStateFromQueryParams(queryParams: { [key: string]: string }) {
    if (queryParams["state"]) {
      const stateFound = this.stateList.find(
        (state) => state.state === queryParams["state"]
      );
      console.log(`state Found`, stateFound);
      if (!stateFound) return;
      this.filterForm.controls["states"].setValue([stateFound]);
      this.onStateDropdownClose();
      this.onSubmittingFilterForm();
    }
  }

  private initializeYearList(list: IULBResponse["data"]) {
    this.yearsAvailable = this.getUniqueYearsFromULBS(list)
      .sort((a, b) => (+a > +b ? -1 : 1))
      .map((year) => ({ name: year }));
  }

  private initializeStateList(response: IULBResponse["data"]) {
    if (!response) return;
    const unqiueStates: any = {};
    this.stateList = [];
    response.forEach((state: any) => {
      if (unqiueStates[state.state]) return;

      this.stateList.push(state);
      unqiueStates[state.state] = state;
    });
  }

  private capitalizedName(originalName: string) {
    const formattedName = originalName
      .split(this.regexToSplitWordOnCapitalLetters)
      .join(" ")
      .trim();

    return formattedName[0].toUpperCase() + formattedName.substring(1);
    // formattedName.trim();
  }

  empty: any[] = [];
  emptyArray() {
    this.empty = new Array(10).fill(null);
  }
  city: boolean = false;
  state: boolean = false;
  bondParam: any = {
    years: [],
    state: [],
    ulbs: [],
  };

  ngOnInit() {
    let selectedUlb: any = this.ulbList[this.cityId]?.name;
    console.log("selectedUlb", selectedUlb);

    this.bondParam.ulbs.push(selectedUlb);
    // setTimeout(() => {
    //   console.log("bondParam", this.bondParam);
    //   this._bondService
    //     .getBondIssuerItem(this.bondParam)
    //     .subscribe((res) => this.onGettingBondIssuerItemSuccess(res));
    // }, 100);
    this.emptyArray();
    console.log("valueeeeeeee" + this.value);
    if (this.value == "city") {
      this.city = true;
      this.state = false;
    }
    if (this.value == "state") {
      this.state = true;
      this.city = false;
    }
    console.log(this.filterForm);
  }
  issueLength: any = 4;
  issueSize: number = 0;
  bidReceivedAmount: any = "";
  tableHeading = [
    {
      title: "Municipality",
      keyToAccessValue: "municipality",
      class: "fa-sort sort-icon",
    },
    {
      title: "ULB Type",
      keyToAccessValue: "ulbType",
      class: "fa-sort sort-icon",
    },
    { title: "Year", keyToAccessValue: "year", class: "fa-sort sort-icon" },
    { title: "Rating", keyToAccessValue: "rating", class: "fa-sort sort-icon" },
    {
      title: "Amount (In Cr)",
      keyToAccessValue: "amount",
      class: "fa-sort sort-icon",
    },
    {
      title: "Coupon Rate",
      keyToAccessValue: "couponRate",
      class: "fa-sort sort-icon",
    },
  ];

  tableDataSource = [
    // {
    //   municipality: "Ahmadnagar",
    //   ulbType: "Municipality",
    //   year: "1997",
    //   rating: "AA",
    //   amount: 100,
    //   couponRate: "14.0",
    //   _id: "1",
    // },
    {
      municipality: "",
      ulbType: "",
      year: "",
      rating: "",
      amount: "",
      couponRate: "",
      _id: "",
    },
  ];
  ulbListLatest: any;
  onSubmittingFilterForm() {
    const params = this.createParamsForssuerItem(this.filterForm.value);
    console.log("parama", params);

    this._bondService.getBondIssuerItem(params).subscribe((res: any) => {
      console.log(res);
      this.issueLength = res.total;
      this.onGettingBondIssuerItemSuccess(res);
    });
    this.resetPagination();
    if (params.years.length == 0) {
      this.issueLength = 4;
    }
  }

  onClickDownload() {
    const isUserLoggedIn = this.authService.loggedIn();
    if (!isUserLoggedIn) {
      // const dailogboxx = this.diaglog.open(DialogComponent, {
      //   data: this.defaultDailogConfiuration,
      //   width: "28vw",
      // });
      return;
    }

    const firstRow = [this.createCSVFileHeaders()];
    const subHeaders = this.createSubHeader();
    const finalRow = firstRow.concat(subHeaders);
    const currentDate = new Date().toLocaleDateString();
    const obj: IIExcelInput = {
      rows: finalRow,
      fileName: `Municipal Bond ${currentDate}`,
      skipStartingColumns: 1,
      skipStartingRows: 3,
      fontSize: 10,
    };
    // this._excelService.downloadJSONAs(obj);
  }

  setPage(pageNoClick: number) {
    console.log("pageNoClick", pageNoClick);
    setTimeout(() => {
      this.currentPageInView = pageNoClick;
      this.paginatedbondIssuerItem = this.sliceDataForCurrentView(
        this.bondIssuerItemData
      );
    }, 500);
  }

  private getULBByState(stateIds: string[], list: IULBResponse["data"]) {
    return list.filter((ulb: any) => stateIds.includes(ulb.state));
  }

  private updateSelectedULB() {
    const filteredSelectedULBS = (<ULB[]>(
      this.filterForm.controls["ulbs"].value
    )).filter(
      (ulb) =>
        !!this.ulbFilteredByName.find(
          (ulbToCheck) => ulbToCheck.name === ulb.name
        )
    );

    this.filterForm.controls["ulbs"].setValue(filteredSelectedULBS);
    console.log("this.filterForm", this.filterForm);
  }

  private updateSelectedState() {
    const filteredSelectedStates = (<ULB[]>(
      this.filterForm.controls["states"].value
    )).filter(
      (state) =>
        !!this.stateList.find(
          (stateToCheck) => stateToCheck.state === state.state
        )
    );

    this.filterForm.controls["states"].setValue(filteredSelectedStates);
  }

  private resetPagination() {
    this.currentPageInView = this.defaultPageView;
  }

  private sliceDataForCurrentView(list: any[]) {
    const from = (this.currentPageInView - 1) * this.ulbItemLimitPerPage;
    const till = from + this.ulbItemLimitPerPage;
    return list.slice(from, till);
  }

  sliceData(from: number, till: number, list: any[]) {
    return list.slice(from, till);
  }

  private createCSVFileHeaders(): ICell[] {
    const ulbNames = this.bondIssuerItemData.map((ulb) => ({
      text: ulb.ulb,
      bold: true,
    }));
    return [{ text: "Issuer", bold: true }, ...ulbNames];
  }

  private createSubHeader() {
    let array: any[] = [];
    Object.keys(this.mainRows).forEach((key) => {
      const config = {
        text: this.formattedNamesMapping[key],
        colorWholeRow: true,
        bold: true,
        backgroundColor: "F8CBAD",
      };

      const subHeaderRow = [config];

      array.push(subHeaderRow);
      const detailRows = this.mainRows[key].map((subRow: any) => {
        const detailColumns = {
          text: this.formattedNamesMapping[subRow],
        };

        const ulbDataCoulmns = this.bondIssuerItemData.map((ulb: any) => ({
          text: ulb[subRow],
        }));
        return [detailColumns, ...ulbDataCoulmns];
      });
      array = array.concat(detailRows);
    });
    return array;
  }

  private createParamsForssuerItem(obj: {
    ulbs: { name: string }[];
    years: { name: string }[];
    states?: { state: string }[];
  }) {
    return {
      ulbs: obj.ulbs ? obj.ulbs.map((ulb) => ulb.name) : [],
      years: obj.years ? obj.years.map((year) => year.name) : [],
      states: obj.states ? obj.states.map((state) => state.state) : [],
    };
  }

  onClickingULBAutoComplete(ulbClicked: any) { }

  private initializeFormListeners() {
    this.filterForm.controls["ulbs"].valueChanges.subscribe((ulbsSelected: any) => {
      if (!ulbsSelected.length) {
        this.yearsAvailable = this.getUniqueYearsFromULBS(
          this.ulbFilteredByName
        )
          .sort((a, b) => (+a > +b ? -1 : 1))
          .map((year) => ({ name: year }));
        return;
      }
      const uniqueYears = this.getUniqueYearsFromULBS(ulbsSelected);
      let yearsSelected = this.filterForm.controls["years"].value;
      if (yearsSelected) {
        yearsSelected = yearsSelected.filter((yearAlreadySelected: any) =>
          uniqueYears.some(
            (yearToCheck) => yearToCheck === yearAlreadySelected.name
          )
        );
        this.filterForm.controls["years"].setValue(yearsSelected);
      }
      this.yearsAvailable = uniqueYears
        .sort((a, b) => (+a > +b ? -1 : 1))
        .map((year) => ({ name: year }));

      console.log("yearsAvailable==>", this.yearsAvailable);
    });
  }

  private getULBHavingYears(
    yearList: { name: string }[],
    ulbList: IULBResponse["data"]
  ) {
    return ulbList.filter(
      (ulb) =>
        ulb.years &&
        yearList.some((yearToFind) =>
          ulb.years.some((ulbYear) => ulbYear === yearToFind.name)
        )
    );
  }

  private getUniqueYearsFromULBS(ulbs: IULBResponse["data"]) {
    const uniqueYears = new Set<string>();
    ulbs.forEach((ulb) => {
      if (!ulb.years) {
        return;
      }
      ulb.years.forEach((year) => uniqueYears.add(year));
    });
    return Array.from(uniqueYears);
  }

  private getULBFitleredBy(ulbName: string) { }

  private initializeForm() {
    this.filterForm = this._formBuilder.group({
      ulbs: [[]],
      years: [[]],
      states: [[]],
    });
  }
}

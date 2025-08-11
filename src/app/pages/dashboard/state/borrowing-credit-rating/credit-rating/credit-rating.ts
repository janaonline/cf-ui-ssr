import { Component, input, signal, SimpleChanges, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CreditScale, ratingGrades } from '../../../../../core/util/creditReportUtil';
import { creditRatingModalHeaders } from '../models/tableHeaders';
import { ULBRatings } from '../models/ratings';
import { CommonService } from '../../../../../core/services/common.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GeographicalService } from '../../../../../core/services/geographical/geographical.service';
import { AssetsService } from '../../../../../core/services/assets/assets.service';
import { FeatureCollection, Geometry } from 'geojson';
import { UserUtility } from '../../../../../core/util/user/user';
import { IMapCreationConfig } from '../../../../../core/util/map/models/mapCreationConfig';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-credit-rating',
  imports: [],
  templateUrl: './credit-rating.html',
  styleUrl: './credit-rating.scss'
})
export class CreditRating {

  readonly stateIdSignal = signal('');
  readonly stateDetails = input.required<any>();
  // readonly stateIdSignal = input.required<any>();

  id: any = 'Gujarat';
  // stateCode = JSON.parse(localStorage.getItem("ulbList")).data;
  StateMapping = JSON.parse(localStorage.getItem("stateIdsMap") || '{}');
  currentState: any;
  finalData: any;
  constructor(
    public commonService: CommonService,
    private assetService: AssetsService,
  ) {
  }

  page = 1;
  originalList: any = [];
  list: any = [];
  selectedIndex: number = 0;

  selectedStates: Array<string> = [];
  absCreditInfo!: {
    creditRatingUlbs: number;
    ratings: { [key: string]: number };
    title: string;
    ulbs: string[];
  };
  ratingGrades = ratingGrades;

  search!: string;
  sortHeader!: string;
  sortType!: boolean; // true = asc, false = desc

  ulbInfoSortHeader!: string;
  ulbInfoSortType!: boolean;

  // modalRef: BsModalRef;
  dialogHeaders = creditRatingModalHeaders[0];
  dialogData: any = [];
  ulbInfo: any;

  creditScale: any = CreditScale;
  noDataFound: boolean = false;

  stateColors = {
    unselected: "#efefef",
    selected: "#059b9a",
  };

  queryParams: any = {};

  ngOnInit() {
    this.currentState = this.StateMapping[this.id];
    this.id = this.stateDetails().state.name;
    this.assetService.fetchCreditRatingReport().subscribe((data: any) => {
      this.list = data;

      console.log("finalData", this.list);
      this.originalList = data;
      this.showCreditInfoByState();

    });

    this.assetService
      .fetchCreditRatingDetailedReport()
      .subscribe((data: any) => {
        // this.detailedList = data;
      });

    // this.ulbSearchFormControl.valueChanges
    //   .pipe(debounceTime(400), distinctUntilChanged())
    //   .subscribe((res) =>
    //     this.searchDropdownItemSelected(this.ulbSearchFormControl, "ulb")
    //   );
  }

  setDefaultAbsCreditInfo() {
    this.absCreditInfo = {
      title: "",
      ulbs: [],
      creditRatingUlbs: 0,
      ratings: {
        "AAA+": 0,
        AAA: 0,
        "AAA-": 0,
        "AA+": 0,
        AA: 0,
        "AA-": 0,
        "A+": 0,
        A: 0,
        "A-": 0,
        "BBB+": 0,
        BBB: 0,
        "BBB-": 0,
        BB: 0,
        "BB+": 0,
        "BB-": 0,
        "B+": 0,
        B: 0,
        "B-": 0,
        "C+": 0,
        C: 0,
        "C-": 0,
        "D+": 0,
        D: 0,
        "D-": 0,
      },
    };
  }

  calculateRatings(dataObject: any, ratingValue: any) {
    if (!dataObject["ratings"][ratingValue]) {
      dataObject["ratings"][ratingValue] = 0;
    }
    dataObject["ratings"][ratingValue] = dataObject["ratings"][ratingValue] + 1;

    // creditRatingUlbs is total summation of rating for the selected state.
    dataObject["creditRatingUlbs"] = dataObject["creditRatingUlbs"] + 1;
  }


  showCreditInfoByState(stateName = "") {
    console.log("creditInfo", stateName);
    this.selectedStates[0] = stateName;
    this.setDefaultAbsCreditInfo();
    const ulbList = [];
    if (stateName) {
      for (let i = 0; i < this.list.length; i++) {
        const ulb = this.list[i];
        if (ulb.state.toLowerCase() == stateName.toLowerCase()) {
          ulbList.push(ulb["ulb"]);
          const rating = ulb.creditrating.trim();
          if (this.canAddRating(rating)) {
            this.calculateRatings(this.absCreditInfo, rating);
          }
        }
      }
    } else {
      for (let i = 0; i < this.list.length; i++) {
        const ulb = this.list[i];
        // if (this.list[i].state == this.StateMapping[this.id]) {
        if (this.list[i].state == this.id) {
          ulbList.push(ulb["ulb"]);
          const rating = ulb.creditrating.trim();
          if (this.canAddRating(rating)) {
            this.calculateRatings(this.absCreditInfo, rating);
          }
        }
      }
    }
    this.absCreditInfo["title"] = stateName || "India";
    this.absCreditInfo["ulbs"] = ulbList;

    console.log("this.abscreditInfo", this.absCreditInfo);
    let newObject = Object.values(this.absCreditInfo.ratings);
    console.log("newObje", newObject);
    if (newObject.every((elem) => elem === 0)) {
      this.noDataFound = true;
    }

    // this.finalData = this.list.filter((elem) => {
    //   if (elem.state == this.StateMapping[this.id]) {
    //     console.log("finaliseData==>", elem);
    //     return elem;
    //   }
    // });
  }

  private canAddRating(ratingToEvaluate: string) {
    if (!this.queryParams || !this.queryParams.minRating) return true;
    const minBound = 0;
    const upperBound = ULBRatings.findIndex(
      (rating) => rating === this.queryParams.minRating
    );

    // If the upper bound is invalid, then allow all the ratings.
    if (upperBound < 0) return true;

    const indexFound = ULBRatings.findIndex(
      (rating) => rating === ratingToEvaluate
    );

    if (minBound <= indexFound && indexFound <= upperBound) return true;

    // If the given rating is not found in our application, then dont allow it.
    return false;
  }


  sortBy(header: any) {
    if (!this.sortType) {
      this.list = this.sortAsc(this.list, header);
      this.sortType = true;
    } else {
      this.list = this.sortDesc(this.list, header);
      this.sortType = false;
    }
    this.sortHeader = header;
  }

  sortByUlbInfo(header: any) {
    const arr = JSON.parse(JSON.stringify(this.ulbInfo));
    this.ulbInfo = [];
    setTimeout(() => {
      if (!this.ulbInfoSortType) {
        this.ulbInfo = this.sortAsc(arr, header);
        this.ulbInfoSortType = true;
      } else {
        this.ulbInfo = this.sortDesc(arr, header);
        this.ulbInfoSortType = false;
      }
    }, 0);

    this.ulbInfoSortHeader = header;
  }

  filterRecords() {
    if (!this.search) {
      this.list = this.originalList;
    } else {
      this.list = this.originalList.filter((item: any) => {
        return item.ulb.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    }
  }

  sortAsc(list: any, header: any) {
    return list.sort(function (a: any, b: any) {
      // if(header == 'date'){
      //   var d1 = new Date(a[header]);
      //   var d2 = new Date(b[header]);
      //   const c = d1 - d2;
      //   return c;
      // }
      if (header == "amount") {
        return parseInt(a[header]) - parseInt(b[header]);
      }
      if (a[header].toLowerCase() < b[header].toLowerCase()) {
        // sort string ascending
        return -1;
      }
      if (a[header].toLowerCase() > b[header].toLowerCase()) {
        return 1;
      }
      return 0;
    });
  }

  sortDesc(list: any, header: any) {
    return list.sort(function (a: any, b: any) {
      if (header == "amount") {
        return parseInt(b[header]) - parseInt(a[header]);
      }
      if (a[header].toLowerCase() < b[header].toLowerCase()) {
        // sort string ascending
        return 1;
      }
      if (a[header].toLowerCase() > b[header].toLowerCase()) {
        return -1;
      }
      return 0;
    });
  }

  addRatingDesc(ulbInfo: any) {
    const ratingKey =
      ulbInfo.agency +
      "_" +
      ulbInfo.creditRating.replace("+", "").replace("-", "");
    if (!this.creditScale[ratingKey]) {
      ulbInfo["ratingDesc"] =
        "We are gathering credit rating scale data from the agency. Information will be available shortly.";
    } else {
      ulbInfo["ratingDesc"] = this.creditScale[ratingKey].description;
    }

    return ulbInfo;
  }

  openModal(grade: any, i: any) {
    // debugger;
    console.log(
      "this.list==>",
      this.list,
      // this.StateMapping[this.id],
      this.selectedStates
    );
    this.dialogData = this.list.filter((elem: any) => {
      if (
        elem.state == this.StateMapping[this.id] &&
        elem.creditrating === grade
      ) {
        return elem;
      }
    });
    console.log("dialogData", this.dialogData);
    // .filter(
    //   (ulb) =>
    //     (this.selectedStates[0].length
    //       ? this.selectedStates[0]
    //           .toLowerCase()
    //           .includes(ulb.state.toLowerCase())
    //       : true) && ulb.creditrating === grade
    // )

    this.selectedIndex = i;

    // this.modalService.show(ModalRef, { class: " modal-center" });
  }
}

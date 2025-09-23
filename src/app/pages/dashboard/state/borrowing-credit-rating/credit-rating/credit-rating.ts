import { ChangeDetectorRef, Component, input } from '@angular/core';
import { AssetsService } from '../../../../../core/services/assets/assets.service';
import { CreditScale, ratingGrades } from '../../../../../core/util/creditReportUtil';
import { ULBRatings } from '../models/ratings';

@Component({
  selector: 'app-credit-rating',
  imports: [],
  templateUrl: './credit-rating.html',
  styleUrl: './credit-rating.scss'
})
export class CreditRating {

  readonly stateDetails = input.required<any>();

  stateName: any;
  constructor(
    private assetService: AssetsService,
    private cdr: ChangeDetectorRef
  ) {
  }

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
  dialogData: any = [];

  creditScale: any = CreditScale;
  noDataFound: boolean = false;

  queryParams: any = {};

  ngOnInit() {
    this.stateName = this.stateDetails().state.name;
    this.assetService.fetchCreditRatingReport().subscribe((data: any) => {
      this.list = data;
      this.showCreditInfoByState();
      this.cdr.detectChanges();
    });


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

    for (let i = 0; i < this.list.length; i++) {
      const ulb = this.list[i];
      if (this.list[i].state == this.stateDetails().state.name) {
        ulbList.push(ulb["ulb"]);
        const rating = ulb.creditrating.trim();
        if (this.canAddRating(rating)) {
          this.calculateRatings(this.absCreditInfo, rating);
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


  openModal(grade: any, i: number = 0) {
    // debugger;
    console.log(
      "this.list==>",
      this.list,
      this.selectedStates
    );
    this.dialogData = this.list.filter((elem: any) => {
      if (
        elem.state == this.stateName &&
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

import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../../core/services/common.service';
import { error } from 'console';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  scatterChartPayload: any;
  multiChart!: boolean;
  _loaderService: any;
  stateServiceLabel: any;
  stateId: any;
  financialYear: any;
  headOfAccount: any;
  filterName: any;
  isPerCapita: any;
  compType: any;
  selectedRadioBtnValue: any;
  ulbId: any;
  ulbArr: any;
  multipleChartTitle: any;
  mainChartTitle: any;
  // stateFilterDataService: any;
  notfound!: boolean;
  percentLabel!: string;
  stateAvgVal: any;
  scatterData: any;
  chartDropdownList: any;
  ActiveButton!: string;
  thousand: number = 1000;
  defaultMaxPopulation: number = 1200;
  chartId = `stateSCharts-${Math.random()}`;
  compareCategory: string = '';
  defaultAvgObj: { x: number; y: number; }[] = [];

  constructor(private http: HttpClient, private _commonServices: CommonService) {

  }
  initializeScatterData() {
    this.scatterData = [
      {
        labels: [],
        rev: [],
        label: "Municipality",
        data: [
          // { x: 10, y: 20 },
          // { x: 20, y: 100 },
          // { x: 35, y: 110 },
        ],
        showLine: false,
        fill: true,
        borderColor: "#1EBFC6",
        backgroundColor: "#1EBFC6",
      },
      {
        labels: [],
        rev: [],
        label: "Municipal Corporation",
        data: [],
        showLine: false,
        fill: true,
        borderColor: "#3E5DB1",
        backgroundColor: "#3E5DB1",
      },
      {
        label: "Town Panchayat",
        labels: [],
        rev: [],
        data: [],
        showLine: false,
        fill: true,
        borderColor: "#F5B742",
        backgroundColor: "#F5B742",
      },
      // {
      //   label: "State Average",
      //   data: [],
      //   rev: [],
      //   labels: ["State Average"],
      //   showLine: true,
      //   fill: false,
      //   backgroundColor: "red",
      //   borderColor: "red",
      // },
    ];
  }

  toCroreBtns = ['Total Revenue', 'Total Own Revenue', 'Capital Expenditure', 'Total Surplus/Deficit'];
  convertToCr(value: number) {
    if (!this.compareCategory && this.toCroreBtns.includes(this.ActiveButton)) {
      if (value == 0) return 0;
      value /= 10000000;
    }
    return Math.round(value);
  }
  setXYData(data: any, chartData: any) {
    // let obj = { x: 0, y: 0 };
    data.forEach((el2: any) => {
      let obj = { x: 0, y: 0 };
      obj.x = Math.round(+(el2.population) / this.thousand);
      // obj.y = this.stateServiceLabel
      //   ? Math.round(el2.value)
      //   : // ? el2.value.toFixed(2)
      //   this.ActiveButton == 'Total Revenue' || this.ActiveButton == 'Total Own Revenue' || this.ActiveButton == 'Total Surplus/Deficit' || this.ActiveButton == 'Capital Expenditure' ? this.convertToCr(el2.amount) : el2.amount;
      if (!this.stateServiceLabel) {
        // obj.y = ['Total Revenue', 'Total Own Revenue', 'Capital Expenditure', 'Total Surplus/Deficit'].includes(this.ActiveButton) ? this.convertToCr(el2.amount) : el2.amount;
        obj.y = this.convertToCr(el2.amount);
      } else {
        obj.y = Math.round(el2.value);
      }
      chartData["labels"].push(el2.ulbName);
      chartData["rev"].push(
        this.stateServiceLabel ? Math.round(el2.value) : el2.amount
      );
      chartData.data.push(obj);
      // console.log('sasasasasaasa', el)
      // obj = { x: 0, y: 0 };
    });

  }


  setScatterData(apiData: any, ActiveButton: string, stateServiceLabel = false, compareCategory = '') {
    this.compareCategory = compareCategory;
    this.ActiveButton = ActiveButton;
    this.stateServiceLabel = stateServiceLabel;
    // console.log('this.ActiveButton', this.ActiveButton);
    this.initializeScatterData();
    let m_data, mCorporation, tp_data, stateData;
    if (this.stateServiceLabel) {
      // if (apiData && apiData["scatterData"]) {      }
      m_data = apiData["scatterData"]["m_data"];
      mCorporation = apiData["scatterData"]["mc_data"];
      tp_data = apiData["scatterData"]["tp_data"];
      // stateData = res['data'] && res['data']['scatterData'] && res['data']['scatterData']["stateAvg"][0]["average"];
      stateData = apiData["scatterData"]["stateAvg"] &&
        apiData["scatterData"]["stateAvg"][0] &&
        apiData["scatterData"]["stateAvg"][0]["average"];
    } else {
      mCorporation = apiData["mCorporation"];
      tp_data = apiData["townPanchayat"];
      m_data = apiData["municipality"];
      this.stateAvgVal = apiData["stateAvg"] ? apiData["stateAvg"] : this.stateAvgVal;
      // let stateData = this.ActiveButton == 'Total Revenue' || this.ActiveButton == 'Total Own Revenue' || this.ActiveButton == 'Total Surplus/Deficit' || this.ActiveButton == 'Capital Expenditure' ? this.convertToCr(this.stateAvgVal) : this.stateAvgVal;
      stateData = this.convertToCr(this.stateAvgVal);
    }


    let stateLevelMaxPopuCount = this.getMaximumPopulationCount(mCorporation, tp_data, m_data);
    this.defaultAvgObj = [
      { x: 0, y: 0 },
      { x: stateLevelMaxPopuCount ? stateLevelMaxPopuCount : this.defaultMaxPopulation, y: 0 },
    ];
    if (this.compareCategory) {
      this.setCompareCategoryData(apiData);
      // return this.scatterData;
    }


    const scatterData = this.setGraphData(stateData, 'State Average', 'red');
    this.scatterData.push(scatterData);

    this.scatterData.forEach((el: any) => {
      if (el.label == "Town Panchayat") {
        this.setXYData(tp_data, el);
      } else if (el.label == "Municipal Corporation") {
        this.setXYData(mCorporation, el);
      } else if (el.label == "Municipality") {
        this.setXYData(m_data, el);
      } else if (el.label == "National Average") {
        // el["data"]["y"] = natData;
      } else if (el.label == "State Average") {
        // this.getAvgData(el, stateData);
        // const scatterData = this.setGraphData(stateData, 'State Average', 'red');
        // this.scatterData.push(scatterData);
      }
    });

    console.log("scatterData-----", this.scatterData);
    return this.scatterData;
  }

  setCompareCategoryData(apiData: any) {
    if (this.compareCategory == 'populationAvg') {
      const scatterData1 = this.setGraphData(apiData['< 100 Thousand'], '< 100 Thousand', '#11BC46');
      this.scatterData.push(scatterData1);
      const scatterData2 = this.setGraphData(apiData['100 Thousand - 500 Thousand'], '100 Thousand - 500 Thousand', '#FF608B');
      this.scatterData.push(scatterData2);
      const scatterData3 = this.setGraphData(apiData['500 Thousand - 1 Million'], '500 Thousand - 1 Million', '#E57504');
      this.scatterData.push(scatterData3);
      const scatterData4 = this.setGraphData(apiData['4 Million+'], '4 Million+', '#585FFF');
      this.scatterData.push(scatterData4);
      const scatterData5 = this.setGraphData(apiData['1 Million - 4 Million'], '1 Million - 4 Million', '#32CCFA');
      this.scatterData.push(scatterData5);
    } else if (this.compareCategory == 'ulbTypeAvg') {
      const scatterDataMC = this.setGraphData(apiData['Municipal Corporation'], 'Municipal Corporation', '#11BC46');
      this.scatterData.push(scatterDataMC);
      const scatterDataM = this.setGraphData(apiData['Municipality'], 'Municipality', '#FF608B');
      this.scatterData.push(scatterDataM);
      const scatterDataTP = this.setGraphData(apiData['Town Panchayat'], 'Town Panchayat', '#E57504');
      this.scatterData.push(scatterDataTP);
    } else if (this.compareCategory == 'nationalAvg') {
      const scatterData = this.setGraphData(apiData['national'], 'National Average', 'green');
      this.scatterData.push(scatterData);
    }
  }

  setGraphData(value: any, label: string, color: string = 'green') {
    const data = {
      label,
      data: JSON.parse(JSON.stringify(this.getAvgData(value))),
      rev: [],
      labels: [label],
      showLine: true,
      // fill: false,
      backgroundColor: color,
      borderColor: color,
    };
    return data;
  }

  getAvgData(avgData: any) {
    const arr: any[] = [];
    this.defaultAvgObj.forEach((el2: any) => {
      el2["y"] = avgData;
      arr.push(el2);
    });
    return arr;
  }

  getScatterData_tobe_removed() {
    // this.createDynamicChartTitle(this.currentActiveTab);
    this.multiChart = false;
    this._loaderService.showLoader();
    this.initializeScatterData();
    let apiEndPoint = this.stateServiceLabel ? "state-slb" : "state-revenue";
    this.scatterChartPayload = {
      [this.stateServiceLabel ? "stateId" : "state"]: this.stateId,
      financialYear: this.financialYear ? this.financialYear : "",
      headOfAccount: this.stateServiceLabel ? undefined : this.headOfAccount,
      filterName: this.filterName ? this.filterName : "",
      isPerCapita: this.isPerCapita ? this.isPerCapita : "",
      compareType: this.compType ? this.compType : "",
      compareCategory: this.selectedRadioBtnValue
        ? this.selectedRadioBtnValue
        : "",
      ulb: this.ulbId ? [this.ulbId] : this.ulbArr ? this.ulbArr : "",
      chartType: !this.filterName?.includes("mix") ? "scatter" : "doughnut",
      apiEndPoint: apiEndPoint,
      apiMethod: "post",
      stateServiceLabel: this.stateServiceLabel,
      sortBy: "",
      // "which": this.selectedRadioBtnValue ? this.selectedRadioBtnValue : '',
      chartTitle: this.compType ? this.multipleChartTitle : this.mainChartTitle ? this.mainChartTitle : "",
    };

    console.log("scatterChartPayload", this.scatterChartPayload);
    let inputVal: any = {};
    inputVal.stateIds = this.stateId;
    this.getScatterdData(this.scatterChartPayload, apiEndPoint)
      .subscribe({
        next: (res: any) => {
          this.notfound = false;
          console.log("response data", res);
          console.log("activeButtonStateDashboard", this.ActiveButton);
          //scatter plots center
          let apiData = res["data"];
          if (!this.filterName.includes("mix")) {
            this._loaderService.stopLoader();
            let mCorporation: any;
            let tp_data: any;
            let m_data: any;
            let stateData: any;
            let yAxesLabelName = '';
            this.percentLabel = '';
            if (this.stateServiceLabel) {
              if (res["data"]["scatterData"]?.unitType == "Percent") {
                this.percentLabel = 'percent';
                yAxesLabelName = `${this.filterName} (%)`;
              } else {
                yAxesLabelName = res["data"]["scatterData"]?.unitType ? res["data"]["scatterData"]?.unitType : this.filterName;
              }
              let cLabel = 'Population(in Thousands)'
              // this.setServiceLevelBenchmarkScatteredChartOption(
              //   cLabel,
              //   yAxesLabelName
              // );
              m_data =
                res["data"] &&
                res["data"]["scatterData"] &&
                res["data"]["scatterData"]["m_data"];
              mCorporation =
                res["data"] &&
                res["data"]["scatterData"] &&
                res["data"]["scatterData"]["mc_data"];
              tp_data =
                res["data"] &&
                res["data"]["scatterData"] &&
                res["data"]["scatterData"]["tp_data"];
              // stateData = res['data'] && res['data']['scatterData'] && res['data']['scatterData']["stateAvg"][0]["average"];
              stateData =
                res["data"] &&
                res["data"]["scatterData"] &&
                res["data"]["scatterData"]["stateAvg"] &&
                res["data"]["scatterData"]["stateAvg"][0] &&
                res["data"]["scatterData"]["stateAvg"][0]["average"];
              // let natData = res["natAvg"][0]["average"];
            } else {
              mCorporation = apiData["mCorporation"];
              tp_data = apiData["townPanchayat"];
              m_data = apiData["municipality"];
              // let natData = apiData["natAvg"][0]["average"];
              this.stateAvgVal = apiData["stateAvg"]
                ? apiData["stateAvg"]
                : this.stateAvgVal;
              stateData = this.ActiveButton == 'Total Revenue' || this.ActiveButton == 'Total Own Revenue' || this.ActiveButton == 'Total Surplus/Deficit' || this.ActiveButton == 'Capital Expenditure' ? this.convertToCr(this.stateAvgVal) : this.stateAvgVal;
            }

            let stateLevelMaxPopuCount = this.getMaximumPopulationCount(mCorporation, tp_data, m_data);
            // let   stateLevelMaxPopuCount = 30;
            // console.log("stateLevelMaxPopuCount", stateLevelMaxPopuCount);
            this.scatterData.data.datasets.forEach((el: any) => {
              let obj = { x: 0, y: 0 };
              if (el.label == "Town Panchayat") {
                obj = { x: 0, y: 0 };
                tp_data.forEach((el2: any) => {
                  obj.x = +(el2.population) / this.thousand;
                  obj.y = this.stateServiceLabel
                    ? Math.round(el2.value)
                    : // ? el2.value.toFixed(2)
                    this.ActiveButton == 'Total Revenue' || this.ActiveButton == 'Total Own Revenue' || this.ActiveButton == 'Total Surplus/Deficit' || this.ActiveButton == 'Capital Expenditure' ? this.convertToCr(el2.amount) : el2.amount;
                  el["labels"].push(el2.ulbName);
                  el["rev"].push(
                    this.stateServiceLabel ? Math.round(el2.value) : el2.amount
                  );
                  el.data.push(obj);
                  // console.log('sasasasasaasa', el)
                  obj = { x: 0, y: 0 };
                });
              } else if (el.label == "Municipal Corporation") {
                mCorporation.forEach((el2: any) => {
                  obj.x = +(el2.population) / this.thousand;
                  obj.y = this.stateServiceLabel
                    ? Math.round(el2.value)
                    : // ? el2.value.toFixed(2)
                    this.ActiveButton == 'Total Revenue' || this.ActiveButton == 'Total Own Revenue' || this.ActiveButton == 'Total Surplus/Deficit' || this.ActiveButton == 'Capital Expenditure' ? this.convertToCr(el2.amount) : el2.amount;
                  el["labels"].push(el2.ulbName);
                  el["rev"].push(
                    this.stateServiceLabel ? Math.round(el2.value) : el2.amount
                  );
                  el.data.push(obj);

                  obj = { x: 0, y: 0 };
                });
              } else if (el.label == "Municipality") {
                m_data.forEach((el2: any) => {
                  obj = { x: 0, y: 0 };
                  obj.x = +(el2.population) / this.thousand;
                  obj.y = this.stateServiceLabel
                    ? Math.round(el2.value)
                    : // ? el2.value.toFixed(2)
                    this.ActiveButton == 'Total Revenue' || this.ActiveButton == 'Total Own Revenue' || this.ActiveButton == 'Total Surplus/Deficit' || this.ActiveButton == 'Capital Expenditure' ? this.convertToCr(el2.amount) : el2.amount;
                  el["labels"].push(el2.ulbName);
                  el["rev"].push(
                    this.stateServiceLabel ? Math.round(el2.value) : el2.amount
                  );
                  el.data.push(obj);
                  obj = { x: 0, y: 0 };
                });
              } else if (el.label == "National Average") {
                // el["data"]["y"] = natData;
              } else if (el.label == "State Average") {
                let obje = [
                  { x: 0, y: 0 },
                  {
                    x: stateLevelMaxPopuCount
                      ? stateLevelMaxPopuCount
                      : this.defaultMaxPopulation,
                    y: 0,
                  },
                ];
                obje.forEach((el2) => {
                  el2["y"] = stateData;
                  // el2['y'] = 70 // for testing

                  el["data"].push(el2);
                });
              }
            });
            console.log("scatterData", this.scatterData);
            // this.generateRandomId("scatterChartId123");
            this.scatterData = { ...this.scatterData };
          }
        },
        error:
          (err: any) => {
            this._loaderService.stopLoader();
            this.notfound = true;
            console.log(err.message);
          }
      }
      );
  }
  getScatterdData(payload: any, apiEndPoint: string) {
    // return this.http.post(environment.api.url + "/state-revenue", payload);
    return this.http.post(environment.api.url + `${apiEndPoint}`, payload);
  }
  serviceLevelBenchmarkScatterOption: any;
  // setServiceLevelBenchmarkScatteredChartOption(
  //   xAxisLabel: string = "Population(in Thousands)",
  //   yAxisLabel: string = "Total Revenue (in Cr.)"
  // ) {
  //   let tooltipValue = "";
  //   if (this.percentLabel == "percent") {
  //     tooltipValue = "%";
  //   }
  //   let scatterOption = {
  //     legend: {
  //       itemStyle: {
  //         cursor: "default",
  //       },
  //       labels: {
  //         padding: 20,
  //         color: "#000000",
  //         usePointStyle: true,
  //         pointStyle: "circle",
  //       },
  //       position: "bottom",
  //       onHover: function (event: any) {
  //         event.target.style.cursor = "pointer";
  //       },
  //       onClick: (e: any, legendItem: any) => {
  //         var index = legendItem.datasetIndex;
  //         var ci = this.chart;
  //         var alreadyHidden =
  //           ci.getDatasetMeta(index).hidden === null
  //             ? false
  //             : ci.getDatasetMeta(index).hidden;

  //         ci.data.datasets.forEach(function (e: any, i: any) {
  //           var meta = ci.getDatasetMeta(i);

  //           if (i !== index) {
  //             if (!alreadyHidden) {
  //               meta.hidden = meta.hidden === null ? !meta.hidden : null;
  //             } else if (meta.hidden === null) {
  //               meta.hidden = true;
  //             }
  //           } else if (i === index) {
  //             meta.hidden = null;
  //           }
  //         });

  //         ci.update();
  //       },
  //     },
  //     elements: {
  //       point: {
  //         radius: 7,
  //       },
  //     },
  //     scales: {
  //       xAxes: [
  //         {
  //           scaleLabel: {
  //             display: true,
  //             labelString: this._commonServices.toTitleCase(xAxisLabel),
  //             fontStyle: "bold",
  //           },

  //           offset: true,
  //         },
  //       ],
  //       yAxes: [
  //         {
  //           scaleLabel: {
  //             display: true,
  //             labelString: `${this._commonServices.toTitleCase(yAxisLabel)}`,
  //             fontStyle: "bold",
  //           },
  //           gridLines: {
  //             offsetGridLines: true,
  //             display: false,
  //           },

  //           offset: true,
  //         },
  //       ],
  //     },
  //     tooltips: {
  //       callbacks: {
  //         label: function (tooltipItem: any, data: any) {
  //           console.log("tooltipItem", tooltipItem, tooltipValue);
  //           console.log("data.datasets", data);
  //           var datasetLabel =
  //             data.datasets[tooltipItem.datasetIndex].label || "Other";
  //           var label =
  //             data.datasets[tooltipItem.datasetIndex]["labels"][
  //             tooltipItem.index
  //             ];
  //           console.log("tooltipItem", data.datasets[tooltipItem.datasetIndex]);
  //           var rev =
  //             data.datasets[tooltipItem.datasetIndex]["rev"][tooltipItem.index];

  //           // return datasetLabel + ": " + label + " " + `(${rev} %)`;
  //           return `${datasetLabel}: ${label && datasetLabel != label ? label : ""
  //             } ${tooltipItem?.yLabel
  //               ? `(${tooltipItem?.yLabel} ${tooltipValue})`
  //               : `(${tooltipItem?.yLabel})`
  //             }`;
  //         },
  //       },
  //     },
  //     legendCallback: (chart: any) => {
  //       var text = [];
  //       text.push('<ul class="' + this.chartId + '-legend">');
  //       for (var i = 0; i < chart.data.datasets.length; i++) {
  //         text.push(
  //           '<li><div class="legendValue"><span style="background-color:' +
  //           chart.data.datasets[i].backgroundColor +
  //           '">&nbsp;&nbsp;&nbsp;&nbsp;</span>'
  //         );

  //         if (chart.data.datasets[i].label) {
  //           text.push(
  //             '<span class="label">' + chart.data.datasets[i].label + "</span>"
  //           );
  //         }

  //         text.push('</div></li><div class="clear"></div>');
  //       }

  //       text.push("</ul>");

  //       return text.join("");
  //     },
  //   };

  //   this.serviceLevelBenchmarkScatterOption = Object.assign(scatterOption);
  // }

  /**
   * It takes in three arrays of objects, each with a property called population, and returns the maximum
   * value of the population property across all three arrays.
   * @param {any} mCorporation - [{population: 100}, {population: 200}]
   * @param {any} townPanchayat - [{
   * @param {any} municipality - [{
   * @returns getMaximumPopulationCount(mCorporation: any, townPanchayat: any, municipality: any ) {
   *     let populationCountList = [];
   *     populationCountList = mCorporation.map(popCount => popCount.population)
   *     populationCountList = [...populationCountList, ...townPanchayat
   */
  getMaximumPopulationCount(
    mCorporation: any,
    townPanchayat: any,
    municipality: any
  ) {
    let populationCountList = [];

    populationCountList = mCorporation.map((popCount: any) => popCount.population);
    populationCountList = [
      ...populationCountList,
      ...townPanchayat.map((popCount: any) => popCount.population),
    ];
    populationCountList = [
      ...populationCountList,
      ...municipality.map((popCount: any) => popCount.population),
    ];

    let maxPopulationCount = Math.max(...populationCountList);
    return Math.round(maxPopulationCount / this.thousand);
  }
}

function convertToCr1(value: number) {
  if (value == 0) return 0;
  value /= 10000000;
  return Math.round(value);
}
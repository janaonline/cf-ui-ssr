import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CommonService } from '../../../../core/services/common.service';

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
  activeButton!: string;
  thousand: number = 1000;
  defaultMaxPopulation: number = 1200;
  chartId = `stateSCharts-${Math.random()}`;
  compareCategory: string = '';
  defaultAvgObj: { x: number; y: number; }[] = [];

  toCroreBtns = ['Total Revenue', 'Total Own Revenue', 'Capital Expenditure', 'Total Surplus/Deficit'];
  isPercentage: boolean = false;

  constructor(private http: HttpClient, private _commonServices: CommonService) {

  }

  setScatterOptions() {
    const options: any = {
      plugins: {
        datalabels: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => {
              // console.log("tooltipItem", tooltipItem);
              const dataset = tooltipItem.dataset;
              const datasetLabel = dataset.label || 'Other';

              // Access your custom labels array if you attached it
              const customLabels = (dataset as any).labels || [];
              const label = customLabels[tooltipItem.dataIndex];

              const valueY = tooltipItem.parsed.y;

              let valueFormatted = '';
              let displayVlaue = Math.round(valueY).toLocaleString();
              if (this.isPercentage) {
                valueFormatted = `(${displayVlaue} %)`;
              } else if (this.isCrore()) {
                valueFormatted = `(${displayVlaue} Cr)`;
              } else {
                // Format Y value (Cr if > 1Cr, else just number)
                valueFormatted = valueY > 10000000 ? `(${Math.round(valueY / 10000000).toLocaleString()} Cr)` : `(${displayVlaue})`;
              }
              // return valueY;
              return `${datasetLabel}: ${label && datasetLabel !== label ? label : ''} ${valueFormatted}`;
            },
          },
        },
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
          }
          // display: false
        }
      },
      elements: {
        point: {
          radius: 7,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Population(in Thousands)',
            font: { size: 14, weight: 'bold' },
            color: '#333',
          },
        },
        y: {
          title: {
            display: true,
            text: this.isCrore() ? 'Total Revenue (In Cr.)' : 'Total Revenue',
            font: { size: 14, weight: 'bold' },
            color: '#333',
          },
        },
      },

      // tooltips1: {
      //   callbacks: {
      //     label: (tooltipItem: any, data: any) => {
      //       console.log("tooltipItem", tooltipItem, data);
      //       var datasetLabel =
      //         data.datasets[tooltipItem.datasetIndex].label || "Other";
      //       var label =
      //         data.datasets[tooltipItem.datasetIndex]["labels"][
      //         tooltipItem.index
      //         ];
      //       return `${datasetLabel}: ${label && datasetLabel != label ? label : ""
      //         } ${tooltipItem?.yLabel
      //           ? tooltipItem?.yLabel > 10000000
      //             ? `(${Math.round(tooltipItem?.yLabel / 10000000)} Cr)`
      //             : `(${Math.round(tooltipItem?.yLabel)})`
      //           : ""
      //         }`;
      //     },
      //   },
      // },
    };
    return options;

  }
  initializeScatterData() {
    this.scatterData = [
      {
        labels: [],
        rev: [],
        label: "Municipality",
        data: [],
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

  setScatterConfig(data: any, activeButton: string, stateServiceLabel = false, compareCategory = '') {
    console.log('setScatterConfig data----', data, 'stateServiceLabel----', stateServiceLabel);
    this.compareCategory = compareCategory;
    this.activeButton = activeButton;
    this.stateServiceLabel = stateServiceLabel;
    this.initializeScatterData();
    let datasets = this.scatterData;
    if (data) {
      datasets = this.setScatterData(data, this.activeButton, this.stateServiceLabel, this.compareCategory);
    }
    const options = this.setScatterOptions();
    this.isPercentage = false;
    if (this.stateServiceLabel && data && data['scatterData']) {
      options.scales.y.title.text = this.stateServiceLabel;
      if (data['scatterData'].unitType) {
        if (data['scatterData'].unitType == 'Percent') {
          this.isPercentage = true;
          options.scales.y.title.text = this._commonServices.toTitleCase(`${this.stateServiceLabel} (%)`);
        } else {
          options.scales.y.title.text = this._commonServices.toTitleCase(data['scatterData'].unitType);
        }
      }
      // options.scales.y.title.text = yTitle;

    }
    // const scatterData = this.setScatterData(data, this.subButton(), this.stateServiceLabel, this.compareCategory);
    const ChartConfig = {
      chartId: this.chartId,
      chartType: 'scatterChart',
      datasets,
      options,
      // options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Population(in Thousands)', 'Total Revenue (in Cr.)')
    }
    return ChartConfig;
  }

  isCrore() {
    return this.toCroreBtns.includes(this.activeButton);
  }

  convertToCr(value: number) {
    // if (!this.stateServiceLabel && !this.compareCategory && this.toCroreBtns.includes(this.activeButton)) {
    if (!this.stateServiceLabel && this.isCrore()) {
      if (value == 0) return 0;
      value /= 10000000; // divide by 1 crore
    }
    return Math.round(value);
  }

  setXYData(data: any, chartData: any) {
    // let obj = { x: 0, y: 0 };
    data.forEach((el2: any) => {
      let obj = { x: 0, y: 0 };
      obj.x = el2.population ? Math.round(+(el2.population) / this.thousand) : 0;
      // obj.y = this.stateServiceLabel
      //   ? Math.round(el2.value)
      //   : // ? el2.value.toFixed(2)
      //   this.activeButton == 'Total Revenue' || this.activeButton == 'Total Own Revenue' || this.activeButton == 'Total Surplus/Deficit' || this.activeButton == 'Capital Expenditure' ? this.convertToCr(el2.amount) : el2.amount;
      if (!this.stateServiceLabel) {
        // obj.y = ['Total Revenue', 'Total Own Revenue', 'Capital Expenditure', 'Total Surplus/Deficit'].includes(this.activeButton) ? this.convertToCr(el2.amount) : el2.amount;
        obj.y = this.convertToCr(el2.amount);
      } else {
        obj.y = Math.round(el2.value);
      }
      chartData["labels"].push(el2.ulbName);
      chartData["rev"].push(
        this.stateServiceLabel ? Math.round(el2.value) : el2.amount
      );
      chartData.data.push(obj);
      // console.log('sasasasasaasa', obj)
      // obj = { x: 0, y: 0 };
    });

  }


  setScatterData(apiData: any, activeButton: string, stateServiceLabel = false, compareCategory = '') {
    this.compareCategory = compareCategory;
    this.activeButton = activeButton;
    this.stateServiceLabel = stateServiceLabel;
    // console.log('this.activeButton', this.activeButton);
    // this.initializeScatterData();
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
      // let stateData = this.activeButton == 'Total Revenue' || this.activeButton == 'Total Own Revenue' || this.activeButton == 'Total Surplus/Deficit' || this.activeButton == 'Capital Expenditure' ? this.convertToCr(this.stateAvgVal) : this.stateAvgVal;
      // stateData = this.convertToCr(this.stateAvgVal);
      stateData = this.stateAvgVal;
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

    // console.log("scatterData-----", this.scatterData);
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
      const scatterDataMC = this.setGraphData(apiData['Municipal Corporation'], 'Municipal Corporation Average', '#11BC46');
      this.scatterData.push(scatterDataMC);
      const scatterDataM = this.setGraphData(apiData['Municipality'], 'Municipality Average', '#FF608B');
      this.scatterData.push(scatterDataM);
      const scatterDataTP = this.setGraphData(apiData['Town Panchayat'], 'Town Panchayat Average', '#E57504');
      this.scatterData.push(scatterDataTP);
    } else if (this.compareCategory == 'nationalAvg') {
      const scatterData = this.setGraphData(apiData['national'], 'National Average', 'green');
      this.scatterData.push(scatterData);
    }
  }

  setGraphData(value: any, label: string, color: string = 'green') {
    value = this.convertToCr(value);
    const data = {
      label,
      data: JSON.parse(JSON.stringify(this.getAvgData(value))),
      rev: [],
      labels: [label],
      showLine: true,
      // fill: false,
      backgroundColor: color,
      borderColor: color,
      pointRadius: 7,
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
    // this.initializeScatterData();
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
          console.log("activeButtonStateDashboard", this.activeButton);
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
              stateData = this.activeButton == 'Total Revenue' || this.activeButton == 'Total Own Revenue' || this.activeButton == 'Total Surplus/Deficit' || this.activeButton == 'Capital Expenditure' ? this.convertToCr(this.stateAvgVal) : this.stateAvgVal;
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
                    this.activeButton == 'Total Revenue' || this.activeButton == 'Total Own Revenue' || this.activeButton == 'Total Surplus/Deficit' || this.activeButton == 'Capital Expenditure' ? this.convertToCr(el2.amount) : el2.amount;
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
                    this.activeButton == 'Total Revenue' || this.activeButton == 'Total Own Revenue' || this.activeButton == 'Total Surplus/Deficit' || this.activeButton == 'Capital Expenditure' ? this.convertToCr(el2.amount) : el2.amount;
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
                    this.activeButton == 'Total Revenue' || this.activeButton == 'Total Own Revenue' || this.activeButton == 'Total Surplus/Deficit' || this.activeButton == 'Capital Expenditure' ? this.convertToCr(el2.amount) : el2.amount;
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

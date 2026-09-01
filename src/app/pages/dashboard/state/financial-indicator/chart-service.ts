import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../../../core/services/common.service';
import { ULB_TYPE_SERIES } from './ulb-type-series.constants';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  stateServiceLabel: any;
  stateAvgVal: any;
  scatterData: any;
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
    };
    return options;

  }
  initializeScatterData() {
    this.scatterData = ULB_TYPE_SERIES.map(series => ({
      labels: [],
      rev: [],
      label: series.label,
      data: [],
      showLine: false,
      fill: true,
      borderColor: series.color,
      backgroundColor: series.color,
    }));
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
  }

  setScatterConfig(data: any, activeButton: string, stateServiceLabel = false, compareCategory = '') {
    // console.log('setScatterConfig data----', data, 'stateServiceLabel----', stateServiceLabel);
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
    let m_data, mCorporation, tp_data, cb_data, stateData;
    if (this.stateServiceLabel) {
      // if (apiData && apiData["scatterData"]) {      }
      m_data = apiData["scatterData"]["m_data"];
      mCorporation = apiData["scatterData"]["mc_data"];
      tp_data = apiData["scatterData"]["tp_data"];
      cb_data = apiData["scatterData"]["cb_data"];
      // stateData = res['data'] && res['data']['scatterData'] && res['data']['scatterData']["stateAvg"][0]["average"];
      stateData = apiData["scatterData"]["stateAvg"] &&
        apiData["scatterData"]["stateAvg"][0] &&
        apiData["scatterData"]["stateAvg"][0]["average"];
    } else {
      mCorporation = apiData["mCorporation"];
      tp_data = apiData["townPanchayat"];
      m_data = apiData["municipality"];
      cb_data = apiData["cantonmentBoard"];
      this.stateAvgVal = apiData["stateAvg"] ? apiData["stateAvg"] : this.stateAvgVal;
      // let stateData = this.activeButton == 'Total Revenue' || this.activeButton == 'Total Own Revenue' || this.activeButton == 'Total Surplus/Deficit' || this.activeButton == 'Capital Expenditure' ? this.convertToCr(this.stateAvgVal) : this.stateAvgVal;
      // stateData = this.convertToCr(this.stateAvgVal);
      stateData = this.stateAvgVal;
    }


    let stateLevelMaxPopuCount = this.getMaximumPopulationCount(mCorporation, tp_data, m_data, cb_data);
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
      } else if (el.label == "Cantonment Board") {
        this.setXYData(cb_data, el);
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
      const scatterDataCB = this.setGraphData(apiData['Cantonment Board'], 'Cantonment Board Average', '#8E44AD');
      this.scatterData.push(scatterDataCB);
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


  /**
   * It takes in four arrays of objects, each with a property called population, and returns the maximum
   * value of the population property across all four arrays.
   * @param {any} mCorporation - [{population: 100}, {population: 200}]
   * @param {any} townPanchayat - [{
   * @param {any} municipality - [{
   * @param {any} cantonmentBoard - [{
   * @returns getMaximumPopulationCount(mCorporation: any, townPanchayat: any, municipality: any, cantonmentBoard: any ) {
   *     let populationCountList = [];
   *     populationCountList = mCorporation.map(popCount => popCount.population)
   *     populationCountList = [...populationCountList, ...townPanchayat
   */
  getMaximumPopulationCount(
    mCorporation: any,
    townPanchayat: any,
    municipality: any,
    cantonmentBoard: any
  ) {
    let populationCountList = [];

    populationCountList = (mCorporation ?? []).map((popCount: any) => popCount.population);
    populationCountList = [
      ...populationCountList,
      ...(townPanchayat ?? []).map((popCount: any) => popCount.population),
    ];
    populationCountList = [
      ...populationCountList,
      ...(municipality ?? []).map((popCount: any) => popCount.population),
    ];
    populationCountList = [
      ...populationCountList,
      ...(cantonmentBoard ?? []).map((popCount: any) => popCount.population),
    ];

    let maxPopulationCount = Math.max(...populationCountList);
    return Math.round(maxPopulationCount / this.thousand);
  }
}

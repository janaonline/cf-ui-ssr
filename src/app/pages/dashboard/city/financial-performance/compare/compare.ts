import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { IULB } from '../../../../../core/models/ulb';
import { InrFormatPipe } from "../../../../../core/pipes/inr-format.pipe";
import { GlobalLoaderService } from '../../../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../../../core/services/utility-service';
import { DashboardService } from '../../../dashboard-service';
import { ChartConfig, ChartDataSet } from '../../../../../shared/components/charts/chart-interfaces';
import { Charts } from "../../../../../shared/components/charts/charts";
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../../shared/components/charts/constants';
import { CitySearch } from "../../../../../shared/components/city-search/city-search";
import { ActivatedRoute } from '@angular/router';
const GRAPH_COLORS = ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743", '#f43f5e', '#B388FF'];
interface RadioOption {
  key: string;
  label: string;
  isActive: boolean;
  children?: RadioOption[];
};

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    CitySearch,
    MatSelectModule,
    Charts,
    InrFormatPipe
  ],
  templateUrl: './compare.html',
  styleUrl: './compare.scss'
})
export class Compare implements OnInit {
  readonly currencyOptions = { showSymbol: true, showUnit: false };
  readonly whatYouWillGet = [
    {
      header: 'Charts',
      label: 'Side-by-side visual comparison of city finances across years and indicators',
      src: './assets/images/chart.png'
    },
    {
      header: 'Tables',
      label: 'Downloadable data tables for deeper analysis',
      src: './assets/images/table.png'
    },
    {
      header: 'Exports',
      label: 'PNG or CSV exports for your reports and presentations',
      src: './assets/images/export.png'
    },
  ]
  readonly introCheckBoxText = [
    'Standardized data',
    'Shaped by investor feedback',
    'No logins necessary',
  ]
  readonly indicatorsArr = signal<RadioOption[]>([
    // { label: "All Indicators", isActive: false },
    // {
    //   key: 'totExpenditureByTotRevenue',
    //   label: "Total Expenditure to Total Revenue (%)",
    //   isActive: false
    // },
    // {
    //   key: 'totOwnRevenueByTotRevenue',
    //   label: "Own Source Revenue to Total Revenue (%)",
    //   isActive: false
    // },
    // {
    //   key: 'grantsByTotRevenue',
    //   label: "Grants to Total Revenue (%)",
    //   isActive: false
    // },
    // {
    //   key: 'totExpenditureByTotOwnRevenue',
    //   label: "Own Source Revenue to Total Expenditure (%)",
    //   isActive: false
    // },
    // {
    //   key: 'capitalExpenditureByTotExpenditure',
    //   label: "Capital Expenditure to Total Expenditure (%)",
    //   isActive: false
    // },
    // {
    //   key: 'operatingSurplus',
    //   label: "Operating Surplus (Cr)",
    //   isActive: false
    // },
    // {
    //   key: 'totRevenue',
    //   label: "Total Revenue (Cr)",
    //   isActive: false,
    //   children: [
    //     {
    //       key: 'totOwnRevenue',
    //       label: 'Own Source Revenue (Cr)',
    //       isActive: false,
    //     },
    //     {
    //       key: '120',
    //       label: 'Assigned Revenue (Cr)',
    //       isActive: false,
    //     },
    //     {
    //       key: '160',
    //       label: 'Revenue Grants (Cr)',
    //       isActive: false,
    //     },
    //     {
    //       key: '100',
    //       label: 'Others (Cr)',
    //       isActive: false,
    //     },
    //   ]
    // }
  ]); // Will be sent from parent/ api call
  yearsArr = signal<string[]>(['2020-21', '2021-22', '2022-23']); // Will be sent from parent/ api call
  ulbId!: string;
  indicators = signal<RadioOption[]>([]);
  consolidatedIndicators = signal<RadioOption[]>([]);
  selectedIndicator: FormControl = new FormControl('');
  years = signal<RadioOption[]>([]);

  isYearsActive = signal<boolean>(false);
  isIndicatorsActive = signal<boolean>(false);
  isBrowser: boolean = false;

  selectedCities = signal<IULB[]>([]);

  chartConfig = signal<ChartConfig>({
    chartId: '',
    chartType: 'barChart',
    datasets: []
  });

  headers = signal<any[]>([]);
  displayedColumns: string[] = [];
  dataSource = signal<any[]>([]);
  res = {}
  // {
  //   headers: [
  //     { key: 'indicator', label: 'Indicator' },
  //     { key: "5e4a75dc47cb2749e5a56be0_2020_21", label: '2020-21' },
  //     { key: "5e4a75dc47cb2749e5a56be0_2021_22", label: '2021-22' },
  //     { key: "5e4a75dc47cb2749e5a56be0_2022_23", label: '2022-23' },
  //     { key: "5eb5844f76a3b61f40ba0697_2020_21", label: '2020-21' },
  //     { key: "5eb5844f76a3b61f40ba0697_2021_22", label: '2021-22' },
  //     { key: "5eb5844f76a3b61f40ba0697_2022_23", label: '2022-23' },
  //     { key: "5f5610b3aab0f778b2d2cac0_2020_21", label: '2020-21' },
  //     { key: "5f5610b3aab0f778b2d2cac0_2021_22", label: '2021-22' },
  //     { key: "5f5610b3aab0f778b2d2cac0_2022_23", label: '2022-23' },
  //   ],
  //   data: [
  //     {
  //       indicator: "Capital Expenditure to Total Expenditure (%)",
  //       "5e4a75dc47cb2749e5a56be0_2020_21": 2000,
  //       "5e4a75dc47cb2749e5a56be0_2021_22": 1000,
  //       "5e4a75dc47cb2749e5a56be0_2022_23": "800",
  //       "5eb5844f76a3b61f40ba0697_2020_21": "1510",
  //       "5eb5844f76a3b61f40ba0697_2021_22": "1050",
  //       "5eb5844f76a3b61f40ba0697_2022_23": "570",
  //       "5f5610b3aab0f778b2d2cac0_2020_21": "200",
  //       "5f5610b3aab0f778b2d2cac0_2021_22": "100",
  //       "5f5610b3aab0f778b2d2cac0_2022_23": "400",
  //     },
  //     {
  //       indicator: "Own Source Revenue (Cr)",
  //       "5e4a75dc47cb2749e5a56be0_2020_21": "2000",
  //       "5e4a75dc47cb2749e5a56be0_2021_22": "1000",
  //       "5e4a75dc47cb2749e5a56be0_2022_23": "800",
  //       "5eb5844f76a3b61f40ba0697_2020_21": "1510",
  //       "5eb5844f76a3b61f40ba0697_2021_22": "1050",
  //       "5eb5844f76a3b61f40ba0697_2022_23": "570",
  //       "5f5610b3aab0f778b2d2cac0_2020_21": "200",
  //       "5f5610b3aab0f778b2d2cac0_2021_22": "100",
  //       "5f5610b3aab0f778b2d2cac0_2022_23": "400",
  //     },
  //     {
  //       indicator: "Assigned Revenue (Cr)",
  //       "5e4a75dc47cb2749e5a56be0_2020_21": "800",
  //       "5e4a75dc47cb2749e5a56be0_2021_22": "780",
  //       "5e4a75dc47cb2749e5a56be0_2022_23": "660",
  //       "5eb5844f76a3b61f40ba0697_2020_21": "550",
  //       "5eb5844f76a3b61f40ba0697_2021_22": "470",
  //       "5eb5844f76a3b61f40ba0697_2022_23": "590",
  //       "5f5610b3aab0f778b2d2cac0_2020_21": "400",
  //       "5f5610b3aab0f778b2d2cac0_2021_22": "480",
  //       "5f5610b3aab0f778b2d2cac0_2022_23": "800",
  //     },
  //     {
  //       indicator: "Revenue Grants (Cr)",
  //       "5e4a75dc47cb2749e5a56be0_2020_21": "920",
  //       "5e4a75dc47cb2749e5a56be0_2021_22": "810",
  //       "5e4a75dc47cb2749e5a56be0_2022_23": "780",
  //       "5eb5844f76a3b61f40ba0697_2020_21": "298",
  //       "5eb5844f76a3b61f40ba0697_2021_22": "100",
  //       "5eb5844f76a3b61f40ba0697_2022_23": "200",
  //       "5f5610b3aab0f778b2d2cac0_2020_21": "920",
  //       "5f5610b3aab0f778b2d2cac0_2021_22": "100",
  //       "5f5610b3aab0f778b2d2cac0_2022_23": "200",
  //     },
  //     {
  //       indicator: "Others (Cr)",
  //       "5e4a75dc47cb2749e5a56be0_2020_21": "800",
  //       "5e4a75dc47cb2749e5a56be0_2021_22": "100",
  //       "5e4a75dc47cb2749e5a56be0_2022_23": "10",
  //       "5eb5844f76a3b61f40ba0697_2020_21": "400",
  //       "5eb5844f76a3b61f40ba0697_2021_22": "100",
  //       "5eb5844f76a3b61f40ba0697_2022_23": "70",
  //       "5f5610b3aab0f778b2d2cac0_2020_21": "264",
  //       "5f5610b3aab0f778b2d2cac0_2021_22": "300",
  //       "5f5610b3aab0f778b2d2cac0_2022_23": "220",
  //     },
  //   ]
  // }


  constructor(
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    private globalLoaderService: GlobalLoaderService,
    private dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }


  ngOnInit() {
    if (isPlatformServer(this.platformId)) return;
    this.isBrowser = isPlatformBrowser(this.platformId);
    // console.log("isBrowser:sd ", this.isBrowser);
    this.setYearsArr();
    this.setIndicatorsArr();
    this.route.queryParamMap.subscribe(q => {
      this.ulbId = q.get('ulbId') || '';
    });
    this.dashboardService.getUlbDetailsById(this.ulbId).subscribe({
      next: (res) => {
        this.selectedCities.set([res.ulbDetails]);
        // console.log('ULB Details:', res);
      },
      error: (err) => {
        console.error('Error fetching ULB details', err);
      }
    });
    this.selectedIndicator!.valueChanges.subscribe(() => this.createChartData());
  }

  // Based on yearsArr: string[] create years: RadioOption[] which has isActive etc..
  private setYearsArr() {
    const years = this.yearsArr().map((item: string) => {
      return { key: item.replace('-', '_'), label: item, isActive: false }
    });
    this.years.set(years)
  }

  // Set indicators array.
  private setIndicatorsArr() {
    this.dashboardService.getIndicatorsListCompareBy().subscribe({
      next: (res: any) => {
        this.indicators.set(res.data);
      }
    });
    // const indicators = [...this.indicatorsArr()];
    // this.indicators.set(indicators);
  }

  // Remove city from searched cities list.
  removeCity(city: IULB) {
    this.selectedCities.update(cities => cities.filter(c => c._id !== city._id));
  }

  /**
   * @param index 
   *    - Index of the years to toggle.
   *    - If index === -1, the `isActive` status for all years will be set to the provided 
   * @param activeStatus 
   *    - Boolean flag to set all years' active state. 
   *    - Defaults to the inverse of `this.isYearsActive()` if not provided.
   */
  modifyYears(index: number, activeStatus: boolean = !this.isYearsActive()) {
    if (index === -1) {
      this.years().forEach(item => item.isActive = activeStatus);
    } else {
      this.years()[index].isActive = !this.years()[index].isActive;
    }
    this.isYearsActiveFn();
    // console.log("modify year: ", index, this.years());
  }

  // Update isYearsActive variable if all years are active.
  private isYearsActiveFn() {
    const isActive = this.years().every(item => item.isActive);
    this.isYearsActive.set(isActive);
  }

  /**
   * @param index 
   *    - Index of the indicator to toggle.
   *    - If index === -1, the `isActive` status for all indicators will be set to the provided 
   * @param activeStatus 
   *    - Boolean flag to set all indicators' active state. 
   *    - Defaults to the inverse of `this.isIndicatorsActive()` if not provided.
   */
  modifyIndicators(index: number, activeStatus: boolean = !this.isIndicatorsActive()) {
    if (index === -1) {
      this.indicators().forEach(item => item.isActive = activeStatus);
    } else {
      this.indicators()[index].isActive = !this.indicators()[index].isActive;
    }
    this.isIndicatorsActiveFn();
    // console.log("addIndicator: ", index, this.indicators())
  }

  // Update isIndicatorssActive variable if all years are active.
  private isIndicatorsActiveFn() {
    const isActive = this.indicators().every(item => item.isActive);
    this.isIndicatorsActive.set(isActive);
  }

  // When ULB is selected from drop down - update selectedCities()
  onUlbSelected = (city: IULB) => {
    if (this.selectedCities().length >= 3) {
      this.utilityService.triggerSnackbar('Maximum 3 cities can be selected.', 'snackbar-danger');
    } else if (this.selectedCities().find(c => c._id === city._id)) {
      this.utilityService.triggerSnackbar(`${city.name} is already selected.`, 'snackbar-danger');
    } else {
      this.selectedCities.update(cities => [...cities, city]);
    }
  };

  isNumber(value: number | string) {
    return !isNaN(+value);
  }

  // Check if all filter options are selected to apply filter.
  isInvalidSelection() {
    return this.years().some(item => item.isActive) &&
      this.indicators().some(item => item.isActive) &&
      this.selectedCities().length > 0;
  }

  applyFilter() {
    // console.log("apply filter called");
    if (!this.isInvalidSelection()) {
      this.utilityService.triggerSnackbar('Kindly ensure all filter options are selected before applying the filter.', 'snackbar-danger');
      return;
    }

    // TDOD: will be removed - for dev only.
    // this.selectedCities.set([
    //   {
    //     "_id": "5e4a75dc47cb2749e5a56be0",
    //     "code": "MP005",
    //     "name": "Indore Municipal Corporation",
    //     "slug": "indore",
    //     location: {
    //       lat: null,
    //       lng: null
    //     },
    //     amrut: undefined,
    //     isActive: false,
    //     area: 0,
    //     natureOfUlb: '',
    //     population: 0,
    //     wards: 0,
    //     state: '',
    //     financialYear: ''
    //   },
    //   {
    //     "_id": "5eb5844f76a3b61f40ba0697",
    //     "code": "MP004",
    //     "name": "Bhopal Municipal Corporation",
    //     "slug": "bhopal",
    //     location: {
    //       lat: null,
    //       lng: null
    //     },
    //     amrut: undefined,
    //     isActive: false,
    //     area: 0,
    //     natureOfUlb: '',
    //     population: 0,
    //     wards: 0,
    //     state: '',
    //     financialYear: ''
    //   },
    //   {
    //     "_id": "5f5610b3aab0f778b2d2cac0",
    //     "code": "KA194",
    //     "name": "Bruhat Bengaluru Mahanagara Palike",
    //     "slug": "bengaluru",
    //     location: {
    //       lat: null,
    //       lng: null
    //     },
    //     amrut: undefined,
    //     isActive: false,
    //     area: 0,
    //     natureOfUlb: '',
    //     population: 0,
    //     wards: 0,
    //     state: '',
    //     financialYear: ''
    //   }
    // ])

    const yearsArr = this.years().filter(item => item.isActive);
    const ulbs = this.selectedCities();
    const indicators = this.indicators().filter(item => item.isActive);
    // console.log(indicators, 'this is blah')
    const consolidatedIndicators = this.getIndicators(indicators);
    if (ulbs.length < 2) {
      this.utilityService.triggerSnackbar('Kindly ensure atleast 2 ulbs/cities are selected before applying the filter.', 'snackbar-danger');
      return;
    }
    // console.log("consolidatedIndicators: ", consolidatedIndicators);
    this.consolidatedIndicators.set(consolidatedIndicators);
    this.selectedIndicator.setValue(this.consolidatedIndicators()[0].key)
    this.globalLoaderService.showLoader();
    this.loadData(yearsArr, ulbs, indicators);
    this.globalLoaderService.hideLoader();
  }

  private loadData(yearsArr: RadioOption[], ulbs: IULB[], consolidatedIndicators: RadioOption[]) {
    // TODO: change to string[] - based on api requirement.
    var years = yearsArr.map(item => item.label);
    var ulbIds = ulbs.map(item => item._id);
    var indicators = consolidatedIndicators.map(item => item.key);

    // console.log("filters = ", years, ulbIds, indicators);
    this.dashboardService.getCompareByIndicators(ulbIds, years, indicators).subscribe({
      next: (res: any) => {
        console.log("compare by res: ", res[0]);
        this.res = res[0];
        this.getTableData(this.res);
        this.createChartData(this.res);
      }
    });
    // setTimeout(() => {
    //   this.getTableData(this.res);
    //   // this.createChartData(this.res); // This is called from valueChanges.
    // }, 1000);
  }

  private getTableData(resData: any) {
    this.headers.set(resData.headers);
    this.displayedColumns = resData.headers.map((item: any) => item.key);
    this.dataSource.set(resData.data);
  }

  private createChartData(resData: any = this.res) {
    // console.log('Create chart called');
    // Create chart labels.
    const labelsWithDup: string[] = resData.headers
      .filter((item: any) => item.key !== 'indicator')
      .map((item: any) => item.label);
    const labels = Array.from(new Set(labelsWithDup));

    // Create data set.
    const indicatorLabel = this.consolidatedIndicators()
      .find(({ key }) => key === this.selectedIndicator.value)
      ?.label;
    const indicatorsData = resData.data.find((item: any) => item.indicator === indicatorLabel);

    const datasets: ChartDataSet[] = [];
    this.selectedCities().forEach((city: IULB, idx: number) => {
      const cityId = city._id;
      const data: number[] = [];
      for (const year of this.years()) {
        const key = cityId + '_' + year.key;
        data.push(indicatorsData[key]);
      }
      const obj = {
        label: city.name,
        data,
        "backgroundColor": GRAPH_COLORS[idx],
        "borderRadius": 5,
        "barThickness": 50,
      };
      datasets.push(obj);
    })


    this.chartConfig.set({
      "chartId": "bar-0",
      "chartType": "barChart",
      labels,
      datasets,
      "options": baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Amt in Cr', 'Years')
    })
  }

  // Flattens a list of indicators by extracting child indicators if present.
  private getIndicators(indicators: RadioOption[]) {
    const consolidatedIndicators: RadioOption[] = [];
    // console.log("indicators: ", indicators);
    const _getIndicators = (indicator: RadioOption) => {
      if (indicator.children && indicator.children.length > 0) {
        consolidatedIndicators.push(...indicator.children);
      } else {
        consolidatedIndicators.push(indicator);
      }
      return;
    }

    for (const indicator of indicators) {
      _getIndicators(indicator);
    }
    return consolidatedIndicators;
  }

  onReset() {
    this.selectedCities.set([]);
    this.modifyIndicators(-1, false);
    this.modifyYears(-1, false);
    this.consolidatedIndicators.set([]);
    this.chartConfig.set({
      chartId: '',
      chartType: 'barChart',
      datasets: []
    });
    this.dataSource.set([]);
    this.selectedIndicator.setValue('');
  }
}
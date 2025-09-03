import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ChartConfig } from '../../../../../shared/components/charts/chart-interfaces';
import { Charts } from "../../../../../shared/components/charts/charts";
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../../shared/components/charts/constants';
import { CitySearch } from "../../../../../shared/components/city-search/city-search";
// import { financeData } from './finance-data';

interface RadioOption {
  key: string;
  label: string;
  isActive: boolean;
  children?: RadioOption[];
};

interface PeriodicElement {
  [key: string]: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    indicator: "Own Source Revenue (Cr)",
    "2020,21": "20000",
    "2021,22": "10000",
    "2022,23": "20000"
  },
  {
    indicator: "Assigned Revenue (Cr)",
    "2020,21": "30000",
    "2021,22": "60000",
    "2022,23": "10000"
  },
  {
    indicator: "Revenue Grants (Cr)",
    "2020,21": "6000",
    "2021,22": "1000",
    "2022,23": "200"
  },
  {
    indicator: "Others (Cr)",
    "2020,21": "20000",
    "2021,22": "1000",
    "2022,23": "900"
  },
];


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
    {
      key: 'totExpenditureByTotRevenue',
      label: "Total Expenditure to Total Revenue (%)",
      isActive: false
    },
    {
      key: 'totOwnRevenueByTotRevenue',
      label: "Own Source Revenue to Total Revenue (%)",
      isActive: false
    },
    {
      key: 'grantsByTotRevenue',
      label: "Grants to Total Revenue (%)",
      isActive: false
    },
    {
      key: 'totExpenditureByTotOwnRevenue',
      label: "Own Source Revenue to Total Expenditure (%)",
      isActive: false
    },
    {
      key: 'capitalExpenditureByTotExpenditure',
      label: "Capital Expenditure to Total Expenditure (%)",
      isActive: false
    },
    {
      key: 'operatingSurplus',
      label: "Operating Surplus (Cr)",
      isActive: false
    },
    {
      key: 'totRevenue',
      label: "Total Revenue (Cr)",
      isActive: false,
      children: [
        {
          key: 'totOwnRevenue',
          label: 'Own Source Revenue (Cr)',
          isActive: false,
        },
        {
          key: '120',
          label: 'Assigned Revenue (Cr)',
          isActive: false,
        },
        {
          key: '160',
          label: 'Revenue Grants (Cr)',
          isActive: false,
        },
        {
          key: '100',
          label: 'Others (Cr)',
          isActive: false,
        },
      ]
    }
  ]); // Will be sent from parent/ api call
  yearsArr = signal<string[]>(['2020-21', '2021-22', '2022-23']); // Will be sent from parent/ api call

  indicators = signal<RadioOption[]>([]);
  consolidatedIndicators = signal<RadioOption[]>([]);
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

  displayedColumns: string[] = [];
  dataSource = signal<any[]>([]);
  headers = [
    { key: 'indicator', label: 'Indicator' },
    { key: '2020,21', label: '2020-21' },
    { key: '2021,22', label: '2021-22' },
    { key: '2022,23', label: '2022-23' },
  ]


  constructor(
    private utilityService: UtilityService,
    private globalLoaderService: GlobalLoaderService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }


  ngOnInit() {
    if (isPlatformServer(this.platformId)) return;
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.setYearsArr();
    this.setIndicatorsArr();
  }

  // Based on yearsArr: string[] create years: RadioOption[] which has isActive etc..
  private setYearsArr() {
    const years = this.yearsArr().map((item: string) => {
      return { key: item, label: item, isActive: false }
    });
    this.years.set(years)
  }

  // Set indicators array.
  private setIndicatorsArr() {
    const indicators = [...this.indicatorsArr()];
    this.indicators.set(indicators);
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
    console.log("modify year: ", index, this.years());
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
    console.log("addIndicator: ", index, this.indicators())
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
    if (!this.isInvalidSelection()) {
      this.utilityService.triggerSnackbar('Kindly ensure all filter options are selected before applying the filter.', 'snackbar-danger');
      return;
    }
    const years = this.years().filter(item => item.isActive);
    const ulbs = this.selectedCities();
    const indicators = this.indicators().filter(item => item.isActive);
    const consolidatedIndicators = this.getIndicators(indicators);
    this.consolidatedIndicators.set(consolidatedIndicators);

    this.globalLoaderService.showLoader();
    setTimeout(() => {
      this.getTableData(ELEMENT_DATA);
    }, 1000);
  }

  private getTableData(resData: any) {
    this.displayedColumns = this.headers.map(item => item.key);
    this.dataSource.set(resData);
    this.globalLoaderService.hideLoader();
    this.createChartData();
  }

  private createChartData() {
    this.globalLoaderService.showLoader();
    this.chartConfig.set({
      "chartId": "bar-0",
      "chartType": "barChart",
      "labels": [
        "2019-20",
        "2020-21",
        "2021-22"
      ],
      "datasets": [
        {
          "label": "Indore Municipal Corporation",
          "data": [
            83.28,
            76.73,
            70.28
          ],
          "backgroundColor": "#1b4965",
          "borderRadius": 5,
          "barThickness": 50,
        },
        {
          "label": "Bruhat Bengaluru Mahanagara Palike",
          "data": [
            93.28,
            36.73,
            40.28
          ],
          "backgroundColor": "#62b6cb",
          "borderRadius": 5,
          "barThickness": 50,
        },
        {
          "label": "Greater Chennai Corporation",
          "data": [
            63.28,
            16.73,
            90.28
          ],
          "backgroundColor": "#bee9e8",
          "borderRadius": 5,
          "barThickness": 50,
        },
      ],
      "options": baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Amt in Cr', 'Years')
    })
    this.globalLoaderService.hideLoader();
  }

  // Flattens a list of indicators by extracting child indicators if present.
  private getIndicators(indicators: RadioOption[]) {
    const consolidatedIndicators: RadioOption[] = [];

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
  }
}
import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { IULB } from '../../../../../core/models/ulb';
import { UtilityService } from '../../../../../core/services/utility-service';
import { CitySearch } from "../../../../../shared/components/city-search/city-search";
// import { financeData } from './finance-data';

interface RadioOption {
  label: string;
  isActive: boolean
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
  ],
  templateUrl: './compare.html',
  styleUrl: './compare.scss'
})
export class Compare implements OnInit {
  readonly introCheckBoxText = [
    'Standardized data',
    'Shaped by investor feedback',
    'No logins necessary',
  ]
  readonly indicatorsArr = signal<RadioOption[]>([
    // { label: "All Indicators", isActive: false },
    { label: "Total Expenditure to Total Revenue (%)", isActive: false },
    { label: "Own Source Revenue to Total Revenue (%)", isActive: false },
    { label: "Grants to Total Revenue (%)", isActive: false },
    { label: "Own Source Revenue to Total Expenditure (%)", isActive: false },
    { label: "Capital Expenditure to Total Expenditure (%)", isActive: false },
    { label: "Operating Surplus (Cr)", isActive: false }
  ]); // Will be sent from parent/ api call
  yearsArr = signal<string[]>(['2020-21', '2021-22', '2022-23']); // Will be sent from parent/ api call

  indicators = signal<RadioOption[]>([]);
  years = signal<RadioOption[]>([]);

  isYearsActive = signal<boolean>(false);
  isIndicatorsActive = signal<boolean>(false);
  isBrowser: boolean = false;

  selectedCities = signal<IULB[]>([]);

  constructor(
    private utilityService: UtilityService,
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
      return { label: item, isActive: false }
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
    const indicators = this.indicators().filter(item => item.isActive);
    const ulbs = this.selectedCities();

    console.log(years, indicators, ulbs)
  }

  onReset() {
    this.selectedCities.set([]);
    this.modifyIndicators(-1, false);
    this.modifyYears(-1, false);
  }
}
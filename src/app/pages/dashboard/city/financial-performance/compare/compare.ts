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
  isIndicatorssActive = signal<boolean>(false);
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

  // TODO - make a generic function to add/ remmove
  // Remove city from searched cities list.
  removeCity(city: IULB) {
    this.selectedCities.update(cities => cities.filter(c => c._id !== city._id));
  }

  // Make isActive true based on year selection in years()
  modifyYears(index: number) {
    this.years()[index].isActive = !this.years()[index].isActive;
    this.isYearsActiveFn();
    console.log("modify year: ", index, this.years());
  }

  // Make all years active.
  allAllYears() {
    this.years().forEach(item => item.isActive = true);
    this.isYearsActive.set(true);
  }

  // Make all years inactive.
  removeAllYears() {
    this.years().forEach(item => item.isActive = false);
    this.isYearsActive.set(false);
  }

  // Update isYearsActive variable if all years are active.
  private isYearsActiveFn() {
    const isActive = this.years().every(item => item.isActive);
    this.isYearsActive.set(isActive);
  }

  // Make isActive true based on year selection in indicators()
  modifyIndicators(index: number) {
    this.indicators()[index].isActive = !this.indicators()[index].isActive;
    this.isIndicatorsActiveFn();
    console.log("addIndicator: ", index, this.indicators())
  }

  // Make all indicators active.
  allAllIndicators() {
    this.indicators().forEach(item => item.isActive = true);
    this.isIndicatorssActive.set(true);
  }

  // Make all indicators inactive.
  removeAllIndicators() {
    this.indicators().forEach(item => item.isActive = false);
    this.isIndicatorssActive.set(false);
  }

  // Update isIndicatorssActive variable if all years are active.
  private isIndicatorsActiveFn() {
    const isActive = this.indicators().every(item => item.isActive);
    this.isIndicatorssActive.set(isActive);
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
  isValidSelection() {
    return this.years().some(item => item.isActive) &&
      this.indicators().some(item => item.isActive) &&
      this.selectedCities().length > 0;
  }

  applyFilter() {
    const years = this.years().filter(item => item.isActive);
    const indicators = this.indicators().filter(item => item.isActive);
    const ulbs = this.selectedCities();

    console.log(years, indicators, ulbs)
  }

  onReset() {
    this.selectedCities.set([]);
    this.removeAllIndicators();
    this.removeAllYears();
  }
}
import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, computed, effect, ElementRef, EnvironmentInjector, inject, Inject, OnInit, PLATFORM_ID, runInInjectionContext, signal, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { CitySearch } from "../../../../../shared/components/city-search/city-search";
import { UtilityService } from '../../../../../core/services/utility-service';
import { IULB } from '../../../../../core/models/ulb';
import { Chart } from 'chart.js';
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

  compareForm!: FormGroup;

  public selectedYears() {
    console.log("years: ", this.compareForm.get('years')?.value);
    return this.compareForm.get('years')?.value;
  }


  selectedCities = signal<IULB[]>([]);

  ngOnInit() {
    if (isPlatformServer(this.platformId)) return;
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.initializeForm();
    this.setYearsArr();
    this.setIndicatorsArr();
  }

  private setYearsArr() {
    const years = this.yearsArr().map((item: string) => {
      return { label: item, isActive: false }
    });
    this.years.set(years)
  }

  private setIndicatorsArr() {
    const indicators = [...this.indicatorsArr()];
    this.indicators.set(indicators);
  }

  private initializeForm() {
    this.compareForm = this.fb.group({
      years: [],
      // indicatorSelect: this.fb.array(this.indicators.map(() => false))
    });
  }

  // TODO - make a generic function to add/ remmove
  removeCity(city: IULB) {
    this.selectedCities.update(cities => cities.filter(c => c._id !== city._id));
  }

  modifyYears(index: number) {
    this.years()[index].isActive = !this.years()[index].isActive;
    this.isYearsActiveFn();
    console.log("modify year: ", index, this.years());
  }

  allAllYears() {
    this.years().forEach(item => item.isActive = true);
    this.isYearsActive.set(true);
  }

  removeAllYears() {
    this.years().forEach(item => item.isActive = false);
    this.isYearsActive.set(false);
  }

  private isYearsActiveFn() {
    const isActive = this.years().every(item => item.isActive);
    this.isYearsActive.set(isActive);
  }

  modifyIndicators(index: number) {
    this.indicators()[index].isActive = !this.indicators()[index].isActive;
    this.isIndicatorsActiveFn();
    console.log("addIndicator: ", index, this.indicators())
  }

  allAllIndicators() {
    this.indicators().forEach(item => item.isActive = true);
    this.isIndicatorssActive.set(true);
  }

  removeAllIndicators() {
    this.indicators().forEach(item => item.isActive = false);
    this.isIndicatorssActive.set(false);
  }

  private isIndicatorsActiveFn() {
    const isActive = this.indicators().every(item => item.isActive);
    this.isIndicatorssActive.set(isActive);
  }

  isValidSelection() {
    return this.years().some(item => item.isActive) &&
      this.indicators().some(item => item.isActive) &&
      this.selectedCities().length > 0;
  }

  @ViewChild('citySearch') citySearch!: any;
  allCities: any;

  constructor(
    private fb: FormBuilder,
    private utilityService: UtilityService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  // const injector = inject(EnvironmentInjector);


  onUlbSelected = (city: IULB) => {
    if (this.selectedCities().length < 3 && !this.selectedCities().find(c => c._id === city._id)) {
      this.selectedCities.update(cities => [...cities, city]);
    } else {
      this.utilityService.triggerSnackbar('Maximum 3 cities can be selected', 'snackbar-danger');
    }
  };




  // getSelectedYears(): string[] {
  //   return this.compareForm.value.yearSelect
  //     .map((checked: boolean, i: number) => checked ? this.years[i].value : null)
  //     .filter((v: string | null) => v !== null);
  // }

  // getSelectedIndicators(): string[] {
  //   return this.compareForm.value.indicatorSelect
  //     .map((checked: boolean, i: number) => checked ? this.indicators[i].name : null)
  //     .filter((v: string | null) => v !== null);
  // }

  onReset() {
    this.selectedCities.set([]);
    this.removeAllIndicators();
    this.removeAllYears();
  }


  onSubmit(): void {
    // console.log('Selected Years:', this.getSelectedYears());
    // console.log('Selected Indicators:', this.getSelectedIndicators());
    console.log('Full Form Value:', this.compareForm.value);
  }

  // isValidSelection(): boolean {
  //   return this.getSelectedYears().length > 0 && this.getSelectedIndicators().length > 0;
  // }


  getValue(city: any, year: string): number | string {
    const found = city.values.find((v: any) => v.year === year);
    return found ? found.value : '-';
  }

}

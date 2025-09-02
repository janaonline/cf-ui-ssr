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
  selectedCities = signal<IULB[]>([]);



  years = [
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' }
  ];

  indicators = [
    { name: "All Indicators" },
    { name: "Total Expenditure to Total Revenue (%)" },
    { name: "Own Source Revenue to Total Revenue (%)" },
    { name: "Grants to Total Revenue (%)" },
    { name: "Own Source Revenue to Total Expenditure (%)" },
    { name: "Capital Expenditure to Total Expenditure (%)" },
    { name: "Operating Surplus (Cr)" }
  ];

  compareForm!: FormGroup;
  isBrowser: boolean = false;
  @ViewChild('citySearch') citySearch!: any;
  allCities: any;

  constructor(
    private fb: FormBuilder,
    private utilityService: UtilityService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  // const injector = inject(EnvironmentInjector);
  ngOnInit() {
    if (isPlatformServer(this.platformId)) return;
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.compareForm = this.fb.group({
      yearSelect: this.fb.array(this.years.map(() => false)),
      indicatorSelect: this.fb.array(this.indicators.map(() => false))
    });

  }

  onUlbSelected = (city: IULB) => {
    if (this.selectedCities().length < 3 && !this.selectedCities().find(c => c._id === city._id)) {
      this.selectedCities.update(cities => [...cities, city]);
    } else {
      this.utilityService.triggerSnackbar('Maximum 3 cities can be selected', 'snackbar-danger');
    }
  };

  removeCity(city: IULB) {
    this.selectedCities.update(cities => cities.filter(c => c._id !== city._id));
  }

  getSelectedYears(): string[] {
    return this.compareForm.value.yearSelect
      .map((checked: boolean, i: number) => checked ? this.years[i].value : null)
      .filter((v: string | null) => v !== null);
  }

  getSelectedIndicators(): string[] {
    return this.compareForm.value.indicatorSelect
      .map((checked: boolean, i: number) => checked ? this.indicators[i].name : null)
      .filter((v: string | null) => v !== null);
  }

  onReset() {
    this.compareForm.reset({
      yearSelect: this.years.map(() => false),
      indicatorSelect: this.indicators.map(() => false)
    });

    this.selectedCities.set([]);

    if (this.citySearch) {
      const inputEl: HTMLInputElement | null = this.citySearch?.elementRef?.nativeElement
        .querySelector('input');
      if (inputEl) {
        inputEl.value = '';
      }
    }
  }


  onSubmit(): void {
    console.log('Selected Years:', this.getSelectedYears());
    console.log('Selected Indicators:', this.getSelectedIndicators());
    console.log('Full Form Value:', this.compareForm.value);
  }

  isValidSelection(): boolean {
    return this.getSelectedYears().length > 0 && this.getSelectedIndicators().length > 0;
  }


  getValue(city: any, year: string): number | string {
    const found = city.values.find((v: any) => v.year === year);
    return found ? found.value : '-';
  }

}

import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, Inject, input, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import html2canvas from 'html2canvas';
import { ButtonObj } from '../../../../../core/models/interfaces';
import { ChartConfig } from '../../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../../shared/components/charts/charts';
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../../shared/components/charts/constants';
import { ChartConfiguration, ChartDataset } from 'chart.js';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from "@angular/material/radio";
import { MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
const GRAPH_COLORS = ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743",];
import { IULB } from '../../../../../core/models/ulb';
import { CitySearch } from "../../../../../shared/components/city-search/city-search";
import { UtilityService } from '../../../../../core/services/utility-service';
// import { CompareSearch } from "./compare-search/compare-search";



@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    CitySearch,
    MatRadioModule,
    // Charts
  ],
  templateUrl: './compare.html',
  styleUrl: './compare.scss'
})
export class Compare {

  selectedCities = signal<IULB[]>([]);

  onUlbSelected = (city: IULB) => {
    // allow max 3 and avoid duplicates
    if (this.selectedCities().length < 3 && !this.selectedCities().find(c => c._id === city._id)) {
      this.selectedCities.update(cities => [...cities, city]);
    } else {
      this.utilityService.triggerSnackbar('Maximum 3 cities can be selected', 'snackbar-danger');
    }
  };

  removeCity(city: IULB) {
    this.selectedCities.update(cities => cities.filter(c => c._id !== city._id));
  }

  compareForm!: FormGroup;
  isBrowser: boolean = false;

  constructor(
    private fb: FormBuilder,
    private utilityService: UtilityService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  ngOnInit() {
    if (isPlatformServer(this.platformId)) return;
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.compareForm = this.fb.group({
      yearSelect: [''],
      indicatorSelect: ['']
    });
  }

  years = [
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' }
  ];



  indicators = [
    {
      name: "All Indicators",
    },
    {
      name: "Total Expenditure to Total Revenue (%)"
    },
    {
      name: "Own Source Revenue to Total Revenue (%)"
    },
    {
      name: "Grants to Total Revenue (%)"
    },
    {
      name: "Own Source Revenue to Total Expenditure (%)"
    },
    {
      name: "Capital Expenditure to Total Expenditure (%)"
    },
    {
      name: "Operating Surplus (Cr)"
    }
  ];

  // same as before...
  chartConfig: ChartConfiguration['data'] | null = null;

  onApply() {
    const formValues = this.compareForm.value;
    const cities = this.selectedCities();

    // mock dataset - replace with API call or real logic
    this.chartConfig = {
      labels: cities.map(c => c.name),
      datasets: [
        {
          label: `${formValues.indicatorSelect} (${formValues.yearSelect})`,
          data: cities.map(() => Math.floor(Math.random() * 100)), // fake values
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        }
      ]
    };
  }

  onReset() {
    // reset the form with default values
    this.compareForm.reset({
      yearSelect: '',
      indicatorSelect: ''
    });

    // clear selected cities
    this.selectedCities.set([]);
    this.chartConfig = null;
  }

}



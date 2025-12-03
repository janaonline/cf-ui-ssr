import {
  Component,
  effect,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ButtonObj, ISlb } from '../../../../core/models/interfaces';
import { IULB } from '../../../../core/models/ulb';
import { MaterialModule } from '../../../../material.module';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { gaugeChartOptions } from '../../../../shared/components/charts/constants';
import { CitySearch } from '../../../../shared/components/city-search/city-search';
import { NoDataFound } from '../../../../shared/components/no-data-found/no-data-found';
import { PreLoader } from '../../../../shared/components/pre-loader/pre-loader';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { DashboardService } from '../../dashboard-service';
const ULB_START_YEAR = 2021;
const MESSAGE = `Data shown here is based on submissions made by the ULBs as part of the 15th Finance Commission compliance.<br>CityFinance presents the information as provided and does not undertake separate verification.`;

@Component({
  selector: 'app-slb',
  imports: [
    PreLoader,
    CitySearch,
    TabButtons,
    NoDataFound,
    ReactiveFormsModule,
    Charts,
    MaterialModule,
  ],
  templateUrl: './slb.html',
  styleUrl: './slb.scss',
})
export class Slb implements OnInit, OnDestroy {
  readonly disabledColor = '#e9ecef';
  readonly primaryColor = '#1b4965';
  readonly secondaryColor = '#62b6cb';
  readonly accentColor = '#bee9e8';
  readonly success = '#198754';

  // Input from parent.
  readonly ulbId = input.required<string>();
  readonly years = input.required<string[]>();

  ulbName: string = '';
  compareUlbObj!: IULB;
  compareUlbName = signal<string>('');

  // Use keys that match API.
  readonly buttons: ButtonObj[] = [
    {
      // key: 'waterSupply',
      key: 'Water Supply',
      label: 'Water Supply',
    },

    {
      // key: 'wasteWaterManagement',
      key: 'sanitation',
      label: 'Waste Water Management',
    },

    {
      // key: 'solidWasteManagement',
      key: 'solid waste',
      label: 'Solid Waste Management',
    },

    {
      // key: 'stormWaterDrainage',
      key: 'storm water',
      label: 'Storm Water Drainage',
    },
  ];
  legendItems: { color: string; label: string; icon: string }[] = [];
  currentSelectedButtonKey = signal<string>('');
  myForm!: FormGroup;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  slbData!: ISlb[];
  chartData!: ChartConfig[];
  isCompareUlb: boolean = false;
  message: string = '';
  isLoading = signal<boolean>(true);

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.initializeForm();
    // this.getSlbData();
    // console.log('slb yeas in child: ', this.years());
  }

  readonly ulbIdEffect = effect(() => {
    if (this.ulbId()) {
      this.getSlbData();
    }
  });

  private initializeForm(): void {
    this.myForm = this.fb.group({ year: [this.years()[0]] });

    this.subscriptions.push(
      this.myForm.get('year')!.valueChanges.subscribe(() => this.getSlbData())
    );
  }

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    // console.log('Button key sent from child to parent:', key);
    this.currentSelectedButtonKey.set(key);
    // this.getSlbData('buttonselect');
  }

  // Callback: From child when ULB/city is selected
  onUlbSelected = (ulbObj: IULB): void => {
    // console.log('Value of ULB sent by child to parent:', ulbObj);
    if (ulbObj._id) {
      this.compareUlbObj = ulbObj;

      if (this.compareUlbObj._id !== this.ulbId()) {
        this.isCompareUlb = true;
        this.compareUlbName.set(this.compareUlbObj.name);
      } else this.isCompareUlb = false;

      this.getSlbData();
    }
  };
  get year() {
    return this.myForm.get('year')?.value;
  }

  resetSearch(): void {
    // console.log('isCompareUlb', this.isCompareUlb);
    if (this.isCompareUlb) {
      this.isCompareUlb = false;
      this.compareUlbName.set('');
      this.getSlbData();
    }
  }
  private showMessage(): boolean {
    const { year } = this;

    const parts = year.split('-');
    if (parts.length < 2) return false;

    const startYear = Number(parts[0]?.trim());
    if (!Number.isFinite(startYear)) return false;

    return startYear > ULB_START_YEAR;
  }

  private getSlbData(): void {
    if (this.showMessage()) this.message = MESSAGE;
    else this.message = '';

    const compareUlbId = this.isCompareUlb ? this.compareUlbObj._id : '';

    if (this.currentSelectedButtonKey()) {
      this.isLoading.set(true);
      this.dashboardService
        .fetchCitySlbChartData(
          this.currentSelectedButtonKey(),
          compareUlbId,
          this.ulbId(),
          this.year
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            // console.log('28 slb data: ', res);
            this.slbData = [];
            this.slbData = res.data;
            this.ulbName = this.slbData[0].ulbName;
          },
          error: (error) => {
            console.error('Failed to fetch data', error);
            this.isCompareUlb = false;
          },
          complete: () => {
            this.createChartRes();
            this.buildLegendItems();
          },
        });
    }
  }

  private buildLegendItems() {
    this.legendItems = [
      {
        color: this.primaryColor,
        label: this.isCompareUlb ? this.compareUlbObj.name : 'Benchmark',
        icon: 'bi bi-circle-fill',
      },
      {
        color: this.secondaryColor,
        label: 'National avg',
        icon: 'bi bi-circle-fill',
      },
      {
        color: this.accentColor,
        label: this.ulbName,
        icon: 'bi bi-circle-fill',
      },
      {
        color: this.success,
        label: 'ULB performance is better than National avg',
        icon: 'bi bi-hand-thumbs-up-fill',
      },
    ];
  }

  private createChartRes(): void {
    this.chartData = this.slbData.map((indicatorObj, idx) => {
      const value = Math.round(indicatorObj.value);
      let primaryValue = this.isCompareUlb
        ? Math.round(indicatorObj.compPercentage)
        : Math.round(indicatorObj.benchMarkValue);
      if (isNaN(primaryValue)) primaryValue = 0;
      const nationalValue = Math.round(indicatorObj.nationalValue);
      const maxValue = Math.max(value, primaryValue, nationalValue);

      // console.log('value =', [primaryValue, maxValue - primaryValue], maxValue);

      const datasets = [
        {
          label: this.isCompareUlb ? this.compareUlbObj.name : 'Benchmark',
          data: [primaryValue, maxValue - primaryValue],
          backgroundColor: [this.primaryColor, this.disabledColor],
          borderWidth: 1,
          borderRadius: 5,
        },
        {
          label: 'National Average',
          data: [nationalValue, maxValue - nationalValue],
          backgroundColor: [this.secondaryColor, this.disabledColor],
          borderWidth: 1,
          borderRadius: 5,
        },
        {
          label: indicatorObj.ulbName,
          data: [value, maxValue - value],
          backgroundColor: [this.accentColor, this.disabledColor],
          borderWidth: 1,
          borderRadius: 5,
        },
      ];

      let unit = '';
      if (indicatorObj.unitType === 'litres per capita per day (lpcd)')
        unit = 'LCPD';
      else if (indicatorObj.unitType === 'Incidents') unit = 'Incidents';
      else if (indicatorObj.unitType === 'Percent') unit = '%';
      else if (indicatorObj.unitType === 'Hours per day') unit = 'Hr(s)';
      else if (indicatorObj.unitType === 'Nos. per year') unit = 'Incidents';
      else unit = indicatorObj.unitType;

      const chartConfig: ChartConfig = {
        chartId: `slb${idx}`,
        chartType: 'gaugeChart',
        labels: [''],
        datasets,
        options: gaugeChartOptions,
        additionalInfo: {
          value,
          indicatorName: indicatorObj.name,
          nationalAvg: nationalValue,
          unit,
        },
      };

      return chartConfig;
    });
    this.isLoading.set(false);
  }

  showThumbUp(item: ChartConfig): 'text-success' | 'text-light' {
    if (
      item.additionalInfo &&
      item.additionalInfo.value > item.additionalInfo.nationalAvg
    )
      return 'text-success';

    return 'text-light';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    this.ulbIdEffect?.destroy();
  }
}

// chartData: ChartConfig = {
//   chartId: 'barChart',
//   chartType: 'barChart',
//   labels: ['2020-21', '2021-22', '2022-23'],
//   datasets: [
//     {
//       label: '2023-24',
//       data: [12, 19, 3],
//       backgroundColor: ['#65D2F3'],
//       borderRadius: 5,
//     },
//     {
//       label: '2022-23',
//       data: [10, 8, 6],
//       backgroundColor: ['#1596E6'],
//       borderRadius: 5,
//     },
//     {
//       label: '2021-22',
//       data: [12, 10, 14],
//       backgroundColor: ['#245ABF'],
//       borderRadius: 5,
//     },
//   ],
// };

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
import {
  ChartConfig,
  Charts,
} from '../../../../shared/components/charts/charts';
import { gaugeChartOptions } from '../../../../shared/components/charts/constants';
import { NoDataFound } from '../../../../shared/components/no-data-found/no-data-found';
import { PreLoader } from '../../../../shared/components/pre-loader/pre-loader';
import { CitySearch } from '../../../../shared/components/shared-ui/city-search';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { DashboardService } from '../../dashboard-service';

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
  currentSelectedButtonKey = signal<string>('');
  myForm!: FormGroup;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  slbData!: ISlb[];
  chartData!: ChartConfig[];
  isCompareUlb: boolean = false;

  isLoading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService
  ) {}

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

  private getSlbData(): void {
    const compareUlbId = this.isCompareUlb ? this.compareUlbObj._id : '';

    if (this.currentSelectedButtonKey()) {
      this.isLoading = true;
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
          },
        });
    }
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

    this.isLoading = false;
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

import { CdkTree } from '@angular/cdk/tree';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, Inject, input, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import html2canvas from 'html2canvas';
import { ButtonObj } from '../../../../core/models/interfaces';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../shared/components/charts/constants';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { ChartConfiguration, ChartDataset } from 'chart.js';
import { DashboardService } from '../../dashboard-service';
const GRAPH_COLORS = ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743",]

interface CustomChartDataset extends ChartDataset<'bar', number[]> {

  stack?: string;
}
interface DataNode {
  name: string;
  info?: string;
  yearData?: string[];
  yearGrowth?: string[];
  children?: DataNode[];
  className: string;
  isHeader?: boolean
  isSelected?: boolean;
}
const Financial_Performance_DATA: DataNode[] =
  [
    {
      name: 'Indicators',
      yearData: ['2020-21', '2021-22', '2022-23'],
      className: 'text-center fw-bold ',
      isHeader: true,
    },
    {
      name: 'Total Expenditure to Total Revenue (%)',
      yearData: ['99,999', '99,999', '99,999',],
      yearGrowth: ['', '89', '-90',],
      info: 'Total Expenditure to Total Revenue (%)',
      children: [
        {
          name: 'Total Expenditure to Total Revenue (%)',
          yearData: ['78', '56', '88',],
          info: 'Total Expenditure to Total Revenue (%)',
          className: 'ps-5 ',
        },
        {
          name: 'Own Source revenue to Total Revenue (%)',
          yearData: ['55', '87', '89'],
          className: 'ps-5 ',
        },
      ],
      className: '',
    },
    {
      name: 'Grants to Total Revenue (%)',
      info: 'Total Expenditure to Total Revenue (%)',
      yearData: ['90', '45', '67',],
      children: [
        {
          name: 'Total Expenditure to Total Revenue (%)',
          yearData: ['78', '56', '88',],
          info: 'Total Expenditure to Total Revenue (%)',
          className: 'ps-5 '
        },
        {
          name: 'Own Source revenue to Total Revenue (%)',
          yearData: ['55', '87', '89',],
          info: 'Own Source revenue to Total Revenue (%)',
          className: 'ps-5 '
        },
      ],
      className: '',
    },
    {
      name: 'Own Source Revenue to Total Expenditure (%)',
      yearData: ['78', '44', '90',],
      info: 'Total Expenditure to Total Revenue (%)',
      children: [
        {
          name: 'Total Expenditure to Total Revenue (%)',
          yearData: ['78', '56', '88',],
          info: 'Total Expenditure to Total Revenue (%)',
          className: 'ps-5 '
        },
        {
          name: 'Own Source revenue to Total Revenue (%)',
          yearData: ['55', '87', '89',],
          info: 'Own Source revenue to Total Revenue (%)',
          className: 'ps-5 '
        },
      ],
      className: '',
    },
    {
      name: 'Own Source Revenue to Total Expenditure (%)',
      yearData: ['78', '44', '90',],
      info: 'Total Expenditure to Total Revenue (%)',
      className: '',
    },

  ];

@Component({
  selector: 'app-financial-performance',
  imports: [
    TabButtons,
    Charts,
    CommonModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './financial-performance.html',
  styleUrl: './financial-performance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialPerformance {
  myForm!: FormGroup;
  intro: string = '';
  years = signal<string[]>([]);
  source: string = '';
  // source: string = 'Audited financial statements of FY 2019-20, FY 2020-21, unaudited statements of FY 2021-22, City Finance';
  isTooltipVisible = signal<boolean>(false);
  buttons: ButtonObj[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'expenditure', label: 'Expenditure' },
    { key: 'debt', label: 'Debt and Assets' }
  ];
  ulbIdSignal = input.required<string>();
  ulbName = input.required<string>();
  ulbType = input.required<string>();
  graphPayload = signal<any[]>([]);
  // optionsAxis:any
  optionsAxis = signal<any>('');
  ulbPopulation = input.required<string>();
  stateName = input.required<string>();
  currentSelectedButtonKey = signal<string>('overview');

  chartData = signal<ChartConfig>({
    chartId: this.graphPayload()[0]?.label,
    chartType: 'barChart',
    labels: ['test'],
    datasets: this.graphPayload(),
    options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
  });
  faqs = signal<any[]>([]);
  selectedButton: ButtonObj | null = null;
  readonlyButtons = computed<ButtonObj[]>(() => {
    return this.buttons
  });
  // readonlyButtons = computed<ButtonObj[]>(() => {
  //   return this.ulbPopulation() == '4M+'
  //     ? this.buttons
  //     : this.buttons.filter(btn =>
  //       ['revenue', 'expenditure'].includes(btn.key)
  //     );
  // });
  marketData: any;
  errorMessage: any;
  // yearArr: any;
  yearsArrDyna: any;
  titleTabs = signal<string>('overview');
  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private _dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.myForm = this.fb.group({
      year: ['']  // Default value, will be updated after API call
    });
  }

  @ViewChild(CdkTree) tree!: CdkTree<any>;
  // dataSource = Financial_Performance_DATA;
  dataSource = signal<any[]>([]);
  infoData = signal<string>('');
  public treeControl: any;  // Set your tree control here

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.getYearsDynamic(this.ulbIdSignal());
    this.setChartOptions();
    this.myForm.get('year')?.valueChanges.subscribe((selectedYear: string) => {
      this.onYearChanged(selectedYear); // Call the process whenever the year changes
      this.titleTabs.set('overview');
      this.getFaqs(this.ulbIdSignal(), selectedYear, this.stateName())
    });
  }
  private onYearChanged(selectedYear: string) {
    // Your custom logic to re-run when the year changes
    console.log('Re-running process for year:', selectedYear);

    // Get the previous years array based on the selected year
    this.yearsArrDyna = this.getYearsArray(selectedYear);
    console.log('Generated years array:', this.yearsArrDyna);

    // You can now trigger whatever process you want to happen with the selected year.
    this.onSelectedButtonChange('overview');
  }

  private getYearsArray(selectedYear: string): string[] {
    const currentYearNum = parseInt(selectedYear.split('-')[0]);
    return [
      `${currentYearNum - 2}-${(currentYearNum - 2 + 1).toString().slice(-2)}`,
      `${currentYearNum - 1}-${(currentYearNum - 1 + 1).toString().slice(-2)}`,
      `${currentYearNum}-${(currentYearNum + 1).toString().slice(-2)}`
    ];
  }

  childrenAccessor = (node: DataNode) => node.children ?? [];
  hasChild = (_: number, node: DataNode) => !!node.children && node.children.length > 0;




  buttonClicked(node: DataNode) {
    // console.log(node, 'by default')
    // if(!node.children && node.children.length>0) {

    this.dataSource().forEach(n => n.isSelected = false);
    this.infoData.set(node.info ?? 'N/A')
    node.isSelected = true;
    if (!this.tree) return;
    const datasets: any[] = [];
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any, index: number) => {
        // Prepare the dataset for each child
        datasets.push({
          label: child.name,
          data: child.yearData,
          backgroundColor: GRAPH_COLORS[index],
          borderRadius: 5,
          barThickness: 50,
          stack: 'stack1',
        });
        // console.log(child, 'this is child')
      });


      // Update the graph payload with the new datasets
      this.graphPayload.set(datasets);

      // Add axes label
      this.setChartOptions();

      // Update the chartData with the new datasets and options
      this.chartData.update(() => ({
        ...this.chartData(),
        labels: this.yearsArrDyna,
        chartId: node.name,
        datasets: this.graphPayload(),
        options: this.optionsAxis(),
      }));
    }
    else {
      this.graphPayload.set([
        {
          label: node.name,
          data: node.yearData,
          backgroundColor: '#62b6cb',
          borderRadius: 5,
          barThickness: 50,
        },
      ])
      this.setChartOptions();
      // Update chartData with new datasets
      this.chartData.update(() => ({
        ...this.chartData(),
        chartId: this.graphPayload()[0].label,
        labels: this.yearsArrDyna,
        datasets: this.graphPayload(),  // overwrite datasets
        options: this.optionsAxis(),
      }));
    }

    if (this.tree.isExpanded(node)) {
      return;
    }
    this.tree.collapseAll();
    this.cdRef.detectChanges();

    // refer to next event loop
    setTimeout(() => {
      this.tree.expand(node);
    }, 0);

  }

  private setChartOptions() {
    const label = this.chartData()?.chartId;
    if (label?.includes('(Cr)')) {
      this.optionsAxis.set(baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'));
    } else if (label?.includes('(%)')) {
      this.optionsAxis.set(baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'In %'));
    }
  }
  // // Helper: Add class name.
  getGrowthClass(value: string) {
    let className = 'text-danger';
    if (!isNaN(+value) && +value > 0) className = 'text-success';

    return `${className} fw-bold custom-font-size-6`;
  }

  // Helper: Add class name.
  addBoldWithBg(node: DataNode) {
    // return this.tree?.isExpanded(node) || this.hasChild(0, node) && !node.isHeader
    return this.tree?.isExpanded(node) && !node.isHeader
  }

  private getYearsDynamic(ulbId: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    this._dashboardService.getYearsDynamic(ulbId).subscribe({
      next: (data) => {
        this.years.set(data.years);
        this.myForm.setValue({ year: this.years()[0] });
        const currentYearNum = parseInt(this.years()[0].split('-')[0]);
        this.yearsArrDyna = [
          `${currentYearNum - 2}-${(currentYearNum - 2 + 1).toString().slice(-2)}`,
          `${currentYearNum - 1}-${(currentYearNum - 1 + 1).toString().slice(-2)}`,
          `${currentYearNum}-${(currentYearNum + 1).toString().slice(-2)}`
        ];
        this.onSelectedButtonChange('overview');
        // console.log(this.years(), 'this is yeee')
      },
      error: (err) => {
        this.errorMessage = err.message;
      }
    })
  }
  private getFaqs(ulbId: string, year: string, state: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    this._dashboardService.getFaqs(ulbId, year, state).subscribe({
      next: (data) => {
        console.log(data, 'this iss faq')
        this.faqs.set(data?.faqs);        // this.myForm.setValue({ year: this.years()[0] });
        // const currentYearNum = parseInt(this.years()[0].split('-')[0]);
        // this.yearsArrDyna = [
        //   `${currentYearNum - 2}-${(currentYearNum - 2 + 1).toString().slice(-2)}`,
        //   `${currentYearNum - 1}-${(currentYearNum - 1 + 1).toString().slice(-2)}`,
        //   `${currentYearNum}-${(currentYearNum + 1).toString().slice(-2)}`
        // ];
        // this.onSelectedButtonChange('overview');
        // // console.log(this.years(), 'this is yeee')
      },
      error: (err) => {
        this.errorMessage = err.message;
      }
    })
  }
  // Main Button Change Handler
  onSelectedButtonChange(btnKey: string) {
    this.selectedButton = this.buttons.find(button => button.key === btnKey) || null;
    this.currentSelectedButtonKey.set(btnKey);
    this.getIndicators(this.yearsArrDyna, this.ulbIdSignal(), this.selectedButton?.key ?? '')
    if (this.selectedButton) {
      switch (btnKey) {
        case "overview": {
          return this.titleTabs.set('key ratios')
        }
        case "revenue": {
          return this.titleTabs.set('revenue overview')
        }
        case "expenditure": {
          return this.titleTabs.set('expenditure breakdown')
        }
        case "debt": {
          return this.titleTabs.set('debt and assets')
        }
      }
    }
  }
  private getIndicators(years: string[], ulbId: string, keyType: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this._dashboardService.getMarketDashboardIndicators(ulbId, keyType, years).subscribe({
      next: (data) => {
        this.marketData = data
        // console.log(data.response.data[0].yearData, 'this is bmw')
        const dataSource = data.response.data;
        this.dataSource.set(dataSource);
        // console.log(this.dataSource(), 'this is daaaa')
        this.buttonClicked(dataSource[1]);

        // this.yearArr = this.dataSource()[0];
        this.intro = this.marketData.response.intro
        this.source = this.marketData.source;
      },
      error: (err) => {
        this.errorMessage = err.message;
      }
    });
  }
  // Download chart as img.
  downloadImg(selectedIndicator: string = 'CityPageChart') {
    let isChartDownloading = true;

    setTimeout(() => {
      const chartContainer = document.getElementById('chartContainer');
      if (!chartContainer) return;

      // Create the outer div
      const cfLogo = document.createElement('div');
      cfLogo.className = 'cfLogo text-end';

      // Inject the inner HTML
      cfLogo.innerHTML = `
      <span class="fw-bold custom-font-size-6 text-shadow-custom text-info">city</span>
      <span class="fw-bold custom-font-size-6 text-shadow-custom text-cfSecondary">finance.in</span>
    `;

      // Append to chart container
      chartContainer.appendChild(cfLogo);

      // Wait briefly to render new DOM changes
      setTimeout(() => {
        html2canvas(chartContainer)
          .then(canvas => {
            // Remove logo divs
            chartContainer.querySelectorAll('.cfLogo').forEach(el => el.remove());

            // Download the image
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${selectedIndicator}.png`;
            link.click();
          })
          .catch(err => {
            chartContainer.querySelectorAll('.cfLogo').forEach(el => el.remove());
            console.error('Error capturing chart:', err);
          })
          .finally(() => {
            isChartDownloading = false;
          });
      }, 100);
    }, 0);
  }

  // Hide/ Remove tooltip.
  toggleTooltip() {
    this.isTooltipVisible.set(!this.isTooltipVisible());
  }
  expandedIndex: number | null = null;

  toggle(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}


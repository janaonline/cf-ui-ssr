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
  years = signal<string[]>(['2020-21', '2021-22', '2022-23']);
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
  ulbPopulation = input.required<string>();
  currentSelectedButtonKey = signal<string>('overview');

  chartData = signal<ChartConfig>({
    chartId: this.graphPayload()[0]?.label,
    chartType: 'barChart',
    labels: ['2020-21', '2021-22', '2022-23'],
    datasets: this.graphPayload(),
    // datasets: [
    //   {
    //     label: 'Capital Expenditure',
    //     data: [30, 50, 20],
    //     backgroundColor: '#62b6cb',
    //     borderRadius: 5,
    //     barThickness: 50,
    //     // stack: 'stack1',
    //   },
    //   // {
    //   //   label: 'Revenue Expenditure',
    //   //   data: [10, 20, 15],
    //   //   backgroundColor: '#8ecae6',
    //   //   borderRadius: 5,
    //   //   barThickness: 50,
    //   //   stack: 'stack1',
    //   // }
    // ],
    // options: {
    //   ...baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
    //   scales: {
    //     x: {
    //       stacked: true,
    //     },
    //     y: {
    //       stacked: true,
    //     },
    //   },
    // }
    // });
    //     }
    //   ],
    options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
  });

  selectedButton: ButtonObj | null = null;
  readonlyButtons = computed<ButtonObj[]>(() => {
    return this.ulbPopulation() == '4M+'
      ? this.buttons
      : this.buttons.filter(btn =>
        ['revenue', 'expenditure'].includes(btn.key)
      );
  });
  marketData: any;
  errorMessage: any;
  yearArr: any;
  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private _dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  @ViewChild(CdkTree) tree!: CdkTree<any>;
  // dataSource = Financial_Performance_DATA;
  dataSource = signal<any[]>([]);
  public treeControl: any;  // Set your tree control here

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // console.log('test1', this.platformId)
    // console.log('test3', this.graphPayload())

    this.myForm = this.fb.group({ year: [this.years()[0]] });

    // Define year array, ulbId and keyType
    const years = ['2022-23', '2021-22', '2020-21'];
    const ulbId = this.ulbIdSignal();  // Unique identifier for ULB
    const keyType = 'revenue';  // Key type to fetch specific data

    // Call the getIndicators method
    this.getIndicators(years, ulbId, keyType);

    // if(this.dataSource().length>0){
    //   this.buttonClicked(node)
    // }
  }

  childrenAccessor = (node: DataNode) => node.children ?? [];
  hasChild = (_: number, node: DataNode) => !!node.children && node.children.length > 0;

  // Main Button Change Handler
  onSelectedButtonChange(btnKey: string) {
    this.selectedButton = this.buttons.find(button => button.key === btnKey) || null;
    console.log(this.selectedButton, 'this is selected button')
    this.currentSelectedButtonKey.set(btnKey);
    this.getIndicators(this.years(), this.ulbIdSignal(), this.selectedButton?.key ?? '')
    // console.log(btnKey)
  }

  // Collapse all nodes and expand only the selected one
  buttonClicked(node: DataNode) {
    this.dataSource().forEach(n => n.isSelected = false);
    node.isSelected = true;
    if (!this.tree) return;
    // console.log(node, 'this is node')
    // this.chartData().datasets = [];
    const datasets: any[] = [];
    if (node.children && node.children.length > 0) {

      node.children.forEach((child: any) => {
        console.log('inside')
        // Prepare the dataset for each child
        datasets.push({
          label: child.name,
          data: child.yearData,
          backgroundColor: '#62b6cb',
          borderRadius: 5,
          barThickness: 50,
          stack: 'stack1',
        });
      });
      datasets.push({
        label: node.name,
        data: node.yearData,
        backgroundColor: '#62b6cb',
        borderRadius: 5,
        barThickness: 50,
        stack: 'stack1', // Ensure stacking
      });

      // Update the graph payload with the new datasets
      this.graphPayload.set(datasets);

      // Update the chartData with the new datasets and options
      this.chartData.update(() => ({
        ...this.chartData(),
        chartId: node.name,  // Keep the parent node's label
        datasets: this.graphPayload(),  // Overwrite datasets
        // options: this.getChartOptions(), // Options for the stacked bar chart
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
      ]);
      // console.log(this.graphPayload()[0].label, '')
      // Update chartData with new datasets
      this.chartData.update(() => ({
        ...this.chartData(),
        chartId: this.graphPayload()[0].label,           // keep all other properties
        datasets: this.graphPayload(),  // overwrite datasets
        options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
      }));
    }

    if (this.tree.isExpanded(node)) {
      return;
    }
    // console.log(this.graphPayload(), 'this is nodeeeee');
    // console.log(this.chartData(), 'thhid ');
    this.tree.collapseAll();
    this.cdRef.detectChanges();

    // refer to next event loop
    setTimeout(() => {
      this.tree.expand(node);
    }, 0);

  }

  // getColorForChild(childName: string): string {
  //   const colors = {
  //     // 'Own Source Revenue': '#ff7f0e',
  //     // 'Assigned Revenue': '#2ca02c',
  //     // 'Revenue Grants': '#1f77b4',
  //     // 'Others': '#d62728',
  //   };
  //   return colors[childName] || '#62b6cb'; // Default to #62b6cb if not found
  // }

  // // // Function to return chart options with stacking enabled
  // getChartOptions() {
  //   return {
  //     responsive: true,
  //     scales: {
  //       x: {
  //         stacked: true, // Enable stacking on the x-axis
  //         title: {
  //           display: true,
  //           text: 'Years',
  //         },
  //       },
  //       y: {
  //         stacked: true, // Enable stacking on the y-axis
  //         title: {
  //           display: true,
  //           text: 'Amt in ₹ Cr',
  //         },
  //       },
  //     },
  //     plugins: {
  //       legend: {
  //         position: 'top',
  //         labels: {
  //           usePointStyle: true,
  //         },
  //       },
  //     },
  //   };
  // }
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

  private getIndicators(years: string[], ulbId: string, keyType: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Call the service method with appropriate parameters
    this._dashboardService.getMarketDashboardIndicators(ulbId, keyType, years).subscribe({
      next: (data) => {
        this.marketData = data;
        console.log(this.marketData, 'this is market data') // Store the response data
        const dataSource = data.response.data;
        // dataSource[1].isSelected = true;

        this.dataSource.set(dataSource);  // Ensure this.dataSource is available and matches the expected structure
        console.log(this.dataSource(), 'datasource')
        this.buttonClicked(dataSource[1]);
        this.yearArr = this.dataSource()[0];
        this.intro = this.marketData.response.intro
        this.source = this.marketData.source;  // Ensure this.marketData.intro exists
      },
      error: (err) => {
        this.errorMessage = err.message;  // Handle any errors
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

  faqs = [
    {
      question: 'What’s included incityfinance?',
      answer: 'cityfinance Pro includes video walkthroughs, detailed explanations, and multiple versions of problems to help you deeply understand data structures and algorithms.'
    },
    {
      question: 'Are there any refunds?',
      answer: 'Yes, cityfinance offers a 30-day money-back guarantee. If you’re not satisfied, you can request a refund within 30 days of purchase.'
    },
    {
      question: 'Do I get lifetime access?',
      answer: 'Yes! Once you purchasecityfinance, you have lifetime access to all content and future updates.'
    }
  ];

  expandedIndex: number | null = null;

  toggle(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}


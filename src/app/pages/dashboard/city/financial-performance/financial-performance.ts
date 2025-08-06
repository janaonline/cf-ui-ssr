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

interface DataNode {
  name: string;
  info?: string;
  yearData?: string[];
  yearGrowth?: string[];
  children?: DataNode[];
  className: string;
  isHeader?: boolean
}

const Financial_Performance_DATA: DataNode[] = [
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
        className: '',
      },
      {
        name: 'Own Source revenue to Total Revenue (%)',
        yearData: ['55', '87', '89'],
        className: '',
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
        className: ''
      },
      {
        name: 'Own Source revenue to Total Revenue (%)',
        yearData: ['55', '87', '89',],
        info: 'Own Source revenue to Total Revenue (%)',
        className: ''
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
        className: ''
      },
      {
        name: 'Own Source revenue to Total Revenue (%)',
        yearData: ['55', '87', '89',],
        info: 'Own Source revenue to Total Revenue (%)',
        className: ''
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
  years = signal<string[]>(['2020-21', '2021-22', '2022-23']);
  source: string = 'Audited financial statements of FY 2019-20, FY 2020-21, unaudited statements of FY 2021-22, City Finance';
  isTooltipVisible = signal<boolean>(false);
  buttons: ButtonObj[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'expenditure', label: 'Expenditure' },
    { key: 'debtassets', label: 'Debt and Assets' }
  ];
  ulbIdSignal = input.required<string>();
  ulbName = input.required<string>();
  ulbType = input.required<string>();
  ulbPopulation = input.required<string>();
  currentSelectedButtonKey = signal<string>('overview');
  chartData = signal<ChartConfig>({
    chartId: 'bar0',
    chartType: 'barChart',
    labels: ['2020-21', '2021-22', '2022-23'],
    datasets: [
      {
        label: 'Capital Expenditure',
        data: [30, 50, 20],
        backgroundColor: '#62b6cb',
        borderRadius: 5,
        barThickness: 50,
      }
    ],
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

  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  @ViewChild(CdkTree) tree!: CdkTree<any>;
  // dataSource = Financial_Performance_DATA;
  public dataSource = Financial_Performance_DATA;
  public treeControl: any;  // Set your tree control here

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.myForm = this.fb.group({ year: [this.years()[0]] });
  }

  childrenAccessor = (node: DataNode) => node.children ?? [];
  hasChild = (_: number, node: DataNode) => !!node.children && node.children.length > 0;

  // Main Button Change Handler
  onSelectedButtonChange(btnKey: string) {
    this.selectedButton = this.buttons.find(button => button.key === btnKey) || null;
    this.currentSelectedButtonKey.set(btnKey);
  }

  // Collapse all nodes and expand only the selected one
  buttonClicked(node: DataNode) {
    if (!this.tree) return;

    this.tree.collapseAll();
    this.cdRef.detectChanges();

    // defer to next event loop
    setTimeout(() => {
      this.tree.expand(node);
    }, 0);
  }


  // Helper: Add class name.
  getGrowthClass(value: string) {
    let className = 'text-danger';
    if (!isNaN(+value) && +value > 0) className = 'text-success';

    return `${className} fw-bold custom-font-size-6`;
  }

  // Helper: Add class name.
  addBoldWithBg(node: DataNode) {
    return this.tree?.isExpanded(node) && this.hasChild(0, node) && !node.isHeader
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

}

import { Component, computed, input, signal } from '@angular/core';
import { ButtonObj } from '../../../../core/models/interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { CdkTree } from '@angular/cdk/tree';
import { ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

interface DataNode {
  name: string;
  info?: string;
  yearData?: string[];
  yearGrowth?: string[];
  children?: DataNode[];
  className: string;
  isHeader?: boolean
  selected?: boolean
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
    selected: true,
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
        yearData: ['55%', '87%', '89%'],
        className: 'ps-5 '
      },
    ],
    className: 'fw-bold',
  },
  {
    name: 'Grants to Total Revenue (%)',
    info: 'Total Expenditure to Total Revenue (%)',
    yearData: ['90%', '45%', '67%',],
    children: [
      {
        name: 'Total Expenditure to Total Revenue (%)',
        yearData: ['78%', '56%', '88%',],
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
    MatTooltipModule
  ],
  templateUrl: './financial-performance.html',
  styleUrl: './financial-performance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialPerformance {
  getGrowthClass(value: string) {
    let className = 'text-danger';
    if (!isNaN(+value) && +value > 0) className = 'text-success';

    return `${className} fw-bold custom-font-size-6`;
  }
  @ViewChild(CdkTree) tree!: CdkTree<any>;
  // dataSource = Financial_Performance_DATA;
  public dataSource = Financial_Performance_DATA;
  public treeControl: any;  // Set your tree control here

  ngOnInit(): void {
    if (this.dataSource && this.dataSource.length > 0) {
      this.dataSource[1].selected = true;
    }
  }

  ngAfterViewInit(): void {
    // After the view is initialized, expand the first node with children
    if (this.treeControl && this.dataSource[1].children) {
      this.treeControl.expand(this.dataSource[1]);
    }
  }
  childrenAccessor = (node: DataNode) => node.children ?? [];

  hasChild = (_: number, node: DataNode) => !!node.children && node.children.length > 0;

  onDownload() {
    throw new Error('Method not implemented.');
  }

  buttons: ButtonObj[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'expenditure', label: 'Expenditure' },
    { key: 'debtassets', label: 'Debt and Assets' }
  ];

  readonly items = [
    { icon: 'bi bi-download', label: 'Download' },
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
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        // title: {
        //   display: true,
        //   text: 'Total Expenditure'
        // }
      }
    },
    datasets: [
      {
        label: 'Capital Expenditure',
        data: [30, 50, 20],
        backgroundColor: '#42A5F5'
      }
    ]
  });
  selectedButton: ButtonObj | null = null;
  readonlyButtons = computed<ButtonObj[]>(() => {
    return this.ulbPopulation() == '4M+'
      ? this.buttons
      : this.buttons.filter(btn =>
        ['revenue', 'expenditure'].includes(btn.key)
      );
  });

  // Main Button Change Handler
  onSelectedButtonChange(btnKey: string) {
    this.selectedButton = this.buttons.find(button => button.key === btnKey) || null;
    this.currentSelectedButtonKey.set(btnKey);
  }


  takeAction(selectedIcon: string) {
    if (selectedIcon === 'Download') {
      setTimeout(() => {
        const chartContainer = document.getElementById('chartContainer');
        if (!chartContainer) return;

        const elementsToHide = chartContainer.querySelectorAll('.hide-while-download');
        elementsToHide.forEach(el => {
          (el as HTMLElement).style.visibility = 'hidden';
        });

        // Create the outer div
        const cfLogo = document.createElement('div');
        cfLogo.className = 'cfLogo-place';
        cfLogo.style.position = 'absolute';
        cfLogo.style.bottom = '0px';
        cfLogo.style.right = '10px';
        cfLogo.style.zIndex = '1000';

        // Inject the inner HTML
        cfLogo.innerHTML = `
          <span class="fw-bold fs-3 text-shadow-custom text-info">city</span>
          <span class="fw-bold fs-3 text-shadow-custom text-cfSecondary">finance.in</span>
        `;

        // Append to chart container
        chartContainer.appendChild(cfLogo);


        // Wait briefly to render new DOM changes
        setTimeout(() => {
          html2canvas(chartContainer).then(canvas => {
            // Restore visibility
            elementsToHide.forEach(el => {
              (el as HTMLElement).style.visibility = 'visible';
            });

            // Remove logo divs
            const tempElements = chartContainer.querySelectorAll('.cfLogo-place');
            tempElements.forEach(el => el.remove());

            // Download the image
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'chart.png';
            link.click();
          }).catch(err => {
            // Restore in case of error
            elementsToHide.forEach(el => {
              (el as HTMLElement).style.visibility = 'visible';
            });
            chartContainer.querySelectorAll('.cfLogo-place').forEach(el => el.remove());
            console.error('Error capturing chart:', err);
          });
        }, 100); // Wait a bit to let DOM update
      }, 0);
    }
  }



  isTooltipVisible = signal<boolean>(false);
  toggleTooltip() {
    this.isTooltipVisible.set(!this.isTooltipVisible());
  }

}

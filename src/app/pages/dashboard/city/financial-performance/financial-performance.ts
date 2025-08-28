import { CdkTree } from '@angular/cdk/tree';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, Inject, input, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { ChartDataset } from 'chart.js';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { ButtonObj, CreateExcelParams } from '../../../../core/models/interfaces';
import { GlobalLoaderService } from '../../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../../core/services/utility-service';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { Charts } from '../../../../shared/components/charts/charts';
import { baseChartOptions, DEFAULT_FONT_FAMILY } from '../../../../shared/components/charts/constants';
import { TabButtons } from '../../../../shared/components/tab-buttons/tab-buttons';
import { DashboardService } from '../../dashboard-service';
const GRAPH_COLORS = ["#62b6cb", "#1b4965", "#bee9e8", "#43B5A0", "#F4A261", "#5885AF", "#F6D743",]
const DEFAULT_STYLES = {
  alignment: { vertical: 'middle' },
  font: { name: 'Aptos', size: 10 },
}

interface CustomChartDataset extends ChartDataset<'bar', number[]> {

  stack?: string;
}
interface DataNode {
  name: string;
  info?: string;
  yearData?: string[];
  yearGrowth?: string[];
  children?: DataNode[];
  graphKey?: string,
  className: string;
  isHeader?: boolean
  isSelected?: boolean;
  isParent?: boolean;
}
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
  buttons: ButtonObj[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'expenditure', label: 'Expenditure' },
    { key: 'debt', label: 'Debt and Assets' }
  ];
  isWarningMessage: boolean = false;
  warningMessage: string = ''
  ulbIdSignal = input.required<string>();
  ulbName = input.required<string>();
  ulbType = input.required<string>();
  graphPayload = signal<any[]>([]);
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
  marketData: any;
  errorMessage: any;
  yearsArrDyna: any;
  titleTabs = signal<string>('overview');

  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private _dashboardService: DashboardService,
    private _globalLoaderService: GlobalLoaderService,
    private _uitityService: UtilityService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  @ViewChild(CdkTree) tree!: CdkTree<any>;
  dataSource = signal<any[]>([]);
  infoData = signal<string>('');
  public treeControl: any;  // Set your tree control here

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.myForm = this.fb.group({ year: [''] });
    this.getYearsDynamic(this.ulbIdSignal());

    // Track value changes - Year changed from drop-down.
    this.myForm.get('year')?.valueChanges.subscribe((selectedYear: string) => {
      const pop = this.ulbPopulation(); // e.g. '4M+' | '1M-4M' | '100K-1M' | '<100K'
      const populationCategory =
        typeof pop === 'string' && pop.includes('<100K') ? 'cat2' : 'cat1';
      this.onYearChanged(selectedYear);
      this.getFaqs(this.ulbIdSignal(), selectedYear, this.stateName(), populationCategory);
    });
  }
  private onYearChanged(selectedYear: string) {
    this.yearsArrDyna = this.getYearsArray(selectedYear);
    this.onSelectedButtonChange(this.currentSelectedButtonKey());
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
    // console.log(node, 'this is node');
    if (!node.isParent) {
      return;
    }
    this.dataSource().forEach(n => n.isSelected = false);
    node.isSelected = true;
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => child.isSelected = false);
    }
    this.infoData.set(node.info ?? 'N/A')
    node.isSelected = true;
    if (!this.tree) return;

    const datasets: any[] = [];
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any, index: number) => {
        datasets.push({
          label: child.name,
          data: child.yearData,
          backgroundColor: GRAPH_COLORS[index],
          borderRadius: 5,
          barThickness: 50,
          stack: 'stack1',
        });
        if (child.graphKey === 'amount') {
          this.optionsAxis.set(baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'));
        } else if (child.graphKey === 'percentage') {
          this.optionsAxis.set(baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'In %'));
        }
      });
      this.graphPayload.set(datasets);
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
          backgroundColor: '#1b4965',
          borderRadius: 5,
          barThickness: 50,
        },
      ])
      if (node.graphKey === 'amount') {
        this.optionsAxis.set(baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'));
      } else if (node.graphKey === 'percentage') {
        this.optionsAxis.set(baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'In %'));
      }
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
      this.tree.collapse(node);
      return;
    }
    this.tree.collapseAll();
    this.cdRef.detectChanges();

    // refer to next event loop
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
  private getFaqs(ulbId: string, year: string, state: string, populationType: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    this._dashboardService.getFaqs(ulbId, year, state, populationType).subscribe({
      next: (data) => {
        this.faqs.set(data?.faqs)
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
  // Utility method in your component or a service
  private hasNA(item: any): boolean {
    if (!item || !Array.isArray(item.yearData)) {
      return false;
    }
    // return item.yearData.some((v: any) => this.isNA(v));
    return this.isNA(item.yearData[item.yearData.length - 1]);
  }

  // The existing isNA helper
  private isNA(v: unknown): boolean {
    return (
      v == null ||
      (typeof v === 'string' && v.trim().toUpperCase() === 'N/A') ||
      (typeof v === 'number' && !Number.isFinite(v))
    );
  }
  private isZero(v: unknown): boolean {
    return (
      v !== null &&
      v !== undefined &&
      v !== '' &&
      !isNaN(Number(v)) &&
      Number(v) === 0
    );
  }

  // Checks if an item has any zero values in its yearData
  private hasExactZero(item: any): boolean {
    if (!item || !Array.isArray(item.yearData)) {
      return false;
    }
    // return item.yearData.some((v: any) => this.isZero(v));
    return this.isZero(item.yearData[item.yearData.length - 1]);
  }
  private checkISCR(item: any): string | null {
    if (!item || !Array.isArray(item.yearData)) {
      return null;
    }

    // // Convert yearData strings/numbers into actual numbers
    // interface YearDataItem {
    //   yearData: (string | number)[];
    // }

    // const values: number[] = (item as YearDataItem).yearData
    //   .map((v: string | number) => Number(v))
    //   .filter((v: number) => !isNaN(v));

    // if (values.length === 0) return null;

    // Pick the latest year value (or you can loop all values if needed)
    // const latest = values[values.length - 1];

    const latest = item.yearData[item.yearData.length - 1]

    // console.log(latest, 'this is latest iscr');
    if (latest < 5) {
      return `${this.ulbName()}'s ISCR is significantly negative, as its Operating Surplus is insufficient to cover interest obligations.`;
    } else if (latest > 20) {
      return `${this.ulbName()}'s unusually high ISCR indicates either a low level of outstanding debt or a robust operating surplus.`;
    }

    return null; // no alert
  }
  private getIndicators(years: string[], ulbId: string, keyType: string): void {
    this._globalLoaderService.showLoader();
    this.isWarningMessage = false;

    if (!isPlatformBrowser(this.platformId)) return;

    this._dashboardService.getMarketDashboardIndicators(ulbId, keyType, years).subscribe({
      next: (data) => {
        this.marketData = data
        const dataSource = data.response.data;
        this.dataSource.set(dataSource);

        // TODO: clean the code. get warning msg from API?
        if (keyType === 'debt' && Array.isArray(dataSource) && dataSource.length > 0) {
          const totalDebt = dataSource.find((i: any) => i?.name === 'Total Debt (Cr)');
          const dar = dataSource.find((i: any) => i?.name === 'Debt to Asset Ratio');
          const iscr = dataSource.find(
            (item: any) => item?.name?.trim?.() === 'Interest Service Coverage Ratio (ISCR)'
          );

          const iscrAlert = this.checkISCR(iscr);

          if (iscrAlert) {
            this.isWarningMessage = true;
            this.warningMessage = iscrAlert;
          }

          if (this.hasNA(totalDebt)) {
            this.isWarningMessage = true;
            this.warningMessage = `Since ${this.ulbName()} has reported no outstanding debt in its annual financial statements, all debt-related indicators have not been computed.`;
          }

          if (this.hasExactZero(dar)) {
            this.isWarningMessage = true;
            this.warningMessage = `${this.ulbName()}'s debt-to-asset ratio is effectively zero, as its outstanding debt is negligible relative to its asset base.`;
          }
        } else if (keyType === 'expenditure') {
          const capex = dataSource
            .find((i: any) => i.name === "Total Expenditure (Cr)")
            .children[1]
            .yearData;

          const len = capex.length;
          if (capex[len - 1] === 'N/A' || capex[len - 2] === 'N/A') {
            this.isWarningMessage = true;
            this.warningMessage = `Since ${this.ulbName()} has not reported capital expenditure in its annual financial statements, all capex-related indicators have not been calculated.`;
          }
        }
        // console.log(this.dataSource(), 'this is daaaa')
        this.buttonClicked(dataSource[1]);

        // this.yearArr = this.dataSource()[0];
        this.intro = this.marketData.response.intro
        this.source = this.marketData.source;
        this._globalLoaderService.hideLoader();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this._globalLoaderService.hideLoader();
      }
    });
  }
  // Download chart as img.
  downloadImg(selectedIndicator: string = 'CityPageChart') {
    this._globalLoaderService.showLoader();

    setTimeout(() => {
      const chartContainer = document.getElementById('chartContainer');
      if (!chartContainer) return;

      // Create the outer div
      const cfLogo = document.createElement('div');
      cfLogo.className = 'cfLogo text-end';

      // Inject the inner HTML
      cfLogo.innerHTML = `
      <span class="fw-bold custom-font-size-6 text-shadow-custom text-info">city</span><span class="fw-bold custom-font-size-6 text-shadow-custom text-cfSecondary">finance.in</span>
    `;

      // Append to chart container
      chartContainer.appendChild(cfLogo);

      const elementsToHide = chartContainer.querySelectorAll('.hide-while-download');
      elementsToHide.forEach(el => (el as HTMLElement).style.visibility = 'hidden');

      // Wait briefly to render new DOM changes
      setTimeout(() => {
        html2canvas(chartContainer)
          .then(canvas => {
            // Remove logo divs
            chartContainer.querySelectorAll('.cfLogo').forEach(el => el.remove());
            elementsToHide.forEach(el => (el as HTMLElement).style.visibility = 'visible');
            // Download the image
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${selectedIndicator}.png`;
            link.click();
          })
          .catch(err => {
            chartContainer.querySelectorAll('.cfLogo').forEach(el => el.remove());
            elementsToHide.forEach(el => (el as HTMLElement).style.visibility = 'visible');
            console.error('Error capturing chart:', err);
          })
          .finally(() => {
            this._globalLoaderService.hideLoader();
          });
      }, 100);
    }, 0);
  }

  // Download Excel
  downlaodExcel() {
    console.log(this.dataSource())

    // Create columns array.
    const columns = [];
    const obj = this.dataSource()[0];
    columns.push({ header: obj.name, key: obj.name, width: 39, style: DEFAULT_STYLES });
    obj.yearData.forEach((year: string) => {
      columns.push({ header: year, key: year, width: 14, style: DEFAULT_STYLES })
    })

    // Create rows array.
    const dataArr = this.dataSource().slice(1);
    const rows = this.createRowsStructure(dataArr, obj['yearData']);

    const payload: CreateExcelParams = {
      addLogo: true,
      addContactUsNote: true,
      fileName: `CityFinance_${this.ulbName()}_${this.chartData().chartId}`,
      sheetName: this.chartData().chartId,
      rows,
      columns,
      header: { index: 5, fontSize: 11, fontFamily: 'Aptos' },
      // rows: [
      //   {
      //     'Indicators': "Total Expenditure to Total Revenue (%)",
      //     '2019-20': "N/A",
      //     '2020-21': 81.39,
      //     '2021-22': 76.71,
      //   },
      //   {
      //     'Indicators': "Own Source Revenue to Total Revenue (%)",
      //     '2019-20': 83.28,
      //     '2020-21': 76.73,
      //     '2021-22': 70.28,
      //   },
      //   {
      //     'Indicators': "Grants to Total Revenue (%)",
      //     '2019-20': 16.72,
      //     '2020-21': 23.27,
      //     '2021-22': 29.36,
      //   },
      //   {
      //     'Indicators': "Own Source Revenue to Total Expenditure (%)",
      //     '2019-20': "N/A",
      //     '2020-21': 106.08,
      //     '2021-22': 109.14,
      //   },
      // ],
      // columns: [
      //   { header: 'Indicators', key: 'Indicators', width: 39, style: DEFAULT_STYLES, },
      //   { header: '2019-20', key: '2019-20', width: 14, style: DEFAULT_STYLES, },
      //   { header: '2020-21', key: '2020-21', width: 14, style: DEFAULT_STYLES, },
      //   { header: '2021-22', key: '2021-22', width: 14, style: DEFAULT_STYLES, },
      // ],
    }

    this._uitityService.createExcel(payload)
  }

  // Helper: create excel dump - rows structure
  private createRowsStructure(dataArr: any[], yearsArr: string[]) {
    const rows: any[] = [];

    const _createRowsStructure = (dataList: any[], spacer = "") => {
      dataList.forEach((data: any) => {
        const tempObj: any = { Indicators: `${spacer}${data.name}`, width: 14 };

        yearsArr.forEach((year: string, idx: number) => {
          let amt = data.yearData?.[idx];
          const growthPerc = data.yearGrowth?.[idx];

          // If amt is string and has comma - remove comma.
          if (typeof amt === 'string') { amt = amt.replace(/,/g, ''); }

          // If amt is number but in string foramt - convert it into number.
          if (!isNaN(amt)) { amt = +amt; }
          // console.log(isNaN(amt), amt)

          // If growthPerc is available include it.
          if (growthPerc !== undefined && growthPerc !== null && growthPerc !== 'N/A') {
            tempObj[year] = `${amt} (${growthPerc}%)`;
          } else {
            tempObj[year] = amt;
          }
        });

        rows.push(tempObj);

        // Recurse into children if available
        if (data.children && data.children.length > 0) {
          _createRowsStructure(data.children, "    - ");
        }
      });
    };

    _createRowsStructure(dataArr);

    return rows;
  }


  // Show info alert.
  showInfoAlert() {
    Swal.fire({
      html: `${this.infoData()}`, // Use 'html' instead of 'text' to render raw HTML
      confirmButtonText: 'Close',
      confirmButtonColor: '#3085d6',
      width: '600px',  // Optional: Adjust the width of the modal
      padding: '3em'   // Optional: Add some padding to make the content look better
    });
  }

  expandedIndex: number | null = null;

  toggle(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}

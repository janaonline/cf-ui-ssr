import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { environment } from '../../../../environments/environment';
import { IULB } from '../../../core/models/ulb';
import { ulbType } from '../../../core/models/ulbTypes';
import { CommonService } from '../../../core/services/common.service';
import { NoDataFound } from "../../../shared/components/no-data-found/no-data-found";
import { PreLoader } from "../../../shared/components/pre-loader/pre-loader";
import { FinancialIndicator } from '../city/financial-indicator/financial-indicator';
const MESSAGE = "Revenue Dashboard cannot be viewed as the Annual Financial Statements are not standardized from FY 2019-20 onwards.";

@Component({
  selector: 'app-ulb-dashboard',
  imports: [FinancialIndicator, NoDataFound, PreLoader],
  templateUrl: './ulb-dashboard.html',
  styleUrl: './ulb-dashboard.scss'
})
export class UlbDashboard {
  message = signal("");
  redirectionUrl = signal<string>(`${environment.v1Url}/ulb-form/606aafda4dff55e6c075d48f/overview `);
  ulb = signal<Partial<IULB>>({
    _id: '',
    code: '',
    name: '',
    type: ulbType['municipality'],
  });
  ulbId = signal<string>('');
  showDashboard = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  indicatorName = signal<string>('revenue');
  private destroy$ = new Subject<void>();
  ledgerYears = signal<string[]>([]);

  constructor(
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.ulbId.set(params.get('ulbId') || '');
        this.indicatorName.set(params.get('indicatoName') || 'revenue');
        this.getLedgerYears(this.ulbId());
        this.getUlbData(this.ulbId());
      })
  }

  private getLedgerYears(ulbId: string) {
    this.commonService.getLedgerYears('', ulbId).subscribe({
      next: (res) => {
        this.ledgerYears.set(res.ledgerYears);
        this.showDashboard.set(this.showDashboardFn(res.ledgerYears));

        if (!this.showDashboard()) this.message.set(MESSAGE);
      },
      error: () => console.error("Failed to get years."),
    })

  }

  // Set ulb data.
  private getUlbData(ulbId: string) {
    this.commonService.getCityData('', ulbId).subscribe({
      next: (res) => {
        if (res) {
          const ulbObj: Partial<IULB> = {
            _id: res.ulbId,
            name: res.ulbName,
            type: res.ulbType,
          }
          this.ulb.set(ulbObj);
          this.isLoading.set(false);
        }
      },
      error: () => {
        console.error("Failed to fetch data.");
        this.message.set(MESSAGE);
        this.isLoading.set(false);
      }
    })
  }

  // Show Dashobard if 2019-20 onwards data is available.
  showDashboardFn(ledgerYears: string[]): boolean {
    if (ledgerYears.length === 0) return false;
    return !(ledgerYears.every((year) => +year.split("-")[0] < 2019));
  }

  sendRequest() {
    window.open("https://tally.so/r/3jKOL6", "_blank", "noopener,noreferrer");
    return;
  }

  registerNow() {
    // window.open("https://tally.so/r/mBvPZA", "_blank", "noopener,noreferrer");
    window.open("https://tally.so/r/PdpVEV", "_blank", "noopener,noreferrer");
    return;
  }

}


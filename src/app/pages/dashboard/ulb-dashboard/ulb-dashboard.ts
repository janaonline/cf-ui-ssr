import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { environment } from '../../../../environments/environment';
import { IULB } from '../../../core/models/ulb';
import { ulbType } from '../../../core/models/ulbTypes';
import { CommonService } from '../../../core/services/common.service';
import { FinancialIndicator } from '../city/financial-indicator/financial-indicator';
import { NoDataFound } from "../../../shared/components/no-data-found/no-data-found";

@Component({
  selector: 'app-ulb-dashboard',
  imports: [FinancialIndicator, NoDataFound],
  templateUrl: './ulb-dashboard.html',
  styleUrl: './ulb-dashboard.scss'
})
export class UlbDashboard {
  redirectionUrl = signal<string>(`${environment.v1Url}/ulb-form/606aafda4dff55e6c075d48f/overview `);
  ulb = signal<IULB>({
    location: {
      lat: null,
      lng: null
    },
    amrut: undefined,
    isActive: false,
    _id: '',
    area: 0,
    code: '',
    name: '',
    natureOfUlb: '',
    population: 0,
    type: ulbType['municipality'],
    wards: 0,
    state: '',
    financialYear: ''
  });
  ulbId = signal<string>('');
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
        this.indicatorName.set(params.get('indicatorName') || 'revenue');
        this.getLedgerYears(this.ulbId());
        this.getUlbData(this.ulbId());
      })
  }

  private getLedgerYears(ulbId: string) {
    this.commonService.getLedgerYears('', ulbId).subscribe({
      next: (res) => {
        this.ledgerYears.set(res.ledgerYears);
      },
      error: () => console.error("Failed to get years."),
    })

  }

  // Set ulb data.
  private getUlbData(ulbId: string) {
    this.commonService.getCityData('', ulbId).subscribe({
      next: (res) => {
        if (res) {
          const ulbObj: IULB = {
            _id: res.ulbId,
            name: res.ulbName,
            type: res.ulbType,
            location: {
              lat: null,
              lng: null
            },
            amrut: undefined,
            isActive: false,
            area: 0,
            code: '',
            natureOfUlb: '',
            population: 0,
            wards: 0,
            state: '',
            financialYear: ''
          }
          this.ulb.set(ulbObj)
        }
      },
      error: () => console.error("Failed to fetch data.")
    })
  }

  sendRequest() {
    window.open("https://tally.so/r/3jKOL6", "_blank", "noopener,noreferrer");
    return;
  }

  registerNow() {
    window.open("https://tally.so/r/mBvPZA", "_blank", "noopener,noreferrer");
    return;
  }

}


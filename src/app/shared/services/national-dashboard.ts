import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, makeStateKey, PLATFORM_ID, signal, TransferState } from '@angular/core';
import { CreditRatingMap, ICreditRatingData } from '../../core/models/creditRating/creditRatingResponse';
import { ExploreSectionResponse, ExploresectionTable } from '../../core/models/interfaces';
import { AssetsService } from '../../core/services/assets/assets.service';
import { CommonService } from '../../core/services/common.service';

const GRID_DATA_KEY = makeStateKey<any>('fetchExploreSectionData');
const CREDIT_RATINGS_KEY = makeStateKey<any>('creditRatings');

@Injectable({
  providedIn: 'root'
})
export class NationalDashboard {
  page = signal<string>('');
  getUlbData = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  exploreData = signal<{
    gridDetails: ExploresectionTable[];
    lastModifiedAt: string | null;
  }>({ gridDetails: [], lastModifiedAt: null });
  creditRating = signal<CreditRatingMap>({});
  totalCreditRating: number = 0;
  cr_above_BBB_minus: number = 0;
  cr_above_a: number = 0;
  private readonly ELIGIBLE_RATINGS = [
    'A',
    'A+',
    'AA',
    'AA+',
    'AA-',
    'AAA',
    'AAA+',
    'AAA-',
    'A-',
    'BBB',
    'BBB+',
    'BBB-',
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState,
    private _commonService: CommonService,
    private assetService: AssetsService,
  ) { }

  fetchCreditRatingsData(page: string, getUlbData: boolean = false): void {
    this.isLoading.set(true);
    this.page.set(page);
    this.getUlbData.set(getUlbData);

    this.assetService
      .fetchCreditRatingReport()
      .subscribe({
        next: (res: ICreditRatingData[]) => {
          const computedData = this.computeRatings(res);
          this.creditRating.set(computedData);

          if (isPlatformServer(this.platformId)) {
            this.transferState.set(CREDIT_RATINGS_KEY, computedData);
          }

          this.isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error fetching credit rating report:', error);
          this.isLoading.set(false);
        },
        complete: () => this.updateRatingSummary(),
      });
    // }
  }

  // Helper: Compute total, creditRatingAboveBBB_Minus count.
  private computeRatings(res: ICreditRatingData[]): CreditRatingMap {
    const computedData: CreditRatingMap = {
      India: { total: 0, creditRatingAboveBBB_Minus: 0 },
    };

    for (const data of res) {
      const stateName = data.state;
      const rating = data.creditrating;

      if (!computedData[stateName]) {
        computedData[stateName] = { total: 0, creditRatingAboveBBB_Minus: 0 };
      }

      computedData[stateName]['total'] += 1;
      computedData['India']['total'] += 1;

      if (this.ELIGIBLE_RATINGS.includes(rating)) {
        computedData[stateName]['creditRatingAboveBBB_Minus'] += 1;
        computedData['India']['creditRatingAboveBBB_Minus'] += 1;
      }
    }

    return computedData;
  }

  // Helper: Update credit ratings summary.
  updateRatingSummary(stateCode: string = '', stateId: string = ''): void {
    const ratingData = this.creditRating()['India'] || {
      total: 0,
      creditRatingAboveBBB_Minus: 0,
    };

    this.totalCreditRating = ratingData['total'];
    this.cr_above_BBB_minus = ratingData['creditRatingAboveBBB_Minus'];
    this.fetchExploreSectionData(stateCode, stateId);
  }

  fetchExploreSectionData(stateCode: string = '', stateId: string = ''): void {
    this.isLoading.set(true);
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(GRID_DATA_KEY)
    ) {
      this.exploreData.set(this.transferState.get(GRID_DATA_KEY, []));
      this.transferState.remove(GRID_DATA_KEY);
      this.isLoading.set(false);
    } else {
      this._commonService
        .getExploreSectionData(stateCode, stateId)
        .subscribe({
          next: (res: ExploreSectionResponse) => {
            let result: any = [
              ...res.gridDetails,
              {
                sequence: 3,
                label: 'ULBs Credit Rating Reports',
                value: `${this.totalCreditRating}`,
                info: '',
                src: '',
              },
              {
                sequence: 4,
                label: 'ULBs With Investment Grade Rating',
                value: `${this.cr_above_BBB_minus}`,
                info: '',
                src: '',
              },
            ];
            result.sort((a: any, b: any) => a.sequence - b.sequence);

            if (this.page() === 'national') {
              const obj = {
                sequence: 5,
                label: 'ULBs With Rating A & Above',
                value: `${this.cr_above_a}`,
                info: '',
                src: ''
              }
              result[4] = obj;
            }

            // Ticker above search bar - homepage.
            this._commonService.setDataForVisualizationCount(
              result[0].value?.toString()
            );

            this.isLoading.set(false);

            const expRes = { gridDetails: result, lastModifiedAt: res.lastModifiedAt };
            if (isPlatformServer(this.platformId)) {
              this.transferState.set(GRID_DATA_KEY, expRes);
            }

            this.exploreData.set(expRes);
          },
          error: (error: any) => console.error('Error in loading explore section data: ', error),
        });
    }
  }
}

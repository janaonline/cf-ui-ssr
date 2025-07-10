import { isPlatformBrowser, TitleCasePipe } from '@angular/common';
import {
  Component,
  Inject,
  makeStateKey,
  PLATFORM_ID,
  signal,
  TransferState,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CountUpDirective } from '../../../core/directives/countup.directive';
import { CommonService } from '../../../core/services/common.service';
import { ResourcesDashboardService } from '../../../core/services/resources-dashboard.service';

const ULB_COUNT_KEY = makeStateKey<number>('ulbCount');

@Component({
  standalone: true,
  selector: 'app-search-bar',
  imports: [
    // MaterialModule,
    TitleCasePipe,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    CountUpDirective,
  ],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  globalFormControl = new FormControl();
  globalOptions = [];
  noDataFound = false;
  // recentSearchArray: any = [];
  // filteredOptions: any = [];
  filteredOptions = signal<any[]>([]);
  postBody: any;
  stopNavigation: any;
  readonly DEFAULT_VALUE = 4000;
  coveredUlbCount = signal<number>(this.DEFAULT_VALUE);

  recentSearchArray = [
    {
      isActive: true,
      type: 'ulb',
      __v: 0,
      count: 1,
      createdAt: '2022-06-18T01:43:12.527Z',
      modifiedAt: '2022-06-18T01:43:12.527Z',
      name: 'Bruhat Bengaluru Mahanagara Palike',
      _id: '5f5610b3aab0f778b2d2cac0',
    },
    {
      isActive: true,
      type: 'ulb',
      __v: 0,
      count: 1,
      createdAt: '2022-03-30T02:21:07.299Z',
      modifiedAt: '2022-03-30T02:21:07.299Z',
      name: 'Greater Hyderabad Municipal Corporation',
      _id: '5eb5844f76a3b61f40ba069a',
    },
    {
      isActive: true,
      type: 'ulb',
      __v: 0,
      count: 1,
      createdAt: '2021-12-23T05:30:46.475Z',
      modifiedAt: '2021-12-23T05:30:46.475Z',
      name: 'Greater Mumbai Municipal Corporation',
      _id: '5eb5844f76a3b61f40ba0695',
    },
  ];
  private destroy$ = new Subject<void>();
  v1Url = environment.v1Url;

  constructor(
    protected _commonService: CommonService,
    private router: Router,
    public resourceDashboard: ResourcesDashboardService,
    @Inject(PLATFORM_ID) private platFormId: Object,
    private transferState: TransferState
  ) {
    // this.resourceDashboard.getPdfData(this.pdfInput).subscribe((res: any) => {
    //   const response = res?.data.map((elem: any) => {
    //     elem.createdAt = elem.createdAt.split("T")[0]
    //     return elem
    //   })
    //   //  console.log("response", response)
    //   // Commented for updating the order
    //   // this.whatNewData = response
    // }, (err: any) => {
    //   // this.whatNewData = []
    // })
  }

  ngOnInit() {
    // this.loadRecentSearchValue();
    this.globaSearch();
    this.getCoverULBCount();
  }

  getCoverULBCount(): void {
    // --- TransferState check for client-side hydration ---
    if (
      isPlatformBrowser(this.platFormId) &&
      this.transferState.hasKey(ULB_COUNT_KEY)
    ) {
      // Retrieve and set data from transfer state.
      this.coveredUlbCount.set(this.transferState.get(ULB_COUNT_KEY, 0));

      // Remove keys to avoid leaks.
      this.transferState.remove(ULB_COUNT_KEY);

      return;
    }

    // Get the number.
    this._commonService.dataForVisualizationCount
      .pipe(take(1))
      .subscribe((res) => {
        if (this.coveredUlbCount() === this.DEFAULT_VALUE)
          this.coveredUlbCount.set(res);
      });
  }

  searchKey: string = '';
  globaSearch() {
    this.globalFormControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
        filter((value) => value.length > 1),
        switchMap((query) => {
          this.searchKey = query.trim();
          if (!this.searchKey?.trim()) {
            this.filteredOptions.set([]);
            this.noDataFound = false;
            return of([]);
          }

          return this._commonService
            .postGlobalSearchData(query.trim(), '', '')
            .pipe(catchError(() => of([])));
        })
      )
      .subscribe((res: any) => {
        console.log('global search data', res.data);
        this.filteredOptions.set(res.data || []);
        this.noDataFound = this.filteredOptions().length === 0;
      });
  }

  // loadRecentSearchValue() {
  //   this._commonService.getRecentSearchValue().subscribe(
  //     (res: any) => {
  //  console.log('recent search value', res);

  //  for(let i=0; i<3; i++){
  //    let obj = {
  //      _id: res?.data[i]?._id,
  //      name: res?.data[i]?.name,
  //      type: 'ulb'
  //    }
  //    this.recentSearchArray[i] = obj ;

  //  }
  // this.recentSearchArray = res?.data;
  // console.log('ser array', this.recentSearchArray)
  // },
  // (error: any) => {
  //   console.log('recent search error', error)
  //     },
  //   );
  // }

  globalSearchClick() {
    //  console.log('filterOptions', this.filteredOptions)
    //  console.log('form control', this.globalFormControl.value)

    const searchArray: any = this.filteredOptions();
    const searchValue = searchArray.find(
      (e: any) =>
        e?.name.toLowerCase() == this.globalFormControl?.value.toLowerCase()
    );
    //  console.log(searchValue);
    if (!searchValue) return;

    if (searchValue?.type == 'keyWord') {
      this._commonService.updateSearchItem(this.globalFormControl.value);
      const option = {
        type: 'searchKeyword',
        _id: '',
      };
      this.dashboardNav(option);
    }

    // let postBody = {
    //   type: searchValue.type,
    //   searchKeyword: searchValue._id
    // }

    const type = searchValue?.type;
    this.checkType(type);
    this._commonService
      .postRecentSearchValue(this.postBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          //    console.log('serach res', res)
        },
        (error: any) => {
          //   console.log(error)
        }
      );
    const option = {
      type: searchValue.type,
      _id: searchValue._id,
    };
    this.dashboardNav(option);
  }

  dashboardNav(option: any) {
    //console.log('option', option)
    this.checkType(option);
    if (option.type != 'searchKeyword')
      this._commonService
        .postRecentSearchValue(this.postBody)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            // console.log('serach res', res)
          },
          (error: any) => {
            // console.log(error)
          }
        );
    //console.log('option', option)

    if (option.type == 'state') {
      this.getYears(option);
      // this.router.navigateByUrl(`/dashboard/state?stateId=${option._id}`)
      window.location.href = `${this.v1Url}/dashboard/state?stateId=${option._id}`;
    }

    if (option.type == 'ulb') {
      this.router.navigateByUrl(`/dashboard/city/${option._id}`);
    }

    if (option.type == 'searchKeyword') {
      this.router.navigateByUrl(
        `/resources-dashboard/learning-center/toolkits`
      );
    }
  }

  checkType(searchValue: any) {
    const type = searchValue?.type;
    if (type == 'ulb') {
      this.postBody = {
        type: searchValue.type,
        ulb: searchValue._id,
      };
    }
    if (type == 'state') {
      this.postBody = {
        type: searchValue.type,
        state: searchValue._id,
      };
    }
    if (type == 'searchKeyword') {
      this.postBody = {
        type: searchValue.type,
        searchKeyword: searchValue._id,
      };
    }
  }

  getYears(searchStateId: any) {
    const paramContent: any = {
      state: searchStateId._id,
    };
    // console.log('paramContent', paramContent)
    const financialYearList: any = [];
    const promise = new Promise((resolve, reject) => {
      this._commonService
        .getStateWiseFYs(paramContent)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res && res.success) {
              resolve(
                res['data'] && res['data']['FYs'] ? res['data']['FYs'] : []
              );
            }
          },
          (err: { message: string }) => {
            console.log(err.message);
          }
        );
    });
    financialYearList.push(promise);
    Promise.all(financialYearList).then((value) => {
      // console.log('financialYearList', value);
      const yearList = value && value.length ? value[0] : [];
      this.stopNavigation = yearList;
      sessionStorage.setItem('financialYearList', JSON.stringify(yearList));
      this.router.navigateByUrl(
        `/dashboard/state?stateId=${searchStateId._id}`
      );
      // if(searchStateId?.type == 'state'){
      //   this.router.navigateByUrl(`/dashboard/state?stateId=${searchStateId._id}`)
      // }
    });
  }

  ngDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

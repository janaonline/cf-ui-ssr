import { Component, Inject, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, filter, of, Subject, switchMap, takeUntil } from 'rxjs';
import { IULB } from '../../../../../core/models/ulb';
import { CommonService } from '../../../../../core/services/common.service';
import { UtilityService } from '../../../../../core/services/utility-service';
import { MaterialModule } from '../../../../../material.module';
import { PreLoader } from "../../../../../shared/components/pre-loader/pre-loader";
import { CompareByDialog } from '../../financial-indicator/compare-by-dialog/compare-by-dialog';

@Component({
  selector: 'app-compare-by',
  imports: [MatDialogActions, MaterialModule, PreLoader],
  templateUrl: './compare-by.html',
  styleUrl: './compare-by.scss'
})
export class CompareBy {
  myForm!: FormGroup;
  citiesArr: IULB[] = [];
  readonly filteredUlbs = signal<IULB[]>([]);
  readonly noDataFound = signal<boolean>(false);
  private destroy$ = new Subject<void>();
  years = signal([]);

  constructor(
    private commonService: CommonService,
    private utilityService: UtilityService,
    private _snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CompareByDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
    this.myForm = new FormGroup({
      ulbName: new FormControl(''),
      years: new FormControl([]),
    })

    this.addDefaultUlb();
    this.setupSearchEffect();
    this.years.set(this.data.years)
    // console.log("dialog data = ", this.data)
  }

  // Add selected ULB to arr.
  private addDefaultUlb() {
    this.citiesArr = [];
    const ulbName = this.data.selectedUlb.ulbName;
    const ulbId = this.data.selectedUlb.ulbId;
    this.citiesArr.push({ name: ulbName, _id: ulbId } as IULB);
  }

  // TODO: use city-search compoent instead of this.
  // When user types in ulb search box.
  private setupSearchEffect(): void {
    this.myForm.get('ulbName')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        distinctUntilChanged(),
        filter((value) => value.length > 1),
        switchMap((value) => {
          if (!value?.trim()) {
            this.noDataFound.set(false);
            return of([]);
          }
          return this.commonService.postGlobalSearchData(
            value.trim(),
            'ulb',
            ''
          );
        })
      )
      .subscribe({
        next: (res: any) => {
          const ulbs = res?.['data'] ?? [];
          this.filteredUlbs.set(ulbs);
          this.noDataFound.set(ulbs.length === 0);
        },
        error: (err) => {
          console.error('Error fetching ULBs:', err);
          this.filteredUlbs.set([]);
          this.noDataFound.set(true);
        },
      });
  }

  // Add city to search arr.
  onCitySelection(city: IULB): void {
    if (this.validateUlbsArr(city)) {
      this.citiesArr.push(city);
      this.myForm.get('ulbName')?.patchValue('');
    }
  }

  validateUlbsArr(city: IULB = {} as IULB): boolean {
    // Check for duplicates.
    const idx = this.citiesArr.findIndex(e => e._id === city._id);
    if (idx !== -1) {
      this.utilityService.triggerSnackbar(`ULB already selected!`, 'snackbar-danger');
      return false;
    }
    // Allow only 3 ulbs.
    else if (this.citiesArr.length === 3) {
      this.utilityService.triggerSnackbar(`Maximum of 3 ULBs can be selected!`, 'snackbar-danger');
      this.myForm.get('ulbName')?.patchValue('');
      return false;
    }
    return true;
  }

  // Remove searched city.
  removeCity(city: IULB) {
    const idx = this.citiesArr.findIndex(e => e._id == city._id);
    this.citiesArr.splice(idx, 1);
  }

  private getYears() {
    return this.myForm.get('years')?.value;
  }

  // Validate data
  validatePopupData(): boolean {
    const years = this.getYears();

    // Atleast 1 ULB must be selected.
    if (this.citiesArr.length < 2) {
      this.utilityService.triggerSnackbar(`Atleast 1 ULB must be selected!`, 'snackbar-danger');
      return false;
    }
    // Atleast 1 year must be selected.
    else if (years.length < 1) {
      this.utilityService.triggerSnackbar(`Atleast 1 Year must be selected!`, 'snackbar-danger');
      return false;
    }
    // Allow only 3 years.
    else if (years.length > 3) {
      this.utilityService.triggerSnackbar(`Maximum of 3 Years can be selected!`, 'snackbar-danger');
      return false;
    }

    return true;
  }

  // When Apply or Reset is clicked.
  filterSelected(key: string = '') {
    if (key === 'reset') {
      this.addDefaultUlb();
    } else {
      if (this.validatePopupData()) {
        const payload = { citiesArr: this.citiesArr, years: this.getYears() };
        this.dialogRef.close(payload)
      }
    }
  }

}
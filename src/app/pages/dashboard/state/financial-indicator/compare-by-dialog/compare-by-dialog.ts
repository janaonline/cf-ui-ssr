import { Component, Inject, input, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, filter, of, Subject, switchMap, takeUntil } from 'rxjs';
import { FinancialIndicatorsCompareByPaylod } from '../../../../../core/models/interfaces';
import { IULB } from '../../../../../core/models/ulb';
import { CommonService } from '../../../../../core/services/common.service';
import { MaterialModule } from "../../../../../material.module";
import { UtilityService } from '../../../../../core/services/utility-service';
import { CitySearch } from '../../../../../shared/components/city-search/city-search';

@Component({
  selector: 'app-compare-by-dialog',
  imports: [MatDialogActions, MaterialModule, CitySearch],
  templateUrl: './compare-by-dialog.html',
  styleUrl: './compare-by-dialog.scss'
})
export class CompareByDialog {
  myForm!: FormGroup;
  citiesArr: IULB[] = [];
  readonly filteredUlbs = signal<IULB[]>([]);
  readonly noDataFound = signal<boolean>(false);
  private destroy$ = new Subject<void>();
  ulbName: string = '';

  // readonly stateDetails = input.required<any>();

  constructor(
    private commonService: CommonService,
    private utilityService: UtilityService,
    private _snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CompareByDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {

    // Keep selected values as is.
    if (this.data.compareUlbsObj?.length) this.citiesArr = this.data.compareUlbsObj;

    this.myForm = new FormGroup({
      ulbName: new FormControl(''),
    })

    this.setupSearchEffect();
  }


  // Value sent by child to parent.
  onUlbSelected = (ulbObj: IULB): void => {
    // Allow only 3 ulbs.
    if (this.citiesArr.length === 3) {
      this.utilityService.triggerSnackbar(`Maximum of 3 ULBs can be selected!`, 'snackbar-warn');
      this.myForm.get('ulbName')?.patchValue('')
      return;
    }

    // Check for duplicates.
    const idx = this.citiesArr.findIndex(e => e._id === ulbObj._id);
    if (idx !== -1) {
      this.utilityService.triggerSnackbar(`ULB already selected!`, 'snackbar-danger');
      this.myForm.get('ulbName')?.patchValue('')
      return;
    }

    this.citiesArr.push(ulbObj);
    this.myForm.get('ulbName')?.patchValue('')
    this.ulbName = '';
  };

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
    // Allow only 3 ulbs.
    if (this.citiesArr.length === 3) {
      // this.utilityService.triggerSnackbar(`Maximum of 3 ULBs can be selected!`, 'snackbar-warn');
      this.myForm.get('ulbName')?.patchValue('')
      return;
    }

    // Check for duplicates.
    const idx = this.citiesArr.findIndex(e => e._id === city._id);
    if (idx !== -1) {
      this.utilityService.triggerSnackbar(`ULB already selected!`, 'snackbar-danger');
      this.myForm.get('ulbName')?.patchValue('')
      return;
    }

    this.citiesArr.push(city);
    this.myForm.get('ulbName')?.patchValue('')
  }

  // Remove searched city.
  removeCity(idx: number) {
    // console.log('remove:', idx)
    this.citiesArr.splice(idx, 1);
  }

  // When Apply or Reset is clicked.
  filterSelected(key: string = '') {
    if (key === 'reset') {
      this.citiesArr = [];
    } else {
      const payload: FinancialIndicatorsCompareByPaylod = { compareType: this.myForm.get('compareType')?.value };
      const ulbIds = this.citiesArr.map(e => e._id);
      if (ulbIds.length) {
        payload['compareType'] = 'ulbs';
        payload['compareUlbs'] = ulbIds;
        payload['compareUlbsObj'] = this.citiesArr;
      }
      console.log('payload', payload)
      this.dialogRef.close(payload)
    }
  }

}

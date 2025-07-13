import { Component, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, filter, of, Subject, switchMap, takeUntil } from 'rxjs';
import { IULB } from '../../../../../core/models/ulb';
import { CommonService } from '../../../../../core/services/common.service';
import { MaterialModule } from "../../../../../material.module";

interface ResPayload {
  compareType: 'state' | 'national' | 'popCat' | 'ulbType' | 'ulbs'
  ulbs?: string[]
}

@Component({
  selector: 'app-compare-by-dialog',
  imports: [MatDialogActions, MaterialModule],
  templateUrl: './compare-by-dialog.html',
  styleUrl: './compare-by-dialog.scss'
})
export class CompareByDialog {
  readonly radioOptions = [
    { key: 'state', label: 'State Average' },
    { key: 'national', label: 'National Average' },
    { key: 'popCat', label: 'Population Category Average' },
    { key: 'ulbType', label: 'ULB Type Average' },
  ];
  myForm!: FormGroup;
  citiesArr: IULB[] = [];
  readonly filteredUlbs = signal<IULB[]>([]);
  readonly noDataFound = signal<boolean>(false);
  private destroy$ = new Subject<void>();

  constructor(
    private commonService: CommonService,
    private _snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CompareByDialog>,
  ) { }

  ngOnInit() {
    this.myForm = new FormGroup({
      compareType: new FormControl(this.radioOptions[0].key),
      ulbName: new FormControl(''),
    })

    this.myForm.get('compareType')?.valueChanges.subscribe({
      next: (newValue) => console.log("Compare value changed: ", newValue)
    })
    this.setupSearchEffect();
  }

  get getSelectedCompareType() {
    return this.myForm.get('compareType')?.value;
  }

  // Value sent by child to parent.
  onUlbSelected = (ulbObj: IULB): void => {
    this.citiesArr.push(ulbObj);
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
      this.triggerSnackbar(`Maximum of 3 ULBs can be selected!`);
      this.myForm.get('ulbName')?.patchValue('')
      return;
    }

    // Check for duplicates.
    const idx = this.citiesArr.findIndex(e => e._id === city._id);
    if (idx !== -1) {
      this.triggerSnackbar(`ULB already selected!`);
      this.myForm.get('ulbName')?.patchValue('')
      return;
    }

    this.citiesArr.push(city);
    this.myForm.get('ulbName')?.patchValue('')
    if (this.citiesArr.length > 0) this.myForm.patchValue({ 'compareType': this.radioOptions[0].key })
  }

  // Remove searched city.
  removeCity(idx: number) {
    // console.log('remove:', idx)
    this.citiesArr.splice(idx, 1);
  }


  triggerSnackbar(msg: string) {
    this._snackBar.open(msg, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 2000,
      // panelClass: ['snackbar-success']
      panelClass: ['custom-snackbar-success'],
    });
  }

  // When Apply or Reset is clicked.
  filterSelected(key: string = '') {
    if (key === 'reset') {
      this.citiesArr = [];
      this.myForm.patchValue({ 'compareType': this.radioOptions[0].key })
    } else {
      const payload: ResPayload = { compareType: this.myForm.get('compareType')?.value };
      const ulbIds = this.citiesArr.map(e => e._id);
      if (ulbIds.length) {
        payload['compareType'] = 'ulbs';
        payload['ulbs'] = ulbIds;
      }

      this.dialogRef.close(payload)
    }
  }

}

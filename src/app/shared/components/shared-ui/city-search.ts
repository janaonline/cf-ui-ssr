import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { IULB } from '../../../core/models/ulb';
import { CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'app-city-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatOptionModule],
  template: ` <form [formGroup]="myForm" class="d-flex gap-2">
    <input
      type="text"
      class="input-box-style"
      placeholder="Search for ULBs"
      matInput
      formControlName="ulbName"
      [matAutocomplete]="auto"
      id="ulbName"
    />
    <mat-autocomplete autoActiveFirstOption #auto="matAutocomplete">
      <mat-option
        *ngFor="let option of filteredUlbs()"
        [value]="option.name"
        (onSelectionChange)="onCitySelection(option)"
      >
        <small>{{ option.name }}</small>
      </mat-option>
      @if (noDataFound()) {
        <mat-option class="text-muted" disabled>No results found.</mat-option>
      }
    </mat-autocomplete>
  </form>`,
  styleUrls: [],
})
export class CitySearch implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  private destroy$ = new Subject<void>();

  readonly selectCity = input<(city: IULB) => void>();
  readonly cityName = input<string>('');
  readonly stateId = input<string>('');
  readonly isCityReadonly = input<boolean>(false);

  readonly myForm: FormGroup = this.fb.group({ ulbName: [''] });
  readonly noDataFound = signal<boolean>(false);
  readonly filteredUlbs = signal<IULB[]>([]);

  get ulbNameControl(): FormControl {
    return this.myForm.get('ulbName') as FormControl;
  }

  ngOnInit(): void {
    this.setupSearchEffect();
  }

  // When user types in ulb search box.
  private setupSearchEffect(): void {
    this.ulbNameControl.valueChanges
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
          return this.commonService.postGlobalSearchData(value.trim(), 'ulb', this.stateId());
        }),
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

  // If parent sends isCityReaonly then disable input box.
  readonly setupReadonlyEffect = effect(() => {
    this.isCityReadonly() ? this.ulbNameControl.disable() : this.ulbNameControl.enable();
  });

  // When parent sends ulb name - patch the value.
  private syncParentValueEffect = effect(() => {
    const name = this.cityName();
    this.myForm.patchValue({ ulbName: name }, { emitEvent: false });
    console.log('ULB name is sent from parent to child: ', this.cityName());
  });

  // Inform parent when option is selected from dropdown.
  onCitySelection(city: IULB): void {
    const callback = this.selectCity();
    if (callback) callback(city);
    console.log('ULB obj is sent from child to parent: ', city);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

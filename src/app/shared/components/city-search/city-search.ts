import { Component, effect, ElementRef, EventEmitter, inject, Input, input, OnDestroy, OnInit, Output, signal, ViewChild, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, filter, of, Subject, switchMap, takeUntil } from 'rxjs';
import { IULB } from '../../../core/models/ulb';
import { CommonService } from '../../../core/services/common.service';
import { MaterialModule } from "../../../material.module";
@Component({
  selector: 'app-city-search',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatOptionModule,
    MaterialModule
  ],
  templateUrl: './city-search.html',
  styleUrl: './city-search.scss',
})
export class CitySearch implements OnInit, OnDestroy {
  @ViewChild('cityInput') cityInput!: ElementRef<HTMLInputElement>;
  @Output() onUlbSelect = new EventEmitter<IULB>();
  @Input() resetOnChange: boolean = false;

  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  private destroy$ = new Subject<void>();

  readonly selectCity = input<(city: IULB) => void>();
  readonly cityName = input<string>('');
  readonly stateId = input<string>('');
  readonly isCityReadonly = input<boolean>(false);

  myForm: FormGroup = this.fb.group({ ulbName: [''] });
  readonly noDataFound = signal<boolean>(false);
  readonly filteredUlbs = signal<IULB[]>([]);

  get ulbNameControl(): FormControl {
    return this.myForm.get('ulbName') as FormControl;
  }
  clear(): void {
    this.ulbNameControl.reset('', { emitEvent: false });
    this.cityInput?.nativeElement.blur();
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
          return this.commonService.postGlobalSearchData(
            value.trim(),
            'ulb',
            this.stateId()
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

  // If parent sends isCityReaonly then disable input box.
  readonly setupReadonlyEffect = effect(() => {
    this.isCityReadonly()
      ? this.ulbNameControl.disable()
      : this.ulbNameControl.enable();
  });

  // When parent sends ulb name - patch the value.
  private syncParentValueEffect = effect(() => {
    const name = this.cityName();
    // console.log('City name from parent:', name);
    this.myForm.patchValue({ ulbName: name }, { emitEvent: false });
    if (name) {
      this.filteredUlbs.set([]);
    }
    // console.log('ULB name is sent from parent to child: ', this.cityName());
  });

  // Inform parent when option is selected from dropdown.
  onCitySelection(city: IULB): void {
    this.onUlbSelect.emit(city);
    const callback = this.selectCity();
    if (callback) callback(city);
    // console.log('this.myForm.value---', this.myForm.value);
    if (this.resetOnChange) {
      this.myForm.patchValue({ ulbName: '' }, { emitEvent: false });
      this.filteredUlbs.set([]);
      // console.log('after', this.myForm.value);
    }
    // console.log('ULB obj is sent from child to parent: ', city);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.setupReadonlyEffect?.destroy();
    this.syncParentValueEffect?.destroy();
  }
}

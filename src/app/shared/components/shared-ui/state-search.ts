import { AsyncPipe } from '@angular/common';
import { Component, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { IState } from '../../../core/models/state/state';
import { CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'app-state-search',
  standalone: true,
  imports: [MatAutocompleteModule, ReactiveFormsModule, AsyncPipe],
  template: ` <form [formGroup]="myForm" class="d-flex gap-2">
    <input
      type="text"
      placeholder="Search for State"
      matInput
      formControlName="stateName"
      id="stateName"
      [matAutocomplete]="auto"
      class="input-box-style"
      [class.custom-readonly-input]="isStateReadonly()"
      aria-label="Search for State"
    />
    <mat-autocomplete #auto="matAutocomplete" autoActiveFirstOption>
      @for (state of filteredStates | async; track $index) {
        <mat-option [value]="state.name" (onSelectionChange)="onStateSelection(state)">{{
          state.name
        }}</mat-option>
      }
      @if (noDataFound()) {
        <mat-option class="text-muted" disabled>No results found for your search.</mat-option>
      }
    </mat-autocomplete>
  </form>`,
  styles: [],
})
export class StateSearch implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);

  readonly selectState = input<(state: IState) => void>();
  readonly stateId = input<string>('');
  readonly stateName = input<string>('');
  readonly isStateReadonly = input<boolean>(false);

  private destroy$ = new Subject<void>();
  readonly myForm: FormGroup = this.fb.group({
    stateName: [{ value: '', disabled: false }],
  });

  readonly noDataFound = signal<boolean>(false);
  private stateList: IState[] = [];
  filteredStates: Observable<IState[]> = of([]);

  get stateNameControl(): FormControl {
    return this.myForm.get('stateName') as FormControl;
  }

  ngOnInit(): void {
    // Fetch the state list only if the state is not read-only (i.e., dropdown is needed)
    if (!this.isStateReadonly()) {
      this.loadStatesAndFilter();
    }
  }

  // Effect to manage formControl - disabled state/ patch value.
  readonly setupReadonlyEffect = effect(() => {
    const readonly = this.isStateReadonly();
    const currentName = this.stateName();
    if (readonly) {
      // If state is readony then directy patch value.
      this.stateNameControl.disable();
      if (this.stateNameControl.value !== currentName) {
        this.patchStateName(currentName);
      }
    } else {
      this.stateNameControl.enable();
    }
  });

  // Sync value sent by parent.
  readonly syncStateFromParentEffect = effect(() => {
    console.log('State id sent by parent to child: ', this.stateId());
    const id = this.stateId();

    if (id === '' && !this.isStateReadonly()) this.patchStateName('');
    else if (id && this.stateList.length) {
      const matched = this.stateList.find((state) => state._id === id);
      if (matched) this.patchStateName(matched.name);
    }
  });

  // Get states list.
  private loadStatesAndFilter(): void {
    this.commonService
      .fetchStateList()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.error('Failed to load states', err);
          return of([]);
        }),
      )
      .subscribe((states: IState[]) => {
        this.stateList = states;

        this.filteredStates = this.stateNameControl.valueChanges.pipe(
          startWith(this.stateNameControl.value || ''),
          debounceTime(300),
          distinctUntilChanged(),
          map((value) => {
            const filtered = this.filterStates(value || '');
            this.noDataFound.set(filtered.length === 0);
            return filtered;
          }),
        );
      });
  }

  // Helper: To filter states.
  private filterStates(value: string): IState[] {
    const searchValue = value.toLowerCase().trim();
    return this.stateList.filter((state) => state.name.toLowerCase().includes(searchValue));
  }

  // Option selected from child dropdown.
  onStateSelection(state: IState): void {
    const callback = this.selectState();
    if (callback) {
      callback(state);
    }
    console.log('State obj sent by child to parent: ', state);
  }

  // Helper to patch state value.
  private patchStateName(name: string): void {
    this.myForm.patchValue({ stateName: name }, { emitEvent: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

const materialModules: any[] | Type<any> | ModuleWithProviders<{}> = [
  MatButtonModule,
  MatIconModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatDatepickerModule,
  MatSelectModule,
  MatCheckboxModule,
  MatRadioModule,
  MatStepperModule,
  MatTooltipModule,
  MatExpansionModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatPaginatorModule,
  MatMenuModule,
  MatAutocompleteModule,

  CommonModule,
  FormsModule,
  ReactiveFormsModule,
];

@NgModule({
  imports: materialModules,
  exports: materialModules,
  providers: [provideNativeDateAdapter()],
})
export class MaterialModule { }

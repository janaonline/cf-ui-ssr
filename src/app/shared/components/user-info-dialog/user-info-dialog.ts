import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FieldConfig } from '../../../core/models/filed-config';
import { UtilityService } from '../../../core/services/utility-service';
import { PreLoader } from '../pre-loader/pre-loader';
import { UserInfoDialogueService } from './user-info-dialogue-service';

@Component({
  selector: 'app-user-info-dialog',
  imports: [
    PreLoader,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatDivider,
  ],
  templateUrl: './user-info-dialog.html',
  styleUrl: './user-info-dialog.scss',
})
export class UserInfoDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public matDialogData: any,
    private userInfoService: UserInfoDialogueService,
    private dialogRef: MatDialogRef<UserInfoDialog>,
    private utilityService: UtilityService,
    private cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
  ) { }

  title: string = 'User Information';
  desc: string = '';
  isLoading: boolean = false;
  fields: FieldConfig[] = [];
  userInfo: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.getFields();
  }

  private getFields(): void {
    this.isLoading = true;
    this.userInfoService
      .getUserInfoQuestions(this.matDialogData?.moduleInfo?.getEndPointUrl)
      .subscribe((res: any) => {
        this.fields = res.data.data;
        this.title = res.data.title || this.title;
        this.desc = res.data.desc || this.desc;
        this.userInfo = this.toFormGroup(this.fields);
        this.isLoading = false;
        this.cdr.detectChanges(); // 👈 force update detection
      });
  }

  public submitUserInfo(): void {
    if (this.userInfo.invalid) {
      return;
    }
    let payload = { ...this.userInfo.value };

    // If saveToLocalStorage is true then store data in localStorage.
    if (this.matDialogData?.moduleInfo?.saveToLocalStorage) {
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo.value));

      payload = {
        ...this.userInfo.value,
        ...this.matDialogData.downloadInfo,
      };
    }
    this.submitData(payload);

  }

  submitData(data: any) {
    this.userInfoService.submitData(this.matDialogData?.moduleInfo?.postEndPointUrl, data).subscribe({
      next: () => {
        this.utilityService.triggerSnackbar(`We'll get back to you shortly!`,);
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.utilityService.triggerSnackbar(`Something went wrong! Please try again later.`, 'snackbar-danger');
      },
    });
  }

  private toFormGroup(questions: FieldConfig[]): FormGroup {
    const group: any = {};
    questions.forEach((question: FieldConfig) => {
      group[question.key] = new FormControl(
        question.value || '',
        this.bindValidations(question.validations)
      );
    });
    return new FormGroup(group);
  }

  private bindValidations(validations: any) {
    if (validations && validations.length > 0) {
      const validators: any = [];
      validations.forEach((row: any) => {
        switch (row.name) {
          case 'required':
            validators.push(Validators.required);
            break;
          case 'nullValidator':
            validators.push(Validators.nullValidator);
            break;
          case 'pattern':
            validators.push(Validators.pattern(row.validator));
            break;
          case 'min':
            validators.push(Validators.min(row.validator));
            break;
          case 'max':
            validators.push(Validators.max(row.validator));
            break;
          case 'minlength':
            validators.push(Validators.minLength(row.validator));
            break;
          case 'maxlength':
            validators.push(Validators.maxLength(row.validator));
            break;
          case 'email':
            validators.push(
              Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$')
            );
            break;
        }
      });

      return Validators.compose(validators);
    }
    return null;
  }

  public hasError(key: string, name: string) {
    if (name === 'email') name = 'pattern';
    return (this.userInfo.get(key) as FormControl).hasError(name);
  }


}

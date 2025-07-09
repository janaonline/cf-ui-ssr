import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../../../core/models/filed-config';
import { Subject } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogRef,
} from '@angular/material/dialog';
import { PreLoader } from '../pre-loader/pre-loader';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-user-info-dialog',
  imports: [PreLoader, MatDialogActions, MatDivider],
  templateUrl: './user-info-dialog.html',
  styleUrl: './user-info-dialog.scss',
})
export class UserInfoDialog {
  title: string = 'Download';
  desc: string = 'Please enter your information below to download the file(s).';
  isLoading: boolean = false;
  fields: FieldConfig[] = [];
  userInfo: FormGroup = new FormGroup({});
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public matDialogData: any,
    // private downloadUserService: DownloadUserInfoService,
    public dialogRef: MatDialogRef<UserInfoDialog> // private utilityService: UtilityService, // private dynamicFormService: DynamicFormService
  ) {}

  ngOnInit(): void {
    this.getFields();
  }

  private getFields(): void {
    this.isLoading = true;
    // this.downloadUserService
    //   .getUserInfoQuestions(this.matDialogData?.moduleInfo?.endPoint)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((res: any) => {
    //     this.fields = res.data.data;
    //     this.title = res.data.title || this.title;
    //     this.desc = res.data.desc || this.desc;
    //     this.userInfo = this.dynamicFormService.toFormGroup(this.fields);
    //     this.isLoading = false;
    //   });
  }

  public submitUserInfo(): void {
    if (this.userInfo.valid) {
      let payload = { ...this.userInfo.value };

      // If saveToLocalStorage is true then store data in localStorage.
      if (this.matDialogData?.moduleInfo?.saveToLocalStorage) {
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo.value));

        payload = {
          ...this.userInfo.value,
          ...this.matDialogData.downloadInfo,
        };
      }

      //   this.dialogRef.close(payload);
    } else {
      //   this.utilityService.swalPopup(
      //     'Validation Failed!',
      //     'Failed to download file!',
      //     'error'
      //   );
      console.error('Invalid user info.');
    }
  }

  // submitUserInfo(): void {
  //   if (this.userInfo.valid) {
  //     localStorage.setItem('userInfo', JSON.stringify(this.userInfo.value));
  //     const payload = { ...this.userInfo.value, ...this.matDialogData.downloadInfo };
  //     this.dialogRef.close(payload);
  //   } else {
  //     this.utilityService.swalPopup('Validation Failed!', 'Failed to download file!', 'error');
  //     console.error('Invalid user info.');
  //   }
  // }
}

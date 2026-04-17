import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import {
  AfsPopupData,
  UserInfoData,
  UserInfoUlbDetails,
} from '../../../core/models/interfaces';
import { UtilityService } from '../../../core/services/utility-service';
import { NoDataFound } from '../no-data-found/no-data-found';

@Component({
  selector: 'app-afs-pdfs-dialog',
  imports: [NoDataFound],
  templateUrl: './afs-pdfs-dialog.html',
  styleUrl: './afs-pdfs-dialog.scss',
})
export class AfsPdfsDialog {
  // this.openDialog2(res["data"], type, { fileName: 'abc_audited_2023-24', type: 'pdf', module: 'resources' });
  reports!: AfsPopupData;
  fileType: string = '';
  ulbDetails!: UserInfoUlbDetails;
  USER_INFO_POPUP_MODULES = ['resources', 'cityPage'];

  constructor(
    public dialogRef: MatDialogRef<AfsPdfsDialog>,
    // private userInfoService: DownloadUserInfoService,
    private utilityService: UtilityService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: UserInfoData
  ) {
    console.log('userInfo: ', this.reports, this.fileType, this.ulbDetails);
    this.reports = data?.reportList;
    this.fileType = data?.fileType;
    this.ulbDetails = data?.ulbDetails;
  }

  public openFile(fileInfo: { url: string; name: string }): void {
    let target_file_url = environment.STORAGE_BASEURL + fileInfo['url'];
    if (fileInfo["url"] && fileInfo["url"].toLowerCase().startsWith('https://')) {
      target_file_url = fileInfo["url"];
    }

    // User info popup.
    if (
      this.ulbDetails &&
      this.USER_INFO_POPUP_MODULES.includes(this.ulbDetails['module'])
    ) {
      // const fileName = `${this.ulbDetails['fileName']}_${this.ulbDetails['type']}_${fileInfo['name']}.${this.fileType}`;
      // this.userInfoService
      //   .openUserInfoDialog([{ fileName }], this.ulbDetails['module'])
      //   .then((isDialogConfirmed: boolean) => {
      //     if (isDialogConfirmed) {
      //       if (this.fileType === 'pdf') window.open(target_file_url, '_blank');
      //       if (this.fileType === 'excel')
      //         this.utilityService.fetchFile(target_file_url, fileInfo['name']);
      //     }
      //     return;
      //   });
    } else {
      if (this.fileType === 'pdf') window.open(target_file_url, '_blank');
      if (this.fileType === 'excel')
        this.utilityService.fetchFile(target_file_url, fileInfo['name']);
    }

    return;
  }
  // public openFile(fileInfo: { url: string; name: string }): void {
  //   // console.log('openFile function called')
  //   const target_file_url = environment.STORAGE_BASEURL + fileInfo['url'];

  //   if (this.fileType === 'pdf') window.open(target_file_url, '_blank');
  //   else if (this.fileType === 'excel')
  //     this.utilityService.fetchFile(target_file_url, fileInfo['name']);

  //   return;
  // }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

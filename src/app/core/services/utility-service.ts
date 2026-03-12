import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
// import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CreateExcelParams } from '../models/interfaces';
import { GlobalLoaderService } from './loaders/global-loader.service';
const DEFAULT_CONTACT =
  "This is a system-generated sheet. Can't find what you're looking for? Write to us at contact@cityfinance.in";

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor(
    private _snackBar: MatSnackBar,
    private _globalLoaderService: GlobalLoaderService,
  ) { }

  // Download file.
  public fetchFile(target_file_url: string, fileName: string): void {
    fetch(target_file_url)
      .then((response) => {
        this._globalLoaderService.showLoader();
        if (!response.ok) throw new Error('Response was not ok.');
        return response.blob();
      })
      .then((blob) => {
        saveAs(blob, fileName);
        this._globalLoaderService.hideLoader();
        this.triggerSnackbar('File downloaded successfully!',);
      })
      .catch((error) => {
        console.error('Error in fetching file: ', error);
        this._globalLoaderService.hideLoader();
        this.triggerSnackbar('Failed to download the file!', 'snackbar-danger');
      });
  }



  // Helper: Trigger snack-bar.
  triggerSnackbar(msg: string, className: string = 'snackbar-success'): void {
    this._snackBar.open(msg, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 3000,
      panelClass: [className],
    });
  }

  /**
   * @param includeTime - If true (default), returns both date and time in 'YYYY-MM-DD_HH-MM-SS' format.
   *                      If false, returns only the date in 'YYYY-MM-DD' format.
   */
  public getTimeStamp(includeTime: boolean = true): string {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const timeString = `${now.getHours().toString().padStart(2, '0')}-${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

    if (includeTime) return `${dateString}_${timeString}`;
    return dateString;
  }

}

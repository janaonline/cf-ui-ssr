import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CreateExcelParams } from '../models/interfaces';
import { GlobalLoaderService } from './loaders/global-loader.service';

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

  // Create Excel.
  async createExcel(data: CreateExcelParams) {
    this._globalLoaderService.showLoader();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(data.sheetName);

    // Add logo image
    const base64Image = await this.getBase64ImageFromUrl('assets/images/excel-cf-logo.png');
    const base64 = base64Image.split(',')[1];

    const imageId1 = workbook.addImage({
      base64,
      extension: 'png',
    });

    // Place image in A1:D3 (takes rows 1-3)
    worksheet.addImage(imageId1, 'A1:D3');

    // Start headers
    const headerRowIndex = data.addLogo ? data.header.index : 1;

    // Set columns (automatically places headers in row 1 — we need to override this)
    worksheet.columns = data.columns;

    // Write the headers manually at desired row (row 4)
    const headers = data.columns.map(col => col.header);
    worksheet.insertRow(headerRowIndex, headers);

    const headerRow = worksheet.getRow(headerRowIndex);
    headerRow.font = {
      size: data.header.fontSize,
      name: data.header.fontFamily,
      bold: true,
    };
    headerRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    // Add data rows starting after header row index (below header)
    worksheet.insertRows(headerRowIndex + 1, data.rows);

    // Add file downloaded on.
    const idx = headerRowIndex + data.rows.length + 2;
    const date = this.getTimeStamp(false);
    worksheet.insertRow(idx, [`File downloaded on ${date}`]);

    // Add contact us.
    if (data.addContactUsNote) {
      const idx = headerRowIndex + data.rows.length + 3;
      const noteText = "This is a system-generated sheet. Can't find what you're looking for? Write to us at contact@cityfinance.in";

      // Insert row (we'll populate the cell after)
      worksheet.insertRow(idx, []);

      // Add plain text and then the hyperlink in adjacent cells
      const row = worksheet.getRow(idx);

      const cell = row.getCell(1);
      cell.value = {
        text: `${noteText}`,
        hyperlink: 'mailto:contact@cityfinance.in'
      };

      cell.font = {
        color: { argb: 'FF0000FF' },
        underline: true,
        name: 'Aptos',
        size: 10,
      };
    }


    // Write workbook and save
    workbook.xlsx.writeBuffer().then((buffer) => {
      const type = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
      const blob = new Blob([buffer], type);
      saveAs(blob, `${data.fileName}.xlsx`);
      this.triggerSnackbar("File downloaded successfully!", "snackbar-success");
      this._globalLoaderService.hideLoader();
    }).catch((error) => {
      console.error('Failed to download excel', error);
      this.triggerSnackbar("Failed to download excel!", "snackbar-danger");
      this._globalLoaderService.hideLoader();
    });
  }


  // Heler: function to fetch image as base64
  async getBase64ImageFromUrl(url: string): Promise<string> {
    return fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));
  }


  // Helper: Trigger snack-bar.
  triggerSnackbar(msg: string, className: string = 'snackbar-success'): void {
    this._snackBar.open(msg, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 2000,
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

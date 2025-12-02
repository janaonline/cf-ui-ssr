import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { GlobalLoaderService } from './loaders/global-loader.service';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor(
    private _snackBar: MatSnackBar,
    private _globalLoaderService: GlobalLoaderService,
  ) { }

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

  public generateExcel(
    columns: Array<Partial<ExcelJS.Column>>,
    rows: any[],
    fileName: string = 'CityFinance_Data',
    sheetName: string = 'Data',
  ) {
    try {
      this._globalLoaderService.showLoader();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      worksheet.columns = columns, rows;
      worksheet.addRows(rows);

      // Get the row you want to color (e.g., the third row)
      const totalCells = columns.length;
      const colorRows = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].isHeader) {
          // +2 because 1 is header and this uses 1 based indexing
          colorRows.push(i + 2)
        }
      }
      for (const idx of colorRows) {
        const row = worksheet.getRow(idx);
        for (let col = 1; col <= totalCells; col++) {
          const cell = row.getCell(col);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDDEBF7' },
          };
        }
      }

      const boldRows: number[] = [1];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].class?.includes('fw-bold')) {
          boldRows.push(i + 2); // +2 = header offset
        }
      }

      for (const idx of boldRows) {
        const row = worksheet.getRow(idx);

        // Only bold the row if it really exists & has values
        if (!row || !row.hasValues) {
          continue;
        }

        for (let col = 1; col <= totalCells; col++) {
          const cell = row.getCell(col);

          cell.font = {
            ...(cell.font ?? {}),
            bold: true,
          };
        }
      }


      const startRow = 1;
      const endRow = rows.length + 1;
      for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
        const row = worksheet.getRow(rowIndex);

        for (let colIndex = 1; colIndex <= totalCells; colIndex++) {
          const cell = row.getCell(colIndex);

          cell.border = {
            top: { style: 'thin', color: { argb: 'FF808080' } },
            left: { style: 'thin', color: { argb: 'FF808080' } },
            bottom: { style: 'thin', color: { argb: 'FF808080' } },
            right: { style: 'thin', color: { argb: 'FF808080' } },
          };
        }
      }

      const lastRowCell = worksheet.getCell(`A${endRow + 2}`);
      lastRowCell.value = {
        text: "This is system generated excel sheet. Can't find what you are looking for? Reach out to us at contact@cityfinance.in",
        hyperlink: 'mailto:contact@cityfinance.in',
        tooltip: 'contact@cityfinance.in'
      };
      lastRowCell.alignment = { wrapText: false };

      workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${fileName}.xlsx`);
        this.triggerSnackbar('File Downloaded Successfully!');
        this._globalLoaderService.hideLoader();
      });

    } catch (error) {
      this.triggerSnackbar('Failed to Download!', 'snackbar-danger');
      console.error("Failed to download excel", error)
      this._globalLoaderService.hideLoader();
    }
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

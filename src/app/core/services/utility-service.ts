import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { GlobalLoaderService } from './loaders/global-loader.service';
export const EXCEL_CURRENCY_FORMAT = '_-₹* #,##,##0.00_-;[Red]-₹* #,##,##0.00_-;_-* "-"??_-;_-@_-';

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

  // Utility: Apply a style updater for all cells in a row.
  private applyRowStyle(
    worksheet: ExcelJS.Worksheet,
    rowIndex: number,
    totalCols: number,
    updater: (cell: ExcelJS.Cell) => void
  ) {
    const row = worksheet.getRow(rowIndex);
    if (!row || !row.hasValues) return;

    for (let col = 1; col <= totalCols; col++) {
      const cell = row.getCell(col);
      updater(cell);
    }
  }

  /**
   * Utility: Find row indices where a given row predicate fn is true.
   * Converts 0-based data rows -> 1-based Excel indices (header offset = +2).
   */
  private findRowIndices(
    rows: any[],
    predicate: (row: any) => boolean
  ): number[] {
    const indices: number[] = [];
    for (let i = 0; i < rows.length; i++) {
      if (predicate(rows[i])) {
        indices.push(i + 2); // +1 for Excel start, +1 for header row
      }
    }
    return indices;
  }

  public async buildExcelSheet(sheetName: string, columns: any[], rows: any[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Set columns + Add row data
    worksheet.columns = columns;
    worksheet.addRows(rows);

    const totalCols = columns.length;

    // Color rows where isHeader = true
    const headerColorRows = this.findRowIndices(rows, (row) => row.isHeader);
    for (const rowIndex of headerColorRows) {
      this.applyRowStyle(worksheet, rowIndex, totalCols, (cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDDEBF7' }, // Light blue
        };
      });
    }

    // Bold rows: explicit first row + rows with "fw-bold" class
    const boldRowIndices = [1, ...this.findRowIndices(rows, (row) => row.class?.includes('fw-bold'))];
    for (const rowIndex of boldRowIndices) {
      this.applyRowStyle(worksheet, rowIndex, totalCols, (cell) => {
        cell.font = {
          ...(cell.font ?? {}),
          bold: true,
        };
      });
    }

    // Apply borders to ALL data cells
    const startRow = 1;
    const endRow = rows.length + 1; // +1 because header is row 1
    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
      this.applyRowStyle(worksheet, rowIndex, totalCols, (cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF808080' } },
          left: { style: 'thin', color: { argb: 'FF808080' } },
          bottom: { style: 'thin', color: { argb: 'FF808080' } },
          right: { style: 'thin', color: { argb: 'FF808080' } },
        };
      });
    }

    // Center-align all header cells (row 1)
    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell) => {
      cell.style.alignment = {
        ...(cell.style?.alignment ?? {}),
        horizontal: 'center',
      };
    });


    // Add support email to last row.
    const lastRowCell = worksheet.getCell(`A${endRow + 2}`);
    lastRowCell.value = {
      text: "This is system generated excel sheet. Can't find what you are looking for? Reach out to us at contact@cityfinance.in",
      hyperlink: 'mailto:contact@cityfinance.in',
      tooltip: 'contact@cityfinance.in'
    };
    lastRowCell.alignment = { wrapText: false };

    return workbook;
  }


  /**
   * Generates and downloads an Excel file using the provided columns and rows.
   * 
   * @param columns - An array of partial ExcelJS column definitions to structure the Excel sheet.
   * @param rows - An array of data objects representing the rows to be included in the Excel sheet.
   * @param fileName - (Optional) The name of the generated Excel file (without extension). Defaults to 'CityFinance_Data'.
   * @param sheetName - (Optional) The name of the worksheet within the Excel file. Defaults to 'Data'.
   * 
   * @remarks
   * - Displays a global loader while the file is being generated and downloaded.
   * - Shows a snackbar notification upon success or failure.
   * - Handles errors gracefully and logs them to the console.
   */
  public async generateExcel(
    columns: Array<Partial<ExcelJS.Column>>,
    rows: any[],
    fileName: string = 'CityFinance_Data',
    sheetName: string = 'Data',
  ) {
    try {
      this._globalLoaderService.showLoader();
      const workbook = await this.buildExcelSheet(sheetName, columns, rows);

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

}

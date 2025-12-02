import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CreateExcelParams } from '../models/interfaces';
import { GlobalLoaderService } from './loaders/global-loader.service';
export const EXCEL_CURRENCY_FORMAT = '_-₹* #,##,##0.00_-;[Red]-₹* #,##,##0.00_-;_-* "-"??_-;_-@_-';
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

  async createExcel(data: CreateExcelParams) {
    this._globalLoaderService.showLoader();
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(data.sheetName);

      // Freeze: first column + 2 header rows if grouped, else 1 row
      const freezeRows = data.cityGroups && data.yearHeaders ? 2 : 1;
      ws.views = [{ state: 'frozen', xSplit: 1, ySplit: freezeRows }];

      const base64Image = await this.getBase64ImageFromUrl('assets/images/excel-cf-logo.png');
      const base64 = base64Image.split(',')[1] ?? base64Image;
      const imgId = wb.addImage({ base64, extension: 'png' });
      // A1:D3 – adjust if you need different placement
      ws.addImage(imgId, 'A1:D2');
      // ---- Optional logo (safe if image missing) ----
      // if (data.addLogo && data.logoUrl) {
      //   try {
      //   } catch {
      //     // ignore logo errors so other pages keep working
      //   }
      // }

      // Where to start writing headers/rows (keeps your old behavior)
      const headerRowIndex = data.addLogo ? data.header.index : 1;

      // Two modes:
      // 1) GROUPED (city + year header rows) if both cityGroups & yearHeaders provided
      // 2) LEGACY (single header row) otherwise

      const grouped = !!(data.cityGroups && data.yearHeaders);

      if (grouped) {
        // --- GROUPED MODE ---

        // We’ll NOT rely on `worksheet.columns = ...` to write headers.
        // Instead we’ll insert two header rows ourselves (city row + year row),
        // and then dump body rows as arrays for perfect positional control.

        // Ensure column widths/styles still apply
        data.columns?.forEach((c, idx) => {
          const col = ws.getColumn(idx + 1);
          if (c.width) col.width = c.width;
          if (c.style) col.style = c.style;
        });

        // Row 1: spacer/title area if you keep the logo region free
        // Insert city row at headerRowIndex, then year row at headerRowIndex+1
        const cityRowIndex = headerRowIndex;
        const yearRowIndex = headerRowIndex + 1;

        // City row – empty cells initially
        const cityRow = new Array(data.yearHeaders!.length).fill('');
        ws.insertRow(cityRowIndex, cityRow);

        // Merge and label each city span
        for (const g of data.cityGroups!) {
          ws.mergeCells(cityRowIndex, g.startCol, cityRowIndex, g.endCol);
          const cell = ws.getCell(cityRowIndex, g.startCol);
          cell.value = g.name;
          cell.font = { name: data.header.fontFamily, size: 11, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Year row
        ws.insertRow(yearRowIndex, data.yearHeaders!);
        const yRow = ws.getRow(yearRowIndex);
        yRow.font = { name: data.header.fontFamily, size: 10, bold: true };
        yRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Borders for header rows
        [cityRowIndex, yearRowIndex].forEach(r => {
          for (let c = 1; c <= data.yearHeaders!.length; c++) {
            ws.getCell(r, c).border = {
              top: { style: 'thin' }, left: { style: 'thin' },
              bottom: { style: 'thin' }, right: { style: 'thin' }
            };
          }
        });

        // Body rows (array-of-arrays recommended for grouped mode)
        // If `rows` is array of objects, convert using column keys order.
        let bodyRows: (string | number)[][];

        if (Array.isArray(data.rows[0])) {
          bodyRows = data.rows as (string | number)[][];
        } else {
          const keys = data.columns.map(c => c.key);
          bodyRows = (data.rows as any[]).map(obj => keys.map(k => obj[k]));
        }

        ws.insertRows(yearRowIndex + 1, bodyRows);

        // Number format (skip first column)
        for (let r = yearRowIndex + 1; r <= ws.rowCount; r++) {
          for (let c = 2; c <= data.yearHeaders!.length; c++) {
            const cell = ws.getCell(r, c);
            if (typeof cell.value === 'number') {
              cell.numFmt = '#,##0';
            }
          }
        }

        // Footer
        const footerStart = yearRowIndex + bodyRows.length + 1;
        this.appendFooter(ws, footerStart, data);

      } else {
        // --- LEGACY MODE (existing pages unchanged) ---

        // Keep your current behavior: set columns, manually insert headers at headerRowIndex,
        // then insert object rows under it.

        ws.columns = data.columns as any;

        const headers = data.columns.map(col => col.header);
        ws.insertRow(headerRowIndex, headers);

        const headerRow = ws.getRow(headerRowIndex);
        headerRow.font = { size: data.header.fontSize, name: data.header.fontFamily, bold: true };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Insert rows (array of objects OR arrays—exceljs accepts both)
        ws.insertRows(headerRowIndex + 1, data.rows);

        // Simple number format for non-first columns
        for (let r = headerRowIndex + 1; r <= ws.rowCount; r++) {
          for (let c = 2; c <= (data.columns?.length ?? 1); c++) {
            const cell = ws.getCell(r, c);
            if (typeof cell.value === 'number') {
              cell.numFmt = '#,##0';
            }
          }
        }

        // Footer
        const footerStart = headerRowIndex + (Array.isArray(data.rows) ? data.rows.length : 0) + 1;
        this.appendFooter(ws, footerStart, data);
      }

      // Save
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const name = data.fileName?.toLowerCase().endsWith('.xlsx')
        ? data.fileName
        : `${data.fileName}.xlsx`;
      saveAs(blob, name);

      this.triggerSnackbar('File downloaded successfully!', 'snackbar-success');
    } catch (error) {
      console.error('Failed to download excel', error);
      this.triggerSnackbar('Failed to download excel!', 'snackbar-danger');
    } finally {
      this._globalLoaderService.hideLoader();
    }
  }

  // ----- helpers -----

  private appendFooter(
    ws: ExcelJS.Worksheet,
    startRow: number,
    data: CreateExcelParams
  ) {
    // "File downloaded on …"
    const date = this.getTimeStamp(false);
    ws.insertRow(startRow, [`File downloaded on ${date}`]);

    if (data.addContactUsNote) {
      const idx = startRow + 1;
      const noteText = data.contactText ?? DEFAULT_CONTACT;

      ws.insertRow(idx, []);
      const cell = ws.getRow(idx).getCell(1);
      cell.value = { text: noteText, hyperlink: 'mailto:contact@cityfinance.in' };
      cell.font = { color: { argb: 'FF0000FF' }, underline: true, name: 'Aptos', size: 10 };
    }
  }

  private async getBase64ImageFromUrl(url: string): Promise<string> {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('base64 read error'));
      reader.readAsDataURL(blob);
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

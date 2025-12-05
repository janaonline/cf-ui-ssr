import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import ExcelJS from 'exceljs';
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
}

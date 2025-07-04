import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inrFormat',
})
export class InrFormatPipe implements PipeTransform {
  /**
   * Transform a numeric value into a formatted INR string.
   *
   * @param value - The raw value to be formatted
   * @param format - Display format: 'auto' | 'cr' | 'lakh' | 'k' | 'inr' | 'raw'
   * @param options - Configuration object:
   *    showSymbol: boolean (default true) — show ₹
   *    showUnit: boolean (default true) — show Cr, Lakh, K
   *    max: number — max decimal places (default 0)
   *    min: number — min decimal places (default 0)
   *
   * @returns A formatted INR string
   */
  transform(
    value: unknown,
    format: 'auto' | 'cr' | 'lakh' | 'k' | 'inr' | 'raw' = 'auto',
    options: {
      showSymbol?: boolean;
      showUnit?: boolean;
      max?: number;
      min?: number;
    } = {},
  ): string {
    if (value === null || value === undefined || isNaN(Number(value))) return '-';

    const number = Number(value);
    const absNumber = Math.abs(number);

    const { showSymbol = true, showUnit = true, max = 0, min = 0 } = options;

    const localeOptions = {
      maximumFractionDigits: max,
      minimumFractionDigits: min,
    };

    let formatted: string;

    switch (format) {
      case 'cr':
        formatted = (number / 1e7).toLocaleString('en-IN', localeOptions);
        if (showUnit) formatted += ' Cr';
        break;
      case 'lakh':
        formatted = (number / 1e5).toLocaleString('en-IN', localeOptions);
        if (showUnit) formatted += ' Lakh';
        break;
      case 'k':
        formatted = (number / 1e3).toLocaleString('en-IN', localeOptions);
        if (showUnit) formatted += ' K';
        break;
      case 'inr':
        formatted = number.toLocaleString('en-IN', localeOptions);
        break;
      case 'raw':
        formatted = number.toString();
        break;
      case 'auto':
      default:
        if (absNumber >= 1e7) {
          formatted = (number / 1e7).toLocaleString('en-IN', localeOptions);
          if (showUnit) formatted += ' Cr';
        } else if (absNumber >= 1e5) {
          formatted = (number / 1e5).toLocaleString('en-IN', localeOptions);
          if (showUnit) formatted += ' Lakh';
        } else if (absNumber >= 1e3) {
          formatted = (number / 1e3).toLocaleString('en-IN', localeOptions);
          if (showUnit) formatted += ' K';
        } else {
          formatted = number.toLocaleString('en-IN', localeOptions);
        }
    }

    return showSymbol ? `₹ ${formatted}` : formatted;
  }
}

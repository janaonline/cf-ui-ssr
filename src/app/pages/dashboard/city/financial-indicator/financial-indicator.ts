import { Component, input } from '@angular/core';
import { NoDataFound } from '../../../../shared/components/no-data-found/no-data-found';

@Component({
  selector: 'app-financial-indicator',
  imports: [NoDataFound],
  templateUrl: './financial-indicator.html',
  styleUrl: './financial-indicator.scss',
})
export class FinancialIndicator {
  yearsSignal = input.required<string[]>();
}

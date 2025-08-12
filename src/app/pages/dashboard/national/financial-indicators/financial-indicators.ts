import { Component, input, signal } from '@angular/core';
import { TabButtons } from "../../../../shared/components/tab-buttons/tab-buttons";
import { LineItemType } from '../../../../core/models/interfaces';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-financial-indicators',
  imports: [TabButtons],
  templateUrl: './financial-indicators.html',
  styleUrl: './financial-indicators.scss'
})
export class FinancialIndicators {


  readonly stateIdSignal = signal('');
  // readonly stateDetails = input.required<any>();
  readonly dashboardTabData = input.required<any>();
  readonly tabName = input.required<any>();
  // readonly selectedLedgerYear = input.required<string>();

  currentSelectedButtonKey = signal<string>('Revenue');
  currentSelectedButton: any = signal<any>({});

  myForm!: FormGroup;
  years = signal<string[]>([]);

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    this.currentSelectedButtonKey.set(key as LineItemType);
  }

}

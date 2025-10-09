import { Component, EventEmitter, input, Output, signal } from '@angular/core';
import { TabButtons } from "../../../../shared/components/tab-buttons/tab-buttons";
import { LineItemType } from '../../../../core/models/interfaces';
import { FormGroup } from '@angular/forms';
import { NationalService } from '../national.service';
import { NationalTable } from "../national-table/national-table";
import { Subject } from 'rxjs';

@Component({
  selector: 'app-financial-indicators',
  imports: [TabButtons, NationalTable],
  templateUrl: './financial-indicators.html',
  styleUrl: './financial-indicators.scss'
})
export class FinancialIndicators {

  @Output() navigateTab = new EventEmitter<string>();

  selectedLedgerYear = signal<string>('');
  readonly ledgerYears = input.required<string[]>();

  readonly stateIdSignal = signal('');
  // readonly stateDetails = input.required<any>();
  readonly dashboardTabData = input.required<any>();

  currentSelectedButtonKey = signal<string>('Revenue');
  currentSelectedButton: any = signal<any>({});



  myForm!: FormGroup;
  years = signal<string[]>([]);
  constructor(private nationalService: NationalService) {

  }
  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    // this.currentSelectedButtonKey.set(key as LineItemType);
    this.nationalService.selectedButtonKey.set(key);
  }

  ngOnInit() {
    // console.log(this.dashboardTabData(), 'dashboardTabData')
  }

  navigateToData() {
    this.nationalService.selectedTabName.set('Data Availability');
    this.navigateTab.emit('data-availability');
  }

}

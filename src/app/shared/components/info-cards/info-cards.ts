import { Component, input } from '@angular/core';
import { ExploresectionTable } from '../../../core/models/interfaces';
import { InrFormatPipe } from '../../../core/pipes/inr-format.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-info-cards',
  imports: [InrFormatPipe, MatTooltipModule, MatButtonModule],
  templateUrl: './info-cards.html',
  styleUrl: './info-cards.scss',
})
export class InfoCards {
  readonly items = input<ExploresectionTable[]>([]);
  // items1 = [
  //   {
  //     sequence: '1',
  //     label: 'Total Tax Revenue',
  //     value: 'INR 2974 Cr',
  //     info: '',
  //     src: './assets/file.svg',
  //   },
  //   {
  //     sequence: '2',
  //     label: 'Total Own Revenue',
  //     value: 'INR 3850 Cr',
  //     info: '',
  //     src: './assets/file.svg',
  //   },
  //   {
  //     sequence: '3',
  //     label: 'Total Grant',
  //     value: 'INR 1640 Cr',
  //     info: '',
  //     src: './assets/coinCuren.svg',
  //   },
  //   {
  //     sequence: '4',
  //     label: 'Total Revenue',
  //     value: 'INR 5587 Cr',
  //     info: '',
  //     src: './assets/coinCuren.svg',
  //   },
  //   {
  //     sequence: '5',
  //     label: 'Total Expenditure',
  //     value: 'INR 6465 Cr',
  //     info: '',
  //     src: './assets/coinCuren.svg',
  //   },
  //   {
  //     sequence: '6',
  //     label: 'Total Balance Sheet Size',
  //     value: 'INR 19564 Cr',
  //     info: '',
  //     src: './assets/Group 15967.svg',
  //   },
  // ];
}

import { Component, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExploresectionTable } from '../../../core/models/interfaces';

@Component({
  selector: 'app-grid-view',
  imports: [MatTooltipModule],
  templateUrl: './grid-view.html',
  styleUrl: './grid-view.scss',
})
export class GridView {
  gridData = input<ExploresectionTable[]>();
  columns = input<number>(3);
}

import { Component, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExploresectionTable } from '../../../core/models/interfaces';

@Component({
  selector: 'app-grid-view',
  imports: [MatTooltipModule],
  template: `
    <div class="flex-grow-1 explore-data-grid my-3">@for (item of gridData(); track $index) {
    	<div class="p-2">
    		<p class="mb-0 fw-bold fs-5">{{ item['value'] }}          @if (item['info']) {
    			<i class="bi bi-info-circle" [matTooltip]="item['info']" matTooltipClass="multiline-tooltip"></i>}
    		</p>
    		<p class="text-secondary custom-font-size-6">{{ item['label'] }}</p>
    	</div>}
    </div>`,
  styleUrls: [],
})
export class GridView {
  gridData = input<ExploresectionTable[]>();
}

import { Component, input, signal } from '@angular/core';
import { DashboardService } from '../../../dashboard-service';

@Component({
  selector: 'app-population-table',
  imports: [],
  templateUrl: './population-table.html',
  styleUrl: './population-table.scss'
})
export class PopulationTable {

  stateUlbsPopulation = signal<any>({});
  readonly stateDetails = input.required<any>();

  objectKeys = Object.keys;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.getStateGroupPopulation();
  }

  getStateGroupPopulation() {
    const params = {
      stateId: this.stateDetails().state._id,
    };
    this.dashboardService.getStateGroupPopulation(params).subscribe({
      next: (res: any) => {
        if (res["data"]?.length) {
          this.stateUlbsPopulation.set(res["data"][0]);
        }
      },
      error: (error: Error) => {
        console.error('Failed to get state group population data', error);
      }
    });
  }

}

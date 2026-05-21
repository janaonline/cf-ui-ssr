import { Component, input } from '@angular/core';

@Component({
  selector: 'app-no-data-found',
  imports: [],
  templateUrl: './no-data-found.html',
  styleUrl: './no-data-found.scss'
})
export class NoDataFound {
  message = input("No Data Found for chosen options")
}

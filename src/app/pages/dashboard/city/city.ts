import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-city',
  imports: [],
  templateUrl: './city.html',
  styleUrl: './city.scss'
})
export class City {

  cityId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.cityId = this.route.snapshot.paramMap.get('cityId');
    console.log('City ID:', this.cityId);
  }

}

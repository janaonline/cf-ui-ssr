import { Component } from '@angular/core';
import { Spotlight } from './spotlight/spotlight';
import { SearchBar } from './search-bar/search-bar';
import { DiscoverSection } from './discover-section/discover-section';
import { DashboardMapSection } from './dashboard-map-section/dashboard-map-section';
import { SponsersPartners } from './sponsers-partners/sponsers-partners';

@Component({
  selector: 'app-home',
  imports: [
    // Spotlight, 
    SearchBar, DiscoverSection,
    DashboardMapSection,
    SponsersPartners],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}

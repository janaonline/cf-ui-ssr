import { Component, OnInit } from '@angular/core';
import { Spotlight } from './spotlight/spotlight';
import { SearchBar } from './search-bar/search-bar';
import { DiscoverSection } from './discover-section/discover-section';
import { DashboardMapSection } from './dashboard-map-section/dashboard-map-section';
import { SponsersPartners } from './sponsers-partners/sponsers-partners';
import { Title, Meta } from '@angular/platform-browser';
@Component({
  selector: 'app-home',
  imports: [
    Spotlight,
    SearchBar,
    DiscoverSection,
    DashboardMapSection,
    SponsersPartners],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  constructor(private titleService: Title, private metaService: Meta) { }

  ngOnInit() {
    this.titleService.setTitle('City Finance - Financial Data of 4,000+ Indian Cities');

    this.metaService.updateTag({
      name: 'description',
      content: 'Explore standardized, credible financial data of over 4,000 Indian urban local bodies. Access municipal budgets, audited statements, financial performance, credit ratings, and dashboards by state and city.'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'City Finance, city financial performance, municipal finance, resources, benchmarks, urban finance, city updates'
    });

    this.metaService.updateTag({
      name: 'robots',
      content: 'index, follow'
    });

    this.metaService.updateTag({
      property: 'og:title',
      content: 'City Finance - Financial Data of 4,000+ Indian Cities'
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: 'Explore standardized, credible financial data of over 4,000 Indian urban local bodies. Access municipal budgets, audited statements, financial performance, credit ratings, and dashboards by state and city.'
    });

    this.metaService.updateTag({
      property: 'og:url',
      content: 'https://cityfinance.in/home'
    });

    this.metaService.updateTag({
      property: 'og:type',
      content: 'website'
    });
  }

}

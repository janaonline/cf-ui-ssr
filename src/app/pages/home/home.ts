import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../core/services/seo/seo.service';
import { DashboardMapSection } from './dashboard-map-section/dashboard-map-section';
import { DiscoverSection } from './discover-section/discover-section';
import { SearchBar } from './search-bar/search-bar';
import { SponsersPartners } from './sponsers-partners/sponsers-partners';
import { Spotlight } from './spotlight/spotlight';
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
  constructor(
    // private titleService: Title, private metaService: Meta,
    private seoService: SeoService,
  ) { }

  ngOnInit() {
    this.setSeo();
  }

  setSeo() {
    const title = 'City Finance - Financial Data of 4,000+ Indian Cities';
    const description = 'Explore standardized, credible financial data of over 4,000 Indian urban local bodies. Access municipal budgets, audited statements, financial performance, credit ratings, and dashboards by state and city.';
    const url = `${environment.baseUrl}/home`;

    this.seoService.updateTitle(title);

    this.seoService.updateMetaTags([
      { name: 'description', content: description },
      { name: 'keywords', content: 'City Finance, city financial performance, municipal finance, resources, benchmarks, urban finance, city updates' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'website' },
      { property: 'robots', content: 'index, follow' }
    ]);

    this.seoService.setJsonLd({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "City Finance",
      "url": url
    });
  }
}

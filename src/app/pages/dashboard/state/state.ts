import { Component ,OnInit} from '@angular/core';
import { SeoService } from '../../../core/services/seo/seo.service';

@Component({
  selector: 'app-state',
  imports: [],
  templateUrl: './state.html',
  styleUrl: './state.scss'
})
export class State implements OnInit {
  constructor(
    
    private seoService: SeoService,
  ) { }

  ngOnInit() {
    this.setSeo();
  }
   setSeo() {
      this.seoService.updateTitle(' Municipal Financial Data of AP Cities | City Finance ');
  
      this.seoService.updateMetaTags([
        { name: 'description', content: `View aggregated municipal finance data availability for Andhra Pradesh cities. Benchmark financial performance of ULBs and explore trends in revenue and expenditure. ` },
        { name: 'keywords', content: ' municipal finance, city data, ULB performance, revenue trends, expenditure analysis, city benchmarking,  cities, financial dashboard, urban governance' },
        { property: 'og:title', content: 'Municipal Financial Data of Ap Cities | City Finance ' },
        { property: 'og:description', content: 'View aggregated municipal finance data availability for Andhra Pradesh cities. Benchmark financial performance of ULBs and explore trends in revenue and expenditure. ' },
        { property: 'og:url', content: `https://cityfinance.in/dashboard/slb` },
        { property: 'og:type', content: 'website' },
        //{ property: 'robotsrobots', content: 'index, follow' }
      ]);
  
      this.seoService.setJsonLd({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "City Finance",
        "url": `https://cityfinance.in/dashboard/slb`
        
      });
    }

}




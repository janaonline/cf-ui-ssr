import { Component , OnInit } from '@angular/core';
import { SeoService } from '../../../core/services/seo/seo.service';
//import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-national',
  imports: [],
  templateUrl: './national.html',
  styleUrl: './national.scss'
})
export class National implements OnInit {
  constructor(
    
    private seoService: SeoService,
  ) { }

  ngOnInit() {
    this.setSeo();
  }
   setSeo() {
      this.seoService.updateTitle('Municipal Financial Data of Indian Cities | City Finance ');
  
      this.seoService.updateMetaTags([
        { name: 'description', content: `View aggregated data availability for municipal finance across Indian cities. Explore revenue and expenditure trends and benchmark performance.` },
        { name: 'keywords', content: '' },
        { property: 'og:title', content: 'Municipal Financial Data of Indian Cities | City Finance ' },
        { property: 'og:description', content: 'View aggregated data availability for municipal finance across Indian cities. Explore revenue and expenditure trends and benchmark performance.' },
        { property: 'og:url', content: `https://cityfinance.in/dashboard/national/61e150439ed0e8575c881028` },
        { property: 'og:type', content: 'website' },
        //{ property: 'robotsrobots', content: 'index, follow' }
      ]);
  
      this.seoService.setJsonLd({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "City Finance",
        "url": `https://cityfinance.in/dashboard/national/61e150439ed0e8575c881028`
        
      });
    }

}

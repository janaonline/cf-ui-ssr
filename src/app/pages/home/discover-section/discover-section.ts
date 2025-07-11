import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-discover-section',
  imports: [RouterModule],
  templateUrl: './discover-section.html',
  styleUrl: './discover-section.scss',
})
export class DiscoverSection {
  v1Url = environment.v1Url;

  exploreCardData = [
    {
      label: 'Financial Performance Of Cities',
      desc: 'Analyze and compare the financial performance of cities',
      src: '../../../assets/images/homepage_v2/icons/financial-performance-of-cities.svg',
      alt: 'Financial Performance Of Cities',
      link: this.v1Url + '/dashboard/national',
    },
    {
      label: 'Improve Own Revenue',
      desc: 'Explore own revenue sources of municipalities and identify revenue improvement strategies',
      src: '../../../assets/images/homepage_v2/icons/own-revenue.svg',
      alt: 'Improve Own Revenue',
      link: this.v1Url + '/own-revenue-dashboard',
    },

    {
      label: 'Resources',
      desc: 'Get access to a rich repository of resources to build your knowledge, and implement municipal finance reforms',
      src: '../../../assets/images/homepage_v2/icons/resources.png',
      alt: 'Resources',
      link: this.v1Url + '/resources-dashboard/learning-center/toolkits',
    },
    {
      label: 'Service Level Benchmarks',
      desc: 'Track your city’s performance across five themes and 28 key indicators.',
      src: '../../../assets/images/homepage_v2/icons/service-level-benchmark.png',
      alt: 'Service Level Benchmarks',
      link: this.v1Url + '/dashboard/slb',
    },
    {
      label: 'XV Finance Commission Grants',
      desc: 'Apply, review, recommend and track XV finance commission grants',
      src: '../../../assets/images/homepage_v2/icons/xv-finance-commision-grants.svg',
      alt: 'XV Finance Commission Grants',
      link: this.v1Url + '/login',
    },
    {
      label: 'Upload Annual Accounts',
      desc: 'Upload Annual Account Forms',
      src: '../../../assets/images/homepage_v2/icons/annual-accounts.svg',
      alt: 'Upload Annual Accounts',
      link: this.v1Url + '/upload-annual-accounts',
    },
  ];
}

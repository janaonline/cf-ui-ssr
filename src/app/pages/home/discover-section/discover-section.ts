import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-discover-section',
  imports: [RouterModule],
  templateUrl: './discover-section.html',
  styleUrl: './discover-section.scss'
})
export class DiscoverSection {
  exploreCardData = [
    {
      label: 'Financial Performance Of Cities',
      desc: 'Analyze and compare the financial performance of cities',
      src: '../../../assets/images/homepage/new_dashBord_ftr_hdr/perf.svg',
      alt: 'Financial Performance Of Cities',
      link: '/dashboard/national',
    },
    {
      label: 'Improve Own Revenue',
      desc: 'Explore own revenue sources of municipalities and identify revenue improvement strategies',
      src: '../../../assets/images/homepage/new_dashBord_ftr_hdr/revenu.svg',
      alt: 'Improve Own Revenue',
      link: '/own-revenue-dashboard',
    },

    {
      label: 'Resources',
      desc: 'Get access to a rich repository of resources to build your knowledge, and implement municipal finance reforms',
      src: '../../../assets/images/homepage/new_dashBord_ftr_hdr/resoures/Group 15547.png',
      alt: 'Resources',
      link: '/resources-dashboard/learning-center/toolkits',
    },
    {
      label: 'Service Level Benchmarks',
      desc: 'Track your city’s performance across five themes and 28 key indicators.',
      src: '../../../assets/images/homepage/new_dashBord_ftr_hdr/slb/Group 15493.png',
      alt: 'Service Level Benchmarks',
      link: '/dashboard/slb',
    },
    {
      label: 'XV Finance Commission Grants',
      desc: 'Apply, review, recommend and track XV finance commission grants',
      src: '../../../assets/images/homepage/new_dashBord_ftr_hdr/15fc.svg',
      alt: 'XV Finance Commission Grants',
      link: '/login',
    },
    {
      label: 'Upload Annual Accounts',
      desc: 'Upload Annual Account Forms',
      src: '../../../assets/images/homepage/new_dashBord_ftr_hdr/raisemny.svg',
      alt: 'Upload Annual Accounts',
      link: '/upload-annual-accounts',
    },
  ];
}

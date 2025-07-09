import { Component } from '@angular/core';
// import { JsonPipe } from '@angular/common';
// import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
// import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@Component({
  selector: 'app-spotlight',
  imports: [
    // NgbCarouselModule,
    // JsonPipe,
    // CarouselModule,

    SlickCarouselModule,
  ],
  templateUrl: './spotlight.html',
  styleUrl: './spotlight.scss',
})
export class Spotlight {
  // images = [944, 1011, 984,944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);

  // customOptions: OwlOptions = {
  //   loop: true,
  //   mouseDrag: false,
  //   touchDrag: false,
  //   pullDrag: false,
  //   dots: false,
  //   navSpeed: 700,
  //   navText: [
  //     '<i class="ti-angle-left"><</i>',
  //     '<i class="ti-angle-right">></i>',
  //   ],
  //   responsive: {
  //     0: {
  //       items: 1
  //     },
  //     400: {
  //       items: 2
  //     },
  //     740: {
  //       items: 3
  //     },
  //     940: {
  //       items: 4
  //     }
  //   },
  //   nav: true
  // }

  whatNewData = [
    {
      imageUrl: '/assets/images/homepage/spotlight/RBI-report.jpg',
      name: 'RBI Report on Municipal Finances',
      downloadUrl:
        'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/objects/5b1a4e36-ebfb-4311-84c6-8213bee1a284.pdf',
    },
    {
      imageUrl:
        'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/objects/f209358d-8e95-4c26-8a96-27028aba53cd.png',
      name: 'A Municipal Finance Blueprint For India',
      downloadUrl:
        'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/objects/bdd4ab84-20bf-4299-818b-e34273084615.pdf',
    },
    {
      imageUrl:
        '/assets/images/homepage/spotlight/16th-FC-Members-Appointment-1.jpg',
      name: 'XVI FC Constitution & Terms of Reference',
      downloadUrl:
        'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/16th-FC-Members-Appointment-1.pdf',
    },
    {
      imageUrl: '/assets/images/homepage/spotlight/CFR-Framework.jpg',
      name: 'City Finance Rankings Framework',
      downloadUrl:
        'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/CFR-Framework.pdf',
    },
    {
      imageUrl: '/assets/images/homepage/spotlight/ASICS-2023-report.jpg',
      name: 'ASICS Report 2023',
      downloadUrl:
        'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/ASICS-2023-report.pdf',
    },
    {
      imageUrl: '/assets/images/homepage/spotlight/world-bank.jpg',
      name: 'Indian Urban Infrastructure & Services',
      downloadUrl:
        'https://documents1.worldbank.org/curated/en/099615110042225105/pdf/P17130200d91fc0da0ac610a1e3e1a664d4.pdf',
    },
    {
      imageUrl:
        'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com/resource/National_Municipal_Accounts_Manual__Nov_2004_low.jpg',
      name: 'National Municipal Accounts Manual',
      downloadUrl:
        'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/NMAM_Manual.pdf',
    },
    {
      imageUrl:
        'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com/resource/Capture.png',
      name: 'XV FC Main Report Volume I',
      downloadUrl:
        'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/XVFC_VOL_I_Main_Report_2021-26.pdf',
    },
    {
      imageUrl:
        'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com/resource/img.png',
      name: 'XV FC Operational Guidelines',
      downloadUrl:
        'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/Annexure-I_FC-XV_operational_guidelines_for_Urban_Local_Body_for_2021-26.pdf',
    },
    {
      imageUrl:
        'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com/resource/Property_Tax.jpg',
      name: 'Property Tax Toolkit',
      downloadUrl:
        'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/Property_Tax_Reforms_Toolkit.pdf',
    },
  ];

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 3,
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 680,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
}

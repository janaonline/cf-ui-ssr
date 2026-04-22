import { Component } from '@angular/core';
// import { JsonPipe } from '@angular/common';
// import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
// import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
@Component({
  selector: 'app-spotlight',
  imports: [
    // NgbCarouselModule,
    // JsonPipe,
    // CarouselModule,
    MatTooltipModule,
    SlickCarouselModule,
  ],
  templateUrl: './spotlight.html',
  styleUrl: './spotlight.scss',
})

export class Spotlight {
  constructor(
    private router: Router,
  ) {
  }
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

  whatNewData =
    [
      {
        "imageUrl": "/assets/images/homepage/spotlight/credit-rating-report.png",
        "name": "Credit Rating Toolkit",
        "downloadUrl": "/assets/images/homepage/spotlight/Credit_Rating_Toolkit.pdf",
        "badge": "New!"
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/property-tax.webp",
        "name": "Property Tax Toolkit",
        "downloadUrl": "/assets/images/homepage/spotlight/Property_Tax_Reforms_Toolkit.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/municipal-finance-blueprint.webp",
        "name": "A Municipal Finance Blueprint For India",
        "downloadUrl": "/assets/images/homepage/spotlight/municipal-finance-blueprint.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/rbi-report-on-municipal-finances.webp",
        "name": "RBI Report on Municipal Finances",
        "downloadUrl": "/assets/images/homepage/spotlight/rbi-report-on-municipal-finances.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/xvi-fc-constitution.webp",
        "name": "XVI FC Constitution & Terms of Reference",
        "downloadUrl": "/assets/images/homepage/spotlight/16th-FC-Members-Appointment-1.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/cfr-framework.webp",
        "name": "City Finance Rankings Framework",
        "downloadUrl": "/assets/images/homepage/spotlight/CFR-Framework.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/asics-2023-report.webp",
        "name": "ASICS Report 2023",
        "downloadUrl": "/assets/images/homepage/spotlight/ASICS-2023-report.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/indian-urban-infrastructure.webp",
        "name": "Indian Urban Infrastructure & Services",
        "downloadUrl": "/assets/images/homepage/spotlight/indian-urban-infrastructure-services.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/national-municipal-accounts-manual.webp",
        "name": "National Municipal Accounts Manual",
        "downloadUrl": "/assets/images/homepage/spotlight/NMAM_Manual.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/xv-fc-main-report-volume-1.webp",
        "name": "XV FC Main Report Volume I",
        "downloadUrl": "/assets/images/homepage/spotlight/XVFC_VOL_I_Main_Report_2021-26.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/xv-fc-operational-guidelines.webp",
        "name": "XV FC Operational Guidelines",
        "downloadUrl": "/assets/images/homepage/spotlight/Annexure-I_FC-XV_operational_guidelines.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/xvi-fc-report-volume-1.png",
        "name": "Report of the XVI-FC Volume 1",
        "downloadUrl": "/assets/images/homepage/spotlight/xvi-fc-report-volume-1.pdf",
        "badge": ""
      },
      {
        "imageUrl": "/assets/images/homepage/spotlight/blueprint-urban-fiscal-devolution.png",
        "name": "A Blueprint for Urban Fiscal Devolution",
        "downloadUrl": "/assets/images/homepage/spotlight/blueprint-urban-fiscal-devolution.pdf",
        "badge": ""
      }
    ];
  goToMarketDashboard() {
    this.router.navigate(['/municipal-data/city/comparewith']);
  }
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

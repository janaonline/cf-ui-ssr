import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonService } from '../../../../core/services/common.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
public totalUsersVisit: number | undefined;
  public readonly footerLinks = [
    { href: '/home', title: 'Home' },
    { href: '/dashboard/national/61e150439ed0e8575c881028', title: 'Financial' },
    { href: '/own-revenue-dashboard', title: 'Own Revenue Performance' },
    { href: '/dashboard/slb', title: 'Service Level Benchmarks Performance' },
    { href: '/resources-dashboard/learning-center/toolkits', title: 'Resources' },
  ];
  public readonly socialMediaInfo = [
    {
      link: 'https://www.facebook.com/mohua.india',
      imgSrc: './assets/images/social/fb.svg',
      key: 'facebook-mohua',
    },
    {
      link: 'https://twitter.com/MoHUA_India',
      imgSrc: './assets/images/social/twitter.svg',
      key: 'twitter-mohua',
    },
    {
      link: 'https://www.linkedin.com/company/mohua/',
      imgSrc: './assets/images/social/linkdin.svg',
      key: 'linkedin-mohua',
    },
  ];
  public address = `Director, AMRUT <br />
    Ministry of Housing and Urban Affairs <br />
    210 C, Nirman Bhawan, Maulana Azad Road <br />
    New Delhi-110011`;
  public mailId = 'mailto:contact@cityfinance.in';
  public mailLabel = 'contact@cityfinance.in';
  private destroy$ = new Subject<void>();

  constructor(
    private _commonService: CommonService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.getPageDetails();
    this.fetchUserVisitCount();
  }

  private fetchUserVisitCount() {
    this._commonService
      .getWebsiteVisitCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: number) => {
          return (this.totalUsersVisit = res);
        },
        error: (error) => console.error('Error in fetching visitors count: ', error),
      });
  }

  // Check if rankins.
  private getPageDetails() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (event: NavigationEnd) => {
          const urlSegments = event.urlAfterRedirects.split('/');
          this.updateContactInfo(urlSegments);
        },
        error: (error) => console.error('Error in setting address: ', error),
      });
  }

  // If rankings update the contact info.
  private updateContactInfo(urlSegments: string[]): void {
    const isRankingPage = urlSegments.includes('cfr');

    if (isRankingPage) {
      this.address = `Nirman Bhawan, <br /> New Delhi 110001`;
      this.mailId = 'mailto:rankings@cityfinance.in';
      this.mailLabel = 'rankings@cityfinance.in';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

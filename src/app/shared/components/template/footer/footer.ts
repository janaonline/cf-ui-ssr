import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  Component,
  Inject,
  makeStateKey,
  PLATFORM_ID,
  signal,
  TransferState,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../../../core/services/common.service';
import { environment } from '../../../../../environments/environment';

// --- TransferState Keys ---
const VISITOR_KEY = makeStateKey<number>('visitorKey');

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  v1Url = environment.v1Url;

  public totalUsersVisit = signal<number>(0);
  isLoading = signal<boolean>(true);
  public readonly footerLinks = [
    { href: '/home', title: 'Home' },
    {
      href: '/municipal-data/national',
      title: 'Financial',
    },
    {
      href: this.v1Url + '/own-revenue-dashboard',
      title: 'Own Revenue Performance',
    },
    {
      href: this.v1Url + '/dashboard/slb',
      title: 'Service Level Benchmarks Performance',
    },
    {
      href: this.v1Url + '/resources-dashboard/learning-center/toolkits',
      title: 'Resources',
    },
    {
      href: environment.blogUrl,
      title: 'Blog',
      target: '_blank',
    },
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
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState
  ) { }

  ngOnInit() {
    this.loadData();
    this.getPageDetails();
  }

  private loadData() {
    this.isLoading.set(true);

    // --- TransferState check for client-side hydration ---
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(VISITOR_KEY)
    ) {
      // console.log('CLIENT-SIDE (footer): Hydrating data from TransferState...');

      // Retrieve and set all data from TransferState
      this.totalUsersVisit.set(this.transferState.get(VISITOR_KEY, 0));

      // Remove keys from TransferState to prevent memory leaks for subsequent client-side navigations
      this.transferState.remove(VISITOR_KEY);

      this.isLoading.set(false);
      return;
    }

    // --- Server-side or Client-side (no TransferState) API Calls ---
    // console.log(
    //   `${isPlatformServer(this.platformId) ? 'SERVER' : 'CLIENT'} footer.ts: API called.`,
    // );

    // Call API.
    this._commonService
      .getWebsiteVisitCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.totalUsersVisit.set(res);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to fetch visitor count', error);
          this.isLoading.set(false);
        },
        complete: () => {
          // --- Store in TransferState on Server ---
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(VISITOR_KEY, this.totalUsersVisit());
          }
        },
      });
  }

  // Check if rankings.
  private getPageDetails() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntil(this.destroy$)
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

import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { IUserLoggedInDetails } from '../../../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../../../core/models/user/userType';
import { AuthSessionState, AuthService } from '../../../../core/services/auth.service';
import { AccessChecker } from '../../../../core/util/access/accessChecker';
import { ACTIONS } from '../../../../core/util/access/actions';
import { MODULES_NAME } from '../../../../core/util/access/modules';
import { UserInfoDialog } from '../../user-info-dialog/user-info-dialog';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly accessChecker = new AccessChecker();
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  isProd = false;
  canViewUserList = false;
  canViewULBSingUpListing = false;
  isAuthReady = false;
  isLoggedIn = false;
  user: IUserLoggedInDetails | null = null;
  loggedInUserDetails: any;
  loggedInUserType: any;
  btnName = 'Login for 15th FC Grants';
  sticky = false;
  isCollapsed = true;
  v1Url = environment.v1Url;
  showMobileNav = false;
  readonly readonlyEmails = ['doe@cityfinance.in', 'cca-mohua@gov.in'];

  readonly baseMenus: any[] = [
    {
      name: 'Dashboard',
      href: '',
      child: [
        {
          name: 'National Performance',
          link: '/municipal-data/national',
        },
        {
          name: 'Own Revenue Performance',
          href: this.v1Url + '/own-revenue-dashboard',
        },
        {
          name: 'Service Level Benchmarks Performance',
          href: this.v1Url + '/dashboard/slb',
        },
        { name: 'Market Readiness Assessment', href: '/municipal-data/market-readiness' },
      ],
    },
    {
      name: 'Resources',
      href: this.v1Url + '/resources-dashboard/data-sets/income_statement',
    },
    {
      name: 'Blog',
      href: environment.blogUrl,
      target: '_blank',
    },
  ];

  menus: any[] = [...this.baseMenus];

  public screenHeight: any;
  isSticky = false;
  private elementPosition = 0;
  private ticking = false;

  @ViewChild('stickyMenu') menuElement?: ElementRef;

  constructor(
    public _router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {
    this.authService.sessionState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sessionState) => this.updateAuthState(sessionState));
  }

  ngOnInit(): void {
    this.isProd = environment?.isProduction;
    this.initializeAccessChecking();
  }

  setLoggedInUserMenu() {
    if (!this.user) {
      this.menus = [...this.baseMenus];
      return;
    }

    const role = this.user.role;
    const loggedinMenus = [
      this.notInRole([USER_TYPE.PMU, USER_TYPE.XVIFC_STATE, USER_TYPE.STATE_DASHBOARD]) && {
        name: '15<sup>th</sup> FC Grants',
        href: environment.v1Url + '/fc-home-page',
      },
      role === USER_TYPE.ULB && {
        name: 'XVI FC Data Collection',
        href: environment.v2Url + '/xvifc-form',
      },
      [USER_TYPE.STATE_DASHBOARD, USER_TYPE.STATE].includes(role) && {
        name: 'State Dashboard',
        href: environment.v1Url + '/state-dashboard',
      },
      this.inRole([USER_TYPE.XVIFC, USER_TYPE.XVIFC_STATE]) && {
        name: 'Review XVI FC',
        href: environment.v2Url + '/admin/xvi-fc-review',
      },
      this.notInRole([USER_TYPE.PMU, USER_TYPE.XVIFC_STATE, USER_TYPE.STATE_DASHBOARD]) &&
      this.isReadonlyUser() && {
        name: 'Users',
        href: environment.v1Url + '/user/list/ULB',
      },
    ];

    this.menus = [...this.baseMenus, ...loggedinMenus.filter(Boolean)];
  }

  isReadonlyUser(): boolean {
    if (this.user) {
      return !this.readonlyEmails.includes(this.user.email);
    }

    return false;
  }

  notInRole(roles: string[]) {
    const role = this.user ? this.user.role : '';
    return !roles.includes(role);
  }

  inRole(roles: string[]) {
    const role = this.user ? this.user.role : '';
    return roles.includes(role);
  }

  initializeAccessChecking() {
    this.canViewUserList = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.USERLIST,
      action: ACTIONS.VIEW,
    });
    this.canViewULBSingUpListing = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.ULB_SIGNUP_REQUEST,
      action: ACTIONS.VIEW,
    });
  }

  removeSessionItem() {
    const postLoginNavigation = sessionStorage.getItem('postLoginNavigation');
    const sessionID = sessionStorage.getItem('sessionID');

    sessionStorage.clear();
    sessionStorage.setItem('sessionID', sessionID || '');

    if (postLoginNavigation) {
      sessionStorage.setItem('postLoginNavigation', postLoginNavigation);
    }
  }

  loginLogout(type: string) {
    localStorage.setItem('loginType', type);

    if (type === '15thFC') {
      window.location.href = this.v1Url + '/fc_grant';
      return;
    }

    if (type === 'XVIFC') {
      window.location.href = this.v1Url + '/login/xvi-fc';
      return;
    }

    if (type === 'state-dashboard') {
      window.location.href = this.v1Url + '/login/state-dashboard';
      return;
    }

    if (type === 'ranking') {
      window.location.href = this.v1Url + '/rankings/login';
      return;
    }

    if (type === 'logout') {
      this.authService.logout()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.removeSessionItem();
          this._router.navigateByUrl('/home');
        });
    }
  }

  loginLogout_bkp(type: string) {
    this.loginLogout(type);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.menuElement) {
        this.elementPosition = this.menuElement.nativeElement.offsetTop;
        this.cdr.detectChanges();
      }
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.updateStickyState();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private updateStickyState(): void {
    if (!this.menuElement) {
      return;
    }

    this.isSticky = window.scrollY >= this.elementPosition;
  }

  public showRequestDemoPopup(): void {
    const moduleInfo = {
      saveToLocalStorage: false,
      getEndPointUrl: 'request-demo/getDemoForm',
      postEndPointUrl: 'request-demo/postDemoData',
    };

    const downloadInfo = { module: 'requestDemo' };
    const dialogRef = this.dialog.open(UserInfoDialog, {
      width: '800px',
      maxWidth: '70vw',
      data: { downloadInfo, moduleInfo },
    });

    dialogRef.afterClosed().subscribe();
  }

  private updateAuthState(sessionState: AuthSessionState) {
    this.isAuthReady = sessionState.isReady;
    this.isLoggedIn = sessionState.isAuthenticated;
    this.user = sessionState.user;
    this.btnName = this.isLoggedIn ? 'Logout' : 'Login for 15th FC Grants';
    this.initializeAccessChecking();

    if (this.isLoggedIn) {
      this.setLoggedInUserMenu();
      return;
    }

    this.menus = [...this.baseMenus];
  }
}

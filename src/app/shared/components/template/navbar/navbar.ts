import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { IUserLoggedInDetails } from '../../../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../../../core/models/user/userType';
import { AuthService } from '../../../../core/services/auth.service';
import { AccessChecker } from '../../../../core/util/access/accessChecker';
import { ACTIONS } from '../../../../core/util/access/actions';
import { MODULES_NAME } from '../../../../core/util/access/modules';
import { UserUtility } from '../../../../core/util/user/user';
import { UserInfoDialog } from '../../user-info-dialog/user-info-dialog';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private accessChecker = new AccessChecker();
  isProd: boolean = false;
  canViewUserList: boolean = false;
  canViewULBSingUpListing: boolean = false;
  isLoggedIn: boolean = false;
  user: IUserLoggedInDetails | null = {} as IUserLoggedInDetails;
  loggedInUserDetails: any;
  loggedInUserType: any;
  btnName = 'Login for 15th FC Grants';
  sticky: boolean = false;
  isCollapsed = true;
  v1Url = environment.v1Url;
  vUrl = environment.vUrl;

  menus: any = [
    // {
    //   name: `<img src="./assets/images/city-finance-ranking.png"/>`,
    //   class: 'cfr-img-logo',
    //   href: `${this.prefixUrl}/cfr/home`,
    // },
    {
      name: 'Dashboard',
      href: '',
      child: [
        {
          name: 'National Performance',
          link: '/municipal-data/national',
          // href: this.v1Url + '/dashboard/national/61e150439ed0e8575c881028',
        },
        {
          name: 'Own Revenue Performance',
          href: this.v1Url + '/own-revenue-dashboard',
        },
        {
          name: 'Service Level Benchmarks Performance',
          href: this.v1Url + '/dashboard/slb',
        },
        {
          name: 'Market Readiness Assessment',
          href: this.vUrl + '/municipal-data/market-readiness',
        },
        // { name: 'Municipal Bonds', href: '/municipal-bonds' },
        // { name: 'Municipal Budgets', href: '/municipal-budgets' },
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

  showMobileNav: boolean = false;
  readonly readonlyEmails = ['doe@cityfinance.in', 'cca-mohua@gov.in'];


  constructor(
    public _router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoggedIn = this.authService.loggedIn();
    this.user = this.isLoggedIn ? this.user : null;
    this.initializeAccessChecking();
  }

  ngOnInit(): void {
    this.isProd = environment?.isProduction;
    this.checkUserLoggedIn();
    // this.setLoggedInUserMenu();
  }

  checkUserLoggedIn() {


    this.initializeAccessChecking();

    if (this.isLoggedIn) {
      UserUtility.getUserLoggedInData().subscribe((value: any) => {
        this.user = value;
        this.setLoggedInUserMenu();
      });
      this.btnName = 'Logout';
    } else {
      this.btnName = 'Login for 15th FC Grants';
    }
  }
  setLoggedInUserMenu() {
    if (!this.user) {
      return;
    }
    const role = this.user.role;
    const loggedin_menus = [
      // ...this.menus,
      // (role === USER_TYPE.PMU && { name: 'State resources', href: '/mohua-form/state-resource-manager' }),
      (this.notInRole([USER_TYPE.PMU, USER_TYPE.XVIFC_STATE, USER_TYPE.STATE_DASHBOARD]) && { name: '15<sup>th</sup> FC Grants', href: environment.v1Url + '/fc-home-page' }),
      // role === USER_TYPE.ULB && {
      //   name: `15<sup>th</sup> FC Grants`,
      //   href: environment.v1Url + '/fc-home-page',
      // },
      role === USER_TYPE.ULB && {
        name: `XVI FC Data Collection`,
        href: environment.v2Url + '/xvifc-form',
      },
      [USER_TYPE.STATE_DASHBOARD, USER_TYPE.STATE].includes(role) && {
        name: `State Dashboard`,
        href: environment.v1Url + '/state-dashboard',
      },
      // role === USER_TYPE.ULB && {
      //   name: `User Manual`,
      //   href: 'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com/resource/USER-MANUAL-XVI-FC-Data-Collection.pdf',
      //   target: '_blank',
      // },
      this.inRole([USER_TYPE.XVIFC, USER_TYPE.XVIFC_STATE]) && {
        name: `Review XVI FC`,
        href: environment.v2Url + '/admin/xvi-fc-review',
      },
      // (this.notInRole([USER_TYPE.ULB, USER_TYPE.XVIFC_STATE]) && { name: `Rankings'22 Dashboard`, href: '/cfr/review-rankings-ulbform' }),
      (this.notInRole([USER_TYPE.PMU, USER_TYPE.XVIFC_STATE, USER_TYPE.STATE_DASHBOARD]) && this.isReadonlyUser() && { name: 'Users', href: environment.v1Url + '/user/list/ULB' }),
    ];
    this.menus = this.menus.concat(loggedin_menus.filter((menu) => menu));
  }

  isReadonlyUser(): boolean {
    if (this.user) {
      return !this.readonlyEmails.includes(this.user.email);
    }
    return false
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
    const postLoginNavigation = sessionStorage.getItem('postLoginNavigation'),
      sessionID = sessionStorage.getItem('sessionID');
    sessionStorage.clear();
    sessionStorage.setItem('sessionID', sessionID || '');
    if (postLoginNavigation)
      sessionStorage.setItem('postLoginNavigation', postLoginNavigation);
  }
  // @HostListener('window:scroll', ['$event'])
  // handleScroll() {
  //   const windowScroll = window.pageYOffset;
  //   if (windowScroll >= 50) {
  //     this.sticky = true;
  //   } else {
  //     this.sticky = false;
  //   }
  // }
  // scroll() {
  //   window.scrollTo({
  //     top: 1000,

  //     behavior: 'smooth',
  //   });
  // }

  loginLogout(type: string) {
    localStorage.setItem('loginType', type);
    if (type == '15thFC') {
      // this._router.navigateByUrl("/fc_grant");
      window.location.href = this.v1Url + '/fc_grant';
    } else if (type == 'XVIFC') {
      // this._router.navigateByUrl("/login/xvi-fc");
      window.location.href = this.v1Url + '/login/xvi-fc';
    } else if (type == 'state-dashboard') {
      window.location.href = this.v1Url + '/login/state-dashboard';
    } else if (type == 'ranking') {
      // this._router.navigateByUrl("/rankings/login");
      window.location.href = this.v1Url + '/rankings/login';
    } else if (type == 'logout') {
      this.authService.loginLogoutCheck.next(false);
      // this.newCommonService.setFormStatus2223.next(false);
      localStorage.clear();
      this.removeSessionItem();
      this.isLoggedIn = false;
      // this._router.navigateByUrl("rankings/home");
      window.location.href = '/';
    }
  }

  loginLogout_bkp(type: string) {
    // if (type == '15th_Fc') {
    //   this._router.navigateByUrl("/fc_grant");
    // } else if (type == 'ranking') {
    //   this._router.navigateByUrl("/cfr/login");
    // } else if (type == 'logout') {
    this.authService.loginLogoutCheck.next(false);
    // this.newCommonService.setFormStatus2223.next(false);
    localStorage.clear();
    this.removeSessionItem();
    this.isLoggedIn = false;
    // this._router.navigateByUrl("rankings/home");
    window.location.href = '/';
    // } else {

    // }
    // if (this.btnName == "Login for 15th FC Grants") {
    //   this._router.navigateByUrl("/fc_grant");
    // }
    // if (this.btnName == "Logout") {
    //   this.btnName = "Login for 15th FC Grants";
    //   this.authService.loginLogoutCheck.next(false);
    //   // this.newCommonService.setFormStatus2223.next(false);
    //   localStorage.clear();
    //   this.removeSessionItem();
    //   this._router.navigateByUrl("/home");
    // }
  }

  // isSticky = false;
  public screenHeight: any;
  // elementPosition!: number;
  // @ViewChild('stickyMenu') menuElement: ElementRef | undefined;
  // ngAfterViewInit() {
  //   this.elementPosition = this.menuElement?.nativeElement.offsetTop;
  // }
  // @HostListener('window:scroll', ['$event'])
  // handleScrollTop() {
  //   if (window.scrollY >= this.elementPosition) {
  //     this.isSticky = true;
  //   } else {
  //     this.isSticky = false;
  //   }
  // }

  isSticky = false;
  private elementPosition = 0;
  private ticking = false;

  @ViewChild('stickyMenu') menuElement?: ElementRef;

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
    if (!this.menuElement) return;
    this.isSticky = window.scrollY >= this.elementPosition;
  }

  public showRequestDemoPopup(): void {
    // Frontend config flags for handling the module.
    const moduleInfo = {
      saveToLocalStorage: false,
      getEndPointUrl: 'request-demo/getDemoForm',
      postEndPointUrl: 'request-demo/postDemoData',
    };

    const downloadInfo = { module: 'requestDemo' }; // Info about the file download for backend payload.
    const dialogRef = this.dialog.open(UserInfoDialog, {
      width: '800px',
      maxWidth: '70vw',
      data: { downloadInfo, moduleInfo },
    });

    dialogRef.afterClosed().subscribe((data: any) => {
    });
  }
}

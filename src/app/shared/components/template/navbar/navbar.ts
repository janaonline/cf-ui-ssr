import { isPlatformBrowser, NgClass } from '@angular/common';
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
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { IUserLoggedInDetails } from '../../../../core/models/login/userLoggedInDetails';
import { AuthSessionState, AuthService } from '../../../../core/services/auth.service';
import { AccessChecker } from '../../../../core/util/access/accessChecker';
import { ACTIONS } from '../../../../core/util/access/actions';
import { MODULES_NAME } from '../../../../core/util/access/modules';
import { UserInfoDialog } from '../../user-info-dialog/user-info-dialog';
import { ROUTE_PAGES } from './login-menu.constant';
import { NAV_MENU_ITEMS, NavMenuItem, matchesAnyRoutePrefix, resolveMenus } from './nav-menu.config';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, MatButtonModule, MatMenuModule, MatIconModule, NgClass],
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
  readonly readonlyEmails = ['doe@cityfinance.in', 'cca-mohua@gov.in', 'cag@cityfinance.in'];

  routePages = ROUTE_PAGES.filter((page) => page.isMenu).map((page) => ({
    ...page,
    href: `${environment.ui.urlV2}auth/login/${page.type}`,
  }));

  menus: NavMenuItem[] = [];

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

    // Menus previously only recomputed on init/auth change — a plain
    // in-session navigation (e.g. Dashboard -> XVI FC Data Collection)
    // never refreshed `menus`, so nothing depending on the current route
    // (like the "My Forms" active-child label below) could ever update.
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.refreshMenus();
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {
    this.isProd = environment?.isProduction;
    this.initializeAccessChecking();
    this.refreshMenus();
  }

  /**
   * Rebuilds `menus` from the shared NAV_MENU_ITEMS config. Replaces the old
   * setLoggedInUserMenu(), which rebuilt the logged-in branch from scratch
   * instead of extending the base set — that's what could silently drop
   * Dashboard/Resources for a logged-in user. This version always starts
   * from the full filtered tree, so nothing gets lost based on auth state.
   */
  private refreshMenus(): void {
    const resolved = resolveMenus(
      NAV_MENU_ITEMS,
      (item) => this.isMenuItemVisible(item),
      (item) => this.isActiveGroupChild(item),
    );
    this.menus = resolved.map((item) => this.resolveLinks(item));
  }

  /**
   * True when `item` is this app's own route AND the current URL is either
   * exactly its match path or a descendant of it (boundary-safe: a prefix
   * of '/xvifc' matches '/xvifc/year' and '/xvifc/2024-25/...', but never
   * '/xvifc-form', which merely shares the same string prefix without a '/').
   * `activePathPrefix` overrides `path` for items whose real flow lives under
   * a broader/different url root than their own link target — see nav-menu.config.ts.
   */
  private isActiveGroupChild(item: NavMenuItem): boolean {
    if (item.hostApp !== 'ssr') return false;
    const prefix = item.activePathPrefix ?? item.path;
    if (!prefix) return false;
    return matchesAnyRoutePrefix(this._router.url, [prefix]);
  }

  private isMenuItemVisible(item: NavMenuItem): boolean {
    if (!item.apps.includes('ssr')) return false;

    const v = item.visibility;
    if (!v) return true;

    // ocrRouteOnly (V2 only) and showOnMobileOnly (UI only) are not
    // applicable to SSR; any item relying on either is not meant for SSR,
    // and `apps` already excludes SSR for those items today.
    if (v.isHiddenInProd && this.isProd) return false;
    if (v.requiresAuth && !this.isLoggedIn) return false;
    if (v.loggedOutOnly && this.isLoggedIn) return false;
    if (v.roles && !this.inRole(v.roles)) return false;
    if (v.excludeRoles && this.inRole(v.excludeRoles)) return false;
    // Second, independent gating dimension: which page the user is on right
    // now (AND'd with the role checks above). Recomputed on every
    // NavigationEnd (see constructor), so this updates live as the user
    // navigates, same as the role checks do on login/logout.
    if (v.showOnlyOnRoutePrefixes && !matchesAnyRoutePrefix(this._router.url, v.showOnlyOnRoutePrefixes)) {
      return false;
    }
    if (v.hideOnRoutePrefixes && matchesAnyRoutePrefix(this._router.url, v.hideOnRoutePrefixes)) {
      return false;
    }
    // readonlyGated: SSR's existing isReadonlyUser() (inverted 3-email
    // allowlist). Deliberately NOT consulting moduleAccess/AccessChecker here
    // — SSR's "Users" item today only ever checked the email allowlist, and
    // this preserves that exact existing behaviour rather than narrowing it.
    if (v.readonlyGated && !this.isReadonlyUser()) return false;

    return true;
  }

  /** Turns hostApp/path into a concrete routerLink or href for THIS app (SSR). */
  private resolveLinks(item: NavMenuItem): NavMenuItem {
    const resolved: NavMenuItem = { ...item };

    if (item.children?.length) {
      resolved.children = item.children.map((child) => this.resolveLinks(child));
    }

    switch (item.hostApp) {
      case 'ssr':
        resolved.resolvedLink = item.path;
        break;
      case 'ui':
        resolved.resolvedHref = item.path
          ? environment.v1Url.replace(/\/$/, '') + item.path
          : undefined;
        break;
      case 'v2':
        resolved.resolvedHref = item.path
          ? environment.v2Url.replace(/\/$/, '') + item.path
          : undefined;
        break;
      case 'external':
        resolved.resolvedHref = item.id === 'blog' ? environment.blogUrl : item.absoluteHref;
        break;
      default:
        break;
    }

    return resolved;
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

    if (type === 'logout') {
      this.authService.logout()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.removeSessionItem();
          this._router.navigateByUrl('/home');
        });
    } else {
      window.location.href = environment.ui.urlV2 + 'auth/login/' + type;
      return;
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
    this.refreshMenus();
  }
}

import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import { AuthService } from '../../core/services/auth.service';
import { USER_TYPE } from '../../core/models/user/userType';
import { SupersetService } from './superset.service';

@Component({
  selector: 'app-dalgo',
  templateUrl: './dalgo.html',
  styleUrl: './dalgo.scss',
  standalone: true
})
export class Dalgo implements OnInit, AfterViewInit {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly htmlElementId = 'mohua-superset-container';
  private readonly supersetDomainUrl = 'https://janaagraha.dalgo.org/';

  @Input() dashboardType = USER_TYPE.MoHUA;
  @Input() dashboardId = 'a154d39e-1048-4bfe-98cb-8177b32a5086';
  @Input() isToExpandFilters = true;

  @Input() filters: { id: string; column: string; value: string; }[] = [];

  stateFilterId: string = '';
  yearFilterId: string = '';

  constructor(
    private supersetService: SupersetService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.dashboardType === USER_TYPE.STATE) {
      this.yearFilterId = 'NATIVE_FILTER-Qf-mSNkTRDvomJI4EyBI-';
      this.stateFilterId = 'NATIVE_FILTER-pujpprBkzEJmUBPcbpGpa';
      this.dashboardId = '996010ee-7ea4-48d8-9b19-df8ec1774e7b';
      this.getStateName();
    } else if (this.dashboardType === USER_TYPE.MoHUA) {
      this.yearFilterId = 'NATIVE_FILTER-D9A7GYA-VYN-Rb_tj66U9';
      this.dashboardId = '926b740c-6d68-4f1d-8380-c4aa83e7def1';
    } else if (this.dashboardType === USER_TYPE.STATE_DASHBOARD) {
      this.dashboardId = 'a154d39e-1048-4bfe-98cb-8177b32a5086';
    }

    this.getSelectedYear();
    this.initializeEmbeddedDashboard();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.adjustIframeDimensions();
  }

  getSelectedYear() {
    const selectedYearId = sessionStorage.getItem('selectedYearId') ?? '';
    const selectedYear = sessionStorage.getItem('selectedYear') ?? selectedYearId;
    if (selectedYear && this.yearFilterId) {
      this.filters.push({ id: this.yearFilterId, column: 'Year', value: selectedYear });
    }
  }

  getStateName() {
    const user = this.authService.getCurrentUserSnapshot();
    let stateName = (user as any)?.stateName ?? sessionStorage.getItem('stateName') ?? '';
    if (!stateName || stateName === 'undefined') {
      stateName = sessionStorage.getItem('stateName') ?? '';
    }
    if (stateName && this.stateFilterId) {
      this.filters.push({ id: this.stateFilterId, column: 'state_name', value: stateName });
    }
  }

  private initializeEmbeddedDashboard(): void {
    const fetchGuestToken = () => {
      const requestBody = {
        resources: [
          { type: 'dashboard', id: this.dashboardId },
        ],
      };
      return this.supersetService.getGuestToken(requestBody).toPromise();
    };

    const nativeFilters = `(${this.generateNativeFilters(this.filters)})`;

    embedDashboard({
      id: this.dashboardId,
      supersetDomain: this.supersetDomainUrl,
      mountPoint: document.getElementById(this.htmlElementId) as HTMLElement,
      fetchGuestToken: fetchGuestToken,
      dashboardUiConfig: {
        hideTitle: true,
        filters: {
          expanded: this.isToExpandFilters
        },
        urlParams: { native_filters: nativeFilters }
      },
      iframeSandboxExtras: ['allow-top-navigation', 'allow-popups-to-escape-sandbox']
    });
  }

  private adjustIframeDimensions(): void {
    const iframe = document.getElementById(this.htmlElementId)?.children[0] as HTMLIFrameElement;
    if (iframe) {
      iframe.width = '100%';
      iframe.height = '100%';
    }
  }

  generateNativeFilters(filters: { id: string; column: string; value: string }[]): string {
    return filters.map(({ id, column, value }) => `${id}:(__cache:(label:'${value}',validateStatus:!f,value:!('${value}')),extraFormData:(filters:!((col:${column},op:IN,val:!('${value}')))),filterState:(label:'${value}',validateStatus:!f,value:!('${value}')),id:${id},ownState:())`).join(',');
  }
}

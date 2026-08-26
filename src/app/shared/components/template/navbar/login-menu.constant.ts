import { USER_TYPE } from "../../../../core/models/user/userType";

export interface IRoutePages {
    type: string;
    label: string;
    link?: string;
    isMenu: boolean;
    route?: string;
    roles?: USER_TYPE[];
    isNew?: boolean;
    isHiddenInProd?: boolean; // hidden once environment.isProduction is true; still shown in dev/staging/local
    icon?: string; // Bootstrap Icons class for this row; defaults to bi-box-arrow-in-right in the template
    href?: string; // literal href, used as-is instead of the environment.ui.urlV2 + 'auth/login/' + type
                    // cross-app formula — for a destination that isn't a V2 login type, e.g. SSR's own
                    // coming-soon page below
}
export const ROUTE_PAGES: IRoutePages[] = [{
    // XVIFC_PROD_CUTOVER: delete this whole entry once the real 16th FC login is ready for
    // production — at that point this row and the one below (isHiddenInProd) swap places.
    type: 'xvifc-coming-soon',
    label: 'XVI FC Grant',
    icon: 'bi-rocket-takeoff-fill',
    href: '/auth/login/16thfc',
    isMenu: true,
    isNew: true,
}, {
    type: '16thFC',
    label: 'XVI FC Grant',
    route: '/xvifc/year',
    isMenu: true,
    isNew: true,
    // XVIFC_PROD_CUTOVER: delete this line once the real 16th FC login is ready for production.
    // This one flag re-enables this "XVI FC Grant" row (here and in V2's login-menu.constant.ts)
    // and V2's real login route (guarded by login-type-availability.guard.ts) at the same time.
    isHiddenInProd: true,
    roles: [USER_TYPE.ULB, USER_TYPE.STATE, USER_TYPE.MoHUA, USER_TYPE.ADMIN]
}, {
    type: '15thFC',
    label: 'XV FC Grant',
    link: '/fc-home-page',
    isMenu: true,
    roles: [USER_TYPE.ULB, USER_TYPE.STATE, USER_TYPE.MoHUA, USER_TYPE.ADMIN]
},

{
    type: 'XVIFC',
    label: 'XVI FC Data Collection',
    route: '/xvifc-form',
    isMenu: true,
    roles: [USER_TYPE.ULB]
},
{
    type: 'XVIFC',
    label: 'XVI FC Review',
    route: '/admin/xvi-fc-review',
    isMenu: false,
    roles: [USER_TYPE.XVIFC_STATE, USER_TYPE.XVIFC]
},
{
    type: 'ranking',
    label: 'Rankings 2022',
    link: '/rankings/ulb-form',
    isMenu: true,
    roles: [USER_TYPE.ULB, USER_TYPE.STATE, USER_TYPE.MoHUA, USER_TYPE.ADMIN]
},
{
    type: 'state-dashboard',
    label: 'State Dashboard',
    link: '/state-dashboard',
    isMenu: true,
}
];
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
                    // cross-app formula — for a destination that isn't a V2 login type
}
export const ROUTE_PAGES: IRoutePages[] = [{
    type: '16thFC',
    label: 'XVI FC Grant',
    route: '/xvifc/year',
    isMenu: true,
    isNew: true,
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
    // Rankings temporarily disabled for all users
    type: 'ranking',
    label: 'Rankings 2022',
    link: '/rankings/ulb-form',
    isMenu: false,
    roles: [USER_TYPE.ULB, USER_TYPE.STATE, USER_TYPE.MoHUA, USER_TYPE.ADMIN]
},
{
    type: 'state-dashboard',
    label: 'State Dashboard',
    link: '/state-dashboard',
    isMenu: true,
}
];
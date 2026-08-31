

export enum DashboardType {
    MARKET_READINESS = 'market_readiness',
    AP_DASHBOARD = 'ap_dashboard',
    NMAM_CITY_RESPONSE = 'nmam_city_response_dashboard',
    RT_MUNICIPAL_FINANCE = 'rt_municipal_finance_dashboard',
}

export interface DashboardDetails {
    type: DashboardType;
    id: string;
    yearFilterId?: string;
    stateFilterId?: string;
    ulbFilterId?: string;
}

const DASHBOARD_REGISTRY: Record<DashboardType, DashboardDetails> = {
    [DashboardType.MARKET_READINESS]: {
        type: DashboardType.MARKET_READINESS,
        id: 'd8eb1ef2-d91c-40f3-b81e-8f8ed92455b5',
        // yearFilterId: 'NATIVE_FILTER-Qf-mSNkTRDvomJI4EyBI-',
        // stateFilterId: 'NATIVE_FILTER-pujpprBkzEJmUBPcbpGpa',
        // ulbFilterId: 'NATIVE_FILTER-xyz-abc-123', // Example filter ID for ULB
    },
    [DashboardType.AP_DASHBOARD]: {
        type: DashboardType.AP_DASHBOARD,
        id: '137e753c-21b4-4d4f-a0a0-a80b3cbd2a52',
    },
    [DashboardType.NMAM_CITY_RESPONSE]: {
        type: DashboardType.NMAM_CITY_RESPONSE,
        id: '0018e5ef-f45c-4cdf-a937-80f12c035c44',
    },
    [DashboardType.RT_MUNICIPAL_FINANCE]: {
        type: DashboardType.RT_MUNICIPAL_FINANCE,
        id: '001526de-2c53-4f5d-aef4-b6ab2f93c3cd',
    }
};

export function getDashboardDetails(pageType: string | null): DashboardDetails | null {
    if (!pageType) return null;
    return DASHBOARD_REGISTRY[pageType as DashboardType] ?? null;
}
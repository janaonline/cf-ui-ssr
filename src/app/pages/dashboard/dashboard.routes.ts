import { Route } from '@angular/router';

export const DASHBOARD_ROUTES: Route[] = [
    {
        path: 'national',
        loadComponent: () => import('./national/national').then(m => m.National)
    },
    {
        path: 'state/:slug',
        loadComponent: () => import('./state/state').then(m => m.State)
    },
    {
        path: 'market-readiness',
        loadComponent: () =>
            import('./city/borrowing-credit-rating/market-readiness/market-readiness')
                .then(m => m.MarketReadiness),
    },
    {
        path: 'city',
        children: [
            {
                path: 'comparewith',
                loadComponent: () => import('./city/financial-performance/compare/compare').then(m => m.Compare),
            },
            // {
            //     path: 'market-readiness',
            //     loadComponent: () =>
            //         import('./city/borrowing-credit-rating/market-readiness/market-readiness')
            //             .then(m => m.MarketReadiness),
            // },
            {
                path: ':slug',
                loadComponent: () => import('./city/city').then(m => m.City),
            },

        ]
    },
];

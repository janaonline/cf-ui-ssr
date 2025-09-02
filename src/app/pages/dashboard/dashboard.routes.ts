import { Route } from '@angular/router';

export const DASHBOARD_ROUTES: Route[] = [
    {
        path: 'national',
        loadComponent: () => import('./national/national').then(m => m.National)
    },
    {
        path: 'state',
        loadComponent: () => import('./state/state').then(m => m.State)
    }, {
        path: 'city/:slug',
        children: [
            {
                path: '',
                loadComponent: () => import('./city/city').then(m => m.City),
            },
            {
                path: 'compareby',
                loadComponent: () => import('./city/financial-performance/compare/compare').then(m => m.Compare),
            }
        ]
    }
];

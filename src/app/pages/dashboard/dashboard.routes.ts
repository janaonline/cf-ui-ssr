import { Route } from '@angular/router';

export const DASHBOARD_ROUTES: Route[] = [
    {
        path: 'national',
        loadComponent: () => import('./national/national').then(m => m.National)
    },
    {
        path: 'state',
        loadComponent: () => import('./state/state').then(m => m.State)
    },
    {
        path: ':dataId',
        loadComponent: () => import('./city/city').then(m => m.City)
    },
];

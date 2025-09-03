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
        path: 'city/:slug',
        loadComponent: () => import('./city/city').then(m => m.City)
    },
];

import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
        // component: Home,
    },
    {
        path: 'home',
        // loadComponent: () => import('./pages/home/home').then(m => m.Home),
        component: Home,
    },
    {
        path: 'map',
        loadComponent: () => import('./pages/india-map/india-map').then(m => m.IndiaMap),
    },
    {
        path: 'municipal-data',
        loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
    },
    // {
    //     path: 'municipal-data/:dataId',
    //     loadComponent: () => import('./pages/dashboard/city/city').then(m => m.City)
    // },
    { path: '**', redirectTo: 'home', pathMatch: 'full' },
    // {
    //     path: 'dashboard',
    //     children: [
    //         { path: '', redirectTo: 'national', pathMatch: 'full' },
    //         { path: 'national/india', loadComponent: () => import('./pages/dashboard/national/national').then(m => m.National) },
    //         { path: 'city/:cityId', loadComponent: () => import('./pages/dashboard/city/city').then(m => m.City) },
    //         { path: 'state/:stateId', loadComponent: () => import('./pages/dashboard/state/state').then(m => m.State) },
    //     ]
    // },    
];

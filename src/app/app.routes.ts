import { Routes } from '@angular/router';

export const routes: Routes = [
    // {
    //     path: '',
    //     loadComponent: () => import('./pages/home/home').then(m => m.Home),
    // },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
    },
    {
        path: 'city/:cityId',
        loadComponent: () => import('./pages/dashboard/city/city').then(m => m.City),
    }
];

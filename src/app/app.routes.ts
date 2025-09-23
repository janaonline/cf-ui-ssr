import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './core/guards/auth.guard';

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
    {
        path: 'ulb/:ulbId/:indicatoName',
        loadComponent: () => import('./pages/dashboard/ulb-dashboard/ulb-dashboard').then(m => m.UlbDashboard),
        canActivate: [authGuard]
    },
    { path: '**', redirectTo: 'home', pathMatch: 'full' },

];

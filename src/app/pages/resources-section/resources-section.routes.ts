import { Route } from "@angular/router";

export const RESOURCES_SECTION_ROUTES: Route[] = [
    {
        path: 'data-sets-bulk-download',
        loadComponent: () => import('./data-sets-bulk-download/data-sets-bulk-download').then(m => m.DataSetsBulkDownload)
    }
]



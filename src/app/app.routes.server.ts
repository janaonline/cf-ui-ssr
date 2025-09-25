import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'home',
    renderMode: RenderMode.Server,
  },
  {
    path: 'municipal-data/**',
    // renderMode: RenderMode.Prerender,
    renderMode: RenderMode.Server,
    // async getPrerenderParams() {
    //   // const dataService = inject(PostService);
    //   // const ids = await dataService.getIds(); // Assuming this returns ['1', '2', '3']
    //   const ids = ['1', '2', '3']; // Mock data for demonstration purposes
    //   return ids.map(id => ({ cityId:id })); // Generates paths like: /post/1, /post/2, /post/3
    // },
  },
  {
    path: 'ulb/:ulbId/:indicatorName',
    renderMode: RenderMode.Client,
  },
  // {
  //   path: 'municipal-data/national',
  //   renderMode: RenderMode.Client,
  // },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'comp-review',
    loadComponent: () => import('./comp-review/comp-review.component').then(m => m.CompReviewComponent)
  },
  {
    path: '',
    redirectTo: '/comp-review',
    pathMatch: 'full'
  }
];

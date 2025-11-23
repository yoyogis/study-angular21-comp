import { Route } from '@angular/router';
import { CompReviewComponent } from './comp-review/comp-review.component';

export const appRoutes: Route[] = [
  {
    path: 'comp-review',
    component: CompReviewComponent
  },
  {
    path: '',
    redirectTo: 'comp-review',
    pathMatch: 'full'
  }
];

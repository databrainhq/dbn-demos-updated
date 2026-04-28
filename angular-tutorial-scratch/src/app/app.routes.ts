import { Routes } from '@angular/router';
import { authGuard } from '@core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview',
  },
  {
    path: 'overview',
    title: 'Overview · Angular Dashboard Tutorial',
    loadComponent: () =>
      import('@features/overview/overview.page').then((m) => m.OverviewPage),
  },
  {
    path: 'analytics',
    title: 'Analytics · Angular Dashboard Tutorial',
    canActivate: [authGuard(['admin', 'manager'])],
    loadComponent: () =>
      import('@features/analytics/analytics.page').then((m) => m.AnalyticsPage),
  },
  {
    path: '**',
    redirectTo: 'overview',
  },
];

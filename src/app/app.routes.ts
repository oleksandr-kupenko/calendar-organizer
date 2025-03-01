import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'calendar',
    pathMatch: 'full'
  },
  {
    path: 'calendar',
    loadChildren: () => import('./calendar/calendar.routes').then(c => c.calendarRoutes),
    title: 'Calendar'
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(c => c.SettingsComponent),
    title: 'Settings'
  },
  {
    path: '**',
    redirectTo: 'calendar'
  }
];

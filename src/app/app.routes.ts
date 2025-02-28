import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'calendar',
    pathMatch: 'full'
  },
  {
    path: 'calendar',
    loadComponent: () => import('./calendar/calendar.component').then(c => c.CalendarComponent),
    title: 'Calendar'
  },
  {
    path: '**',
    redirectTo: 'calendar'
  }
];

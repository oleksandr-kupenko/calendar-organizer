import {Route} from '@angular/router';
import {CalendarComponent} from './calendar.component';
import {CalendarGridComponent} from './containers/calendar-grid/calendar-grid.component';
import {SingleDayComponent} from './containers/single-day/single-day.component';

export const calendarRoutes: Route[] = [
  {
    path: '',
    component: CalendarComponent,
    children: [
      {
        path: '',
        loadComponent: () => CalendarGridComponent
      },
      {
        path: 'day/:date',
        loadComponent: () => SingleDayComponent
      }
    ]
  }
];

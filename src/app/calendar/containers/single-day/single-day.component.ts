import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {HeaderLayoutComponent} from 'src/app/layouts/header-layout/header-layout.component';
import {ActivatedRoute, Router} from '@angular/router';
import {CalendarService} from '../../calendar.service';
import {DatePipe, NgStyle} from '@angular/common';
import {CalendarAppointment, ExtendedCalendarAppointment} from '../../models/calendar.models';
import {ResizeDirective} from '@core/directives/resize.directive';
import {ElementSize} from '@core/models/resize.model';
import {AppointmentFormComponent} from '../calendar-grid/components/appointment-form/appointment-form.component';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {combineLatest, map, startWith, switchMap} from 'rxjs';

@Component({
  selector: 'app-single-day',
  imports: [
    HeaderLayoutComponent,
    DatePipe,
    NgStyle,
    ResizeDirective,
    AppointmentFormComponent,
    MatMenu,
    MatDatepickerModule,
    MatMenuTrigger,
    MatButton,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './single-day.component.html',
  styleUrl: './single-day.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleDayComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);

  public calendarService = inject(CalendarService);

  public date = signal<Date | null>(null);
  public appointments = signal<CalendarAppointment[]>([]);
  public displayAppointments = computed<ExtendedCalendarAppointment[]>(() => {
    return this.appointments() ? this.generateExtendedAppointments() : [];
  });

  public hours = Array.from({length: 24}, (_, i) => i);

  public gridSize = signal<ElementSize>({width: 0, height: 0});

  public isEditMode = signal(false);
  public activeFormMenuTrigger = signal<MatMenuTrigger | null>(null);
  public selectedDate = signal<Date | null>(null);
  public selectedAppointment = signal<CalendarAppointment | null>(null);

  public hourHeightPx = computed(() => this.gridSize().height / this.hours.length);

  public backBacklink = computed(() => {
    const currentMonth = this.date() ? this.date()!.getMonth() + 1 : 1;
    const currentYear = this.date() ? this.date()!.getFullYear() : new Date().getFullYear();
    return 'calendar?month=' + currentMonth + '&year=' + currentYear;
  });

  constructor() {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map(params => {
          this.initSingleDayDate();
          return this.date();
        }),
        switchMap(date => {
          return this.calendarService.appointments$.pipe(map(appointments => ({date, appointments})));
        })
      )
      .subscribe(({date, appointments}) => {
        if (date) {
          this.setAppointmentsByDate();
        }
      });
  }

  public handleAppointmentClick(appointment: CalendarAppointment, trigger: MatMenuTrigger, event: MouseEvent) {
    event.stopPropagation();
    this.isEditMode.set(true);
    this.activeFormMenuTrigger.set(trigger);
    this.selectedDate.set(null);
    this.selectedAppointment.set(appointment);
    trigger.openMenu();
  }

  public handleNewEventClick(trigger: MatMenuTrigger) {
    this.isEditMode.set(false);
    this.activeFormMenuTrigger.set(trigger);
    this.selectedDate.set(this.date());
    this.selectedAppointment.set(null);
  }

  public onPreviousDay() {
    const currentDate = this.date()!;
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);

    const prevDay = `${prevDate.getFullYear()}-${prevDate.getMonth() + 1}-${prevDate.getDate()}`;
    this.router.navigate(['calendar', 'day', prevDay]);
  }

  public onNextDay() {
    const currentDate = this.date()!;
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const nextDay = `${nextDate.getFullYear()}-${nextDate.getMonth() + 1}-${nextDate.getDate()}`;
    this.router.navigate(['calendar', 'day', nextDay]);
  }

  public handleMenuClose() {
    this.isEditMode.set(false);
    this.activeFormMenuTrigger.set(null);
    this.selectedDate.set(null);
    this.selectedAppointment.set(null);
  }

  private setAppointmentsByDate(): void {
    const appointments = this.calendarService.getAppointmentsByDate(this.date()!);
    this.appointments.set(appointments);
  }

  private initSingleDayDate(): void {
    const dateString = this.route.snapshot.paramMap.get('date')?.split('-');

    if (dateString) {
      const year = parseInt(dateString[0], 10);
      const month = parseInt(dateString[1], 10) - 1;
      const day = parseInt(dateString[2], 10);
      this.date.set(new Date(year, month, day));
    }
  }

  private generateExtendedAppointments(): ExtendedCalendarAppointment[] {
    return this.appointments().map(app => ({
      ...app,
      top: this.getTopPosition(app.startTime),
      height: this.getHeight(app.startTime, app.endTime),
      left: this.getHorizontalPosition(app).left,
      width: this.getHorizontalPosition(app).width
    }));
  }

  private getTopPosition(startTime: string): number {
    const [hours, minutes] = startTime.split(':').map(Number);
    return (hours * 60 + minutes) * (this.hourHeightPx() / 60);
  }

  private getHeight(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    return durationMinutes * (this.hourHeightPx() / 60);
  }

  private getHorizontalPosition(appointment: CalendarAppointment): {left: string; width: string} {
    const overlappingAppointments = this.getOverlappingAppointments(appointment);

    if (overlappingAppointments.length <= 1) {
      return {left: '0%', width: '100%'};
    }

    const index = overlappingAppointments.findIndex(app => app.id === appointment.id);
    const width = 100 / overlappingAppointments.length;
    const left = index * width;

    return {
      left: `${left}%`,
      width: `${width}%`
    };
  }

  private getOverlappingAppointments(appointment: CalendarAppointment): CalendarAppointment[] {
    return this.appointments().filter(app => {
      if (app.id === appointment.id) return true;

      const [appStartHours, appStartMinutes] = appointment.startTime.split(':').map(Number);
      const [appEndHours, appEndMinutes] = appointment.endTime.split(':').map(Number);
      const [otherStartHours, otherStartMinutes] = app.startTime.split(':').map(Number);
      const [otherEndHours, otherEndMinutes] = app.endTime.split(':').map(Number);

      const appStart = appStartHours * 60 + appStartMinutes;
      const appEnd = appEndHours * 60 + appEndMinutes;
      const otherStart = otherStartHours * 60 + otherStartMinutes;
      const otherEnd = otherEndHours * 60 + otherEndMinutes;

      return (
        (otherStart >= appStart && otherStart < appEnd) ||
        (otherEnd > appStart && otherEnd <= appEnd) ||
        (otherStart <= appStart && otherEnd >= appEnd)
      );
    });
  }
}

import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {HeaderLayoutComponent} from 'src/app/layouts/header-layout/header-layout.component';
import {ActivatedRoute} from '@angular/router';
import {CalendarService} from '../../calendar.service';
import {DatePipe, NgStyle} from '@angular/common';
import {CalendarAppointment} from '../../models/calendar.models';
import {ResizeDirective} from '@core/directives/resize.directive';
import {ElementSize} from '@core/models/resize.model';
import {AppointmentFormComponent} from '../calendar-grid/components/appointment-form/appointment-form.component';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {MatDatepickerModule} from '@angular/material/datepicker';

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
    MatMenuTrigger
  ],
  templateUrl: './single-day.component.html',
  styleUrl: './single-day.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleDayComponent implements OnInit {
  route = inject(ActivatedRoute);

  public calendarService = inject(CalendarService);

  public date = signal<Date | null>(null);
  public appointments = signal<CalendarAppointment[]>([]);
  public hours = Array.from({length: 24}, (_, i) => i);

  public gridSize = signal<ElementSize>({width: 0, height: 0});

  public isEditMode = signal(false);
  public activeFormMenuTrigger = signal<MatMenuTrigger | null>(null);
  public selectedDate = signal<Date | null>(null);
  public selectedAppointment = signal<CalendarAppointment | null>(null);

  public hourHeightPx = computed(() => this.gridSize().height / this.hours.length);
  constructor() {
    effect(() => {
      if (this.gridSize().height) {
        // update sizes
      }
    });
  }

  ngOnInit() {
    const dateString = this.route.snapshot.paramMap.get('date')?.split('-');

    if (dateString) {
      const year = parseInt(dateString[0], 10);
      const month = parseInt(dateString[1], 10);
      const day = parseInt(dateString[2], 10);
      this.date.set(new Date(year, month, day));
      const appointments = this.calendarService.getAppointmentsByDate(this.date()!);
      this.appointments.set(appointments);
    }
  }

  public handleAppointmentClick(appointment: CalendarAppointment, trigger: MatMenuTrigger, event: MouseEvent) {
    event.stopPropagation();
    this.isEditMode.set(true);
    this.activeFormMenuTrigger.set(trigger);
    this.selectedDate.set(null);
    this.selectedAppointment.set(appointment);
    trigger.openMenu();
  }

  public getTopPosition(startTime: string): number {
    const [hours, minutes] = startTime.split(':').map(Number);
    return (hours * 60 + minutes) * (this.hourHeightPx() / 60);
  }

  public getHeight(startTime: string, endTime: string): number {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    console.log('GET HEIGHT', durationMinutes, this.hourHeightPx());
    return durationMinutes * (this.hourHeightPx() / 60);
  }

  public getHorizontalPosition(appointment: CalendarAppointment): {left: string; width: string} {
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

  public getOverlappingAppointments(appointment: CalendarAppointment): CalendarAppointment[] {
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

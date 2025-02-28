import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable, switchMap} from 'rxjs';
import {CalendarAppointment, CalendarDay, CalendarMonth, CalendarWeek} from './models/calendar.models';
import {getUniqueId} from '../utils';
import {WEEKS_PER_MONTH} from '../core/constants/calendar-grid.constants';
import {LocalStorageService} from '../core/services/localStorage.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private localStorageService = inject(LocalStorageService);

  private appointments$$ = new BehaviorSubject<CalendarAppointment[]>([]);
  private currentDate$$ = new BehaviorSubject<Date>(new Date());
  private slideDirection$$ = new BehaviorSubject<'next' | 'prev' | null>(null);

  public currentDate$: Observable<Date> = this.currentDate$$.asObservable();
  public slideDirection$ = this.slideDirection$$.asObservable();

  public calendarMonth$: Observable<CalendarMonth> = this.currentDate$.pipe(
    switchMap(date =>
      this.appointments$$.pipe(map(() => this.generateCalendarMonth(date.getFullYear(), date.getMonth())))
    )
  );

  constructor() {
    this.initAppointments();
  }

  public nextMonth(): void {
    this.slideDirection$$.next('next');
    const currentDate = this.currentDate$$.value;
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.currentDate$$.next(nextMonth);
  }

  public previousMonth(): void {
    this.slideDirection$$.next('prev');
    const currentDate = this.currentDate$$.value;
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    this.currentDate$$.next(prevMonth);
  }

  resetSlideDirection() {
    this.slideDirection$$.next(null);
  }

  public goToToday(): void {
    const today = new Date();
    this.currentDate$$.next(today);
  }

  public addAppointment(appointment: CalendarAppointment): void {
    const currentAppointments = [...this.appointments$$.value];
    currentAppointments.push(appointment);
    this.appointments$$.next(currentAppointments);
    this.saveAppointments();
  }

  public updateAppointment(updatedAppointment: CalendarAppointment): void {
    const currentAppointments = [...this.appointments$$.value];
    const index = currentAppointments.findIndex(app => app.id === updatedAppointment.id);
    if (index !== -1) {
      currentAppointments[index] = updatedAppointment;
      this.appointments$$.next(currentAppointments);
      this.saveAppointments();
    }
  }

  public deleteAppointment(id: string): void {
    const currentAppointments = this.appointments$$.value.filter(app => app.id !== id);
    this.appointments$$.next(currentAppointments);
    this.saveAppointments();
  }

  public getAppointmentsByDate(date: Date): Observable<CalendarAppointment[]> {
    return this.appointments$$.pipe(
      map(appointments => {
        return appointments.filter(app => {
          const appDate = new Date(app.date);
          return (
            appDate.getDate() === date.getDate() &&
            appDate.getMonth() === date.getMonth() &&
            appDate.getFullYear() === date.getFullYear()
          );
        });
      })
    );
  }

  public moveAppointment(id: string, newDate: Date): void {
    const currentAppointments = [...this.appointments$$.value];
    const index = currentAppointments.findIndex(app => app.id === id);

    if (index !== -1) {
      const appointment = {...currentAppointments[index]};
      appointment.date = newDate;
      currentAppointments[index] = appointment;

      this.appointments$$.next(currentAppointments);
      this.saveAppointments();
    }
  }

  private generateCalendarMonth(year: number, month: number): CalendarMonth {
    const weeks: CalendarWeek[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the first Sunday before or on the first day of the month
    const firstSunday = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    firstSunday.setDate(firstDay.getDate() - dayOfWeek);

    // Generate 6 weeks to ensure we cover the whole month
    let currentDate = new Date(firstSunday);
    for (let weekIndex = 0; weekIndex < WEEKS_PER_MONTH; weekIndex++) {
      const days: CalendarDay[] = [];

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const today = new Date();
        const isToday =
          currentDate.getDate() === today.getDate() &&
          currentDate.getMonth() === today.getMonth() &&
          currentDate.getFullYear() === today.getFullYear();

        days.push({
          id: getUniqueId(),
          date: new Date(currentDate),
          appointments: this.getAppointmentsForDate(currentDate),
          isCurrentMonth: currentDate.getMonth() === month,
          isToday
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push({days});
    }

    return {year, month, weeks};
  }

  private getAppointmentsForDate(date: Date): CalendarAppointment[] {
    return this.appointments$$.value.filter(app => {
      const appDate = new Date(app.date);
      return (
        appDate.getDate() === date.getDate() &&
        appDate.getMonth() === date.getMonth() &&
        appDate.getFullYear() === date.getFullYear()
      );
    });
  }

  private initAppointments() {
    const savedAppointments = this.localStorageService.getAppointments();
    this.appointments$$.next(savedAppointments);
  }

  private saveAppointments() {
    this.localStorageService.saveAppointments(this.appointments$$.value);
  }
}

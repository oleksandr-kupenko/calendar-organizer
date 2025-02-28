import {computed, Injectable, signal} from '@angular/core';
import {BehaviorSubject, map, Observable, switchMap, tap} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {CalendarAppointment, CalendarDay, CalendarMonth, CalendarWeek} from './models/calendar.models';
import {getUniqueId} from '../utils';
import {WEEKS_PER_MONTH} from '../core/constants/calendar-grid.constants';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  // Signals
  private appointments$$ = new BehaviorSubject<CalendarAppointment[]>([]);
  private currentDate$$ = new BehaviorSubject<Date>(new Date());

  public getAppointments$: Observable<CalendarAppointment[]> = this.appointments$$.asObservable();
  public currentDate$: Observable<Date> = this.currentDate$$.asObservable();

  public calendarMonth$: Observable<CalendarMonth> = this.currentDate$.pipe(
    switchMap(date =>
      this.appointments$$.pipe(map(() => this.generateCalendarMonth(date.getFullYear(), date.getMonth())))
    )
  );

  constructor() {
    this.initAppointments();
  }

  public nextMonth(): void {
    const currentDate = this.currentDate$$.value;
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.currentDate$$.next(nextMonth);
  }

  public previousMonth(): void {
    const currentDate = this.currentDate$$.value;
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    this.currentDate$$.next(prevMonth);
  }

  public goToToday(): void {
    const today = new Date();
    this.currentDate$$.next(today);
  }

  public addAppointment(appointment: CalendarAppointment): void {
    const currentAppointments = [...this.appointments$$.value];
    currentAppointments.push(appointment);
    this.appointments$$.next(currentAppointments);
    this.saveToLocalStorage();
  }

  public updateAppointment(updatedAppointment: CalendarAppointment): void {
    const currentAppointments = [...this.appointments$$.value];
    const index = currentAppointments.findIndex(app => app.id === updatedAppointment.id);
    if (index !== -1) {
      currentAppointments[index] = updatedAppointment;
      this.appointments$$.next(currentAppointments);
      this.saveToLocalStorage();
    }
  }

  public deleteAppointment(id: string): void {
    const currentAppointments = this.appointments$$.value.filter(app => app.id !== id);
    this.appointments$$.next(currentAppointments);
    this.saveToLocalStorage();
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
      this.saveToLocalStorage();
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

  private saveToLocalStorage(): void {
    localStorage.setItem('appointments', JSON.stringify(this.appointments$$.value));
  }

  private initAppointments() {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      const appointments = JSON.parse(savedAppointments) as CalendarAppointment[];
      appointments.forEach(appointment => {
        appointment.date = new Date(appointment.date);
      });
      this.appointments$$.next(appointments);
    }
  }
}

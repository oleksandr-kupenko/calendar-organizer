import {Injectable} from '@angular/core';
import {CalendarAppointment} from '../../calendar/models/calendar.models';

@Injectable({providedIn: 'root'})
export class LocalStorageService {
  public saveAppointments(data: CalendarAppointment[]): void {
    localStorage.setItem('appointments', JSON.stringify(data));
  }

  public getAppointments(): CalendarAppointment[] {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      const appointments = JSON.parse(savedAppointments) as CalendarAppointment[];
      appointments.forEach(appointment => {
        appointment.date = new Date(appointment.date);
      });
      return appointments;
    }
    return [];
  }
}

import {Component, computed, inject, signal, viewChild, ViewChild} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {AppointmentFormComponent} from './components/appointment-form/appointment-form.component';
import {toSignal} from '@angular/core/rxjs-interop';
import {CalendarAppointment, CalendarDay} from './models/calendar.models';
import {CalendarService} from './calendar.service';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {MatNativeDateModule} from '@angular/material/core';
import {CalendarHeaderComponent} from './components/calendar-header/calendar-header.component';
import {ResizeDirective} from '../core/directives/resize.directive';
import {ElementSize} from '../core/models/resize.model';
import {WEEKS_PER_MONTH} from '../core/constants/calendar-grid.constants';

@Component({
  selector: 'app-calendar',
  imports: [
    MatIcon,
    MatButton,
    CdkDropList,
    AppointmentFormComponent,
    CdkDrag,
    MatMenuModule,
    MatNativeDateModule,
    CalendarHeaderComponent,
    ResizeDirective
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: true
})
export class CalendarComponent {
  private calendarService = inject(CalendarService);

  public activeTrigger = signal<MatMenuTrigger | null>(null);

  public selectedAppointment = signal<CalendarAppointment | null>(null);
  public selectedDate = signal<Date | null>(null);

  public calendarMonth = toSignal(this.calendarService.calendarMonth$);
  public allDayIds = computed(() => {
    return this.calendarMonth()?.weeks.flatMap(week => week.days.flatMap(day => day.id));
  });

  public calendarGridSize = signal<ElementSize>({width: 0, height: 0});
  public dayCellSize = computed(() => {
    const height = this.calendarGridSize().height / WEEKS_PER_MONTH;
    const width = this.calendarGridSize().width / 7;
    return {width, height};
  });

  public daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  public isEditMode = signal(false);

  public handleDayClick(day: CalendarDay, menuTrigger: MatMenuTrigger): void {
    this.isEditMode.set(false);
    this.activeTrigger.set(menuTrigger);
    this.selectedDate.set(day.date);
    this.selectedAppointment.set(null);
  }

  public handleAppointmentClick(appointment: CalendarAppointment, menuTrigger: MatMenuTrigger, event: Event): void {
    event.stopPropagation();
    this.isEditMode.set(true);
    this.activeTrigger.set(menuTrigger);
    this.selectedDate.set(null);
    this.selectedAppointment.set(appointment);
    menuTrigger.openMenu();
  }

  handleAddCustomEvenClick(menuTrigger: MatMenuTrigger) {
    this.isEditMode.set(false);
    this.selectedDate.set(null);
    this.activeTrigger.set(menuTrigger);
    menuTrigger.openMenu();
  }

  public closeMenu(): void {
    if (this.activeTrigger() && this.activeTrigger()!.menuOpen) {
      this.activeTrigger()!.closeMenu();
    }
  }

  public saveAppointment(appointment: CalendarAppointment): void {
    this.calendarService.addAppointment(appointment);
    this.closeMenu();
  }

  public updateAppointment(appointment: CalendarAppointment): void {
    this.calendarService.updateAppointment(appointment);
    this.closeMenu();
  }

  public deleteAppointment(id: string): void {
    this.calendarService.deleteAppointment(id);
    this.closeMenu();
  }

  public onDrop(event: CdkDragDrop<Date>): void {
    console.log(event);
    if (event.previousContainer === event.container) {
      return;
    }

    const appointment = event.item.data as CalendarAppointment;
    const newDate = event.container.data as Date;

    const updatedDate = new Date(appointment.date);
    updatedDate.setFullYear(newDate.getFullYear());
    updatedDate.setMonth(newDate.getMonth());
    updatedDate.setDate(newDate.getDate());

    this.calendarService.moveAppointment(appointment.id, updatedDate);
  }

  public handleCloseMenu(): void {
    this.activeTrigger.set(null);
  }
}

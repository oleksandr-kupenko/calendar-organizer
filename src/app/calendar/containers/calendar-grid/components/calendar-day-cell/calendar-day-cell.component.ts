import {Component, Input, Output, EventEmitter, input, signal, computed} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {CalendarAppointment, CalendarDay} from '@calendar/models/calendar.models';
import {ElementSize} from '@core/models/resize.model';
import {AppointmentFormComponent} from '../appointment-form/appointment-form.component';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-calendar-day-cell',
  templateUrl: './calendar-day-cell.component.html',
  imports: [CdkDrag, CdkDropList, MatMenuModule, AppointmentFormComponent, RouterLink, MatIcon],
  styleUrls: ['./calendar-day-cell.component.scss']
})
export class CalendarDayCellComponent {
  day = input.required<CalendarDay>();
  allDayIds = input.required<string[]>();
  dayCellSize = input.required<ElementSize>();

  @Output() dayClicked = new EventEmitter<{day: any; trigger: MatMenuTrigger}>();
  @Output() appointmentClicked = new EventEmitter<{appointment: any; trigger: MatMenuTrigger; event: MouseEvent}>();
  @Output() appointmentDropped = new EventEmitter<CdkDragDrop<any>>();

  public dateRoute = computed(() => {
    const date = this.day().date;
    return date ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` : null;
  });

  public isEditMode = signal(false);
  public activeFormMenuTrigger = signal<MatMenuTrigger | null>(null);
  public selectedDate = signal<Date | null>(null);
  public selectedAppointment = signal<CalendarAppointment | null>(null);

  public onDrop(event: CdkDragDrop<any>) {
    this.appointmentDropped.emit(event);
  }

  public handleDayClick(trigger: MatMenuTrigger) {
    this.isEditMode.set(false);
    this.activeFormMenuTrigger.set(trigger);
    this.selectedDate.set(this.day().date);
    this.selectedAppointment.set(null);
  }

  public handleAppointmentClick(appointment: CalendarAppointment, trigger: MatMenuTrigger, event: MouseEvent) {
    event.stopPropagation();
    this.isEditMode.set(true);
    this.activeFormMenuTrigger.set(trigger);
    this.selectedDate.set(null);
    this.selectedAppointment.set(appointment);
    trigger.openMenu();
  }
}

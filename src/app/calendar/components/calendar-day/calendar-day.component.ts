import {Component, Input, Output, EventEmitter, input, signal} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {CalendarAppointment, CalendarDay} from '../../models/calendar.models';
import {ElementSize} from '../../../core/models/resize.model';
import {AppointmentFormComponent} from '../appointment-form/appointment-form.component';

@Component({
  selector: 'app-calendar-day',
  templateUrl: './calendar-day.component.html',
  imports: [CdkDrag, CdkDropList, MatMenuModule, AppointmentFormComponent],
  styleUrls: ['./calendar-day.component.scss']
})
export class CalendarDayComponent {
  day = input.required<CalendarDay>();
  allDayIds = input.required<string[]>();
  dayCellSize = input.required<ElementSize>();

  @Output() dayClicked = new EventEmitter<{day: any; trigger: MatMenuTrigger}>();
  @Output() appointmentClicked = new EventEmitter<{appointment: any; trigger: MatMenuTrigger; event: MouseEvent}>();
  @Output() appointmentDropped = new EventEmitter<CdkDragDrop<any>>();

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

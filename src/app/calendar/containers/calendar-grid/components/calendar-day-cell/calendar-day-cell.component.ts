import {Component, Input, Output, EventEmitter, input, signal, computed, inject} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {CalendarAppointment, CalendarDay} from '@calendar/models/calendar.models';
import {ElementSize} from '@core/models/resize.model';
import {AppointmentFormComponent} from '../appointment-form/appointment-form.component';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {TimeFormatPipe} from '@core/pipes/time-format.pipe';
import {toSignal} from '@angular/core/rxjs-interop';
import {SettingsService} from 'src/app/settings/settings.service';
import {map} from 'rxjs';
import {REGION_FORMAT} from 'src/app/settings/models/settings.models';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-calendar-day-cell',
  templateUrl: './calendar-day-cell.component.html',
  imports: [
    CdkDrag,
    CdkDropList,
    MatMenuModule,
    AppointmentFormComponent,
    RouterLink,
    MatIcon,
    TimeFormatPipe,
    MatTooltip
  ],
  styleUrls: ['./calendar-day-cell.component.scss']
})
export class CalendarDayCellComponent {
  day = input.required<CalendarDay>();
  allDayIds = input.required<string[]>();
  dayCellSize = input.required<ElementSize>();

  @Output() dayClicked = new EventEmitter<{day: any; trigger: MatMenuTrigger}>();
  @Output() appointmentClicked = new EventEmitter<{appointment: any; trigger: MatMenuTrigger; event: MouseEvent}>();
  @Output() appointmentDropped = new EventEmitter<CdkDragDrop<any>>();

  public isAmericanFormat = toSignal(
    inject(SettingsService).getSettings$.pipe(map(settings => settings?.regionFormat === REGION_FORMAT.american))
  );

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

  public handleMenuClose() {
    this.isEditMode.set(false);
    this.activeFormMenuTrigger.set(null);
    this.selectedDate.set(null);
    this.selectedAppointment.set(null);
  }
}

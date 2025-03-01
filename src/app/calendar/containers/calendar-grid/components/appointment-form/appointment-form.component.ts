import {Component, effect, EventEmitter, inject, input, OnInit, Output} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardModule} from '@angular/material/card';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatDatepickerInput, MatDatepickerModule} from '@angular/material/datepicker';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {getUniqueId} from 'src/app/utils';
import {AppointmentFormData, CalendarAppointment} from '@calendar/models/calendar.models';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {CalendarService} from '@calendar/calendar.service';
import {MatMenuTrigger} from '@angular/material/menu';
import {APPOINTMENTS_COLORS} from '@core/constants/appointment.constants';
import {DateAdapter, MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: 'app-appointment-form',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardContent,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDatepickerInput,
    MatSelect,
    MatOption,
    MatButton,
    MatDatepickerModule,
    MatFormFieldModule,
    MatCardModule,
    MatTimepickerModule
  ],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss',
  providers: []
})
export class AppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private calendarService = inject(CalendarService);
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);

  appointment = input<CalendarAppointment | null>(null);
  selectedDate = input<Date | null>(null);
  isEditAppointmentMode = input.required<boolean>();
  menuTrigger = input<MatMenuTrigger | null>(null);

  public appointmentForm!: FormGroup;

  public colorsOptions = [
    {name: 'Pink', value: APPOINTMENTS_COLORS.pink},
    {name: 'Blue', value: APPOINTMENTS_COLORS.blue},
    {name: 'Green', value: APPOINTMENTS_COLORS.green},
    {name: 'Orange', value: APPOINTMENTS_COLORS.orange},
    {name: 'Purple', value: APPOINTMENTS_COLORS.purple}
  ];
  constructor() {
    effect(() => {
      if (this.isEditAppointmentMode() && this.appointment()) {
        this.loadAppointmentData();
      } else {
        this.setSelectedDate();
      }
    });
  }

  ngOnInit() {
    this.initForm();
    this._adapter.setLocale('en-GB');
  }

  public onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formData = this.getFormData();
      if (this.isEditAppointmentMode()) {
        this.updateAppointment(formData);
      } else {
        this.saveAppointment(formData);
      }
      this.resetForm();
    }
  }

  public onCancel(): void {
    this.closeMenu();
  }

  public onDelete(): void {
    if (this.appointment()) {
      this.calendarService.deleteAppointment(this.appointment()!.id);
    }
    this.closeMenu();
  }

  private initForm(): void {
    const defaultTimes = this.getDefaultTimes();

    this.appointmentForm = this.fb.nonNullable.group(
      {
        title: ['', Validators.required],
        description: new FormControl<string | null>(''),
        date: [new Date(), Validators.required],
        startTime: [defaultTimes.startTime, Validators.required],
        endTime: [defaultTimes.endTime, Validators.required],
        color: [APPOINTMENTS_COLORS.blue]
      },
      {
        validators: this.timeRangeValidator
      }
    );
  }

  private getDefaultTimes(): {startTime: Date; endTime: Date} {
    const today = new Date();

    const startTime = new Date(today);
    startTime.setHours(9, 0, 0);

    const endTime = new Date(today);
    endTime.setHours(10, 0, 0);

    return {startTime, endTime};
  }

  private setSelectedDate(): void {
    if (this.selectedDate()) {
      this.appointmentForm.patchValue({
        date: this.selectedDate()
      });
    }
  }

  private loadAppointmentData(): void {
    const appointment = this.appointment()!;
    const appointmentDate = new Date(appointment.date);

    const startTimeObj = this.parseTimeStringToDate(appointment.startTime, appointmentDate);
    const endTimeObj = this.parseTimeStringToDate(appointment.endTime, appointmentDate);

    this.appointmentForm.patchValue({
      title: appointment.title,
      description: appointment.description || '',
      date: appointmentDate,
      startTime: startTimeObj,
      endTime: endTimeObj,
      color: appointment.color || '#3f51b5'
    });
  }

  private getFormData(): AppointmentFormData {
    const formValue = this.appointmentForm.value;
    const startTimeStr = this.formatTimeFromDate(formValue.startTime);
    const endTimeStr = this.formatTimeFromDate(formValue.endTime);

    return {
      title: formValue.title,
      description: formValue.description,
      date: formValue.date,
      startTime: startTimeStr,
      endTime: endTimeStr,
      color: formValue.color
    };
  }

  public updateAppointment(formData: AppointmentFormData): void {
    const updatedAppointment: CalendarAppointment = {
      id: this.appointment()!.id,
      ...formData
    };

    this.calendarService.updateAppointment(updatedAppointment);
    this.closeMenu();
  }

  private saveAppointment(formData: AppointmentFormData): void {
    const newAppointment: CalendarAppointment = {
      id: getUniqueId(),
      ...formData
    };

    this.calendarService.addAppointment(newAppointment);
    this.closeMenu();
  }

  private resetForm(): void {
    const defaultTimes = this.getDefaultTimes();

    this.appointmentForm.reset({
      date: new Date(),
      startTime: defaultTimes.startTime,
      endTime: defaultTimes.endTime,
      color: '#3f51b5'
    });
  }

  private timeRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const startTime = group.get('startTime')?.value as Date;
    const endTime = group.get('endTime')?.value as Date;

    if (!startTime || !endTime) {
      return null;
    }

    if (startTime.getTime() >= endTime.getTime()) {
      return {timeRange: true};
    }
    return null;
  };

  private formatTimeFromDate(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private parseTimeStringToDate(timeString: string, baseDate: Date): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(baseDate);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  private closeMenu(): void {
    if (this.menuTrigger() && this.menuTrigger()!.menuOpen) {
      this.menuTrigger()!.closeMenu();
    }
  }
}

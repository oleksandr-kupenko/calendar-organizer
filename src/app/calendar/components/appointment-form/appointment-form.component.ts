import {Component, EventEmitter, inject, input, OnInit, Output, signal} from '@angular/core';
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
import {getUniqueId} from '../../../utils';
import {AppointmentFormData, CalendarAppointment} from '../../models/calendar.models';

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
    MatCardModule
  ],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss'
})
export class AppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  appointment = input.required<CalendarAppointment | null>();
  selectedDate = input.required<Date | null>();
  editAppointmentMode = input.required<boolean>();

  @Output() save = new EventEmitter<CalendarAppointment>();
  @Output() update = new EventEmitter<CalendarAppointment>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  public appointmentForm!: FormGroup;

  constructor() {}

  ngOnInit() {
    this.appointmentForm = this.fb.nonNullable.group(
      {
        title: ['', Validators.required],
        description: new FormControl<string | null>(''),
        date: [new Date(), Validators.required],
        startTime: ['09:00', Validators.required],
        endTime: ['10:00', Validators.required],
        color: ['#3f51b5']
      },
      {
        validators: this.timeRangeValidator
      }
    );

    if (this.selectedDate()) {
      this.appointmentForm.patchValue({
        date: this.selectedDate()
      });
    }

    if (this.editAppointmentMode() && this.appointment()) {
      const appointment = this.appointment()!;
      this.appointmentForm.patchValue({
        title: appointment.title,
        description: appointment.description || '',
        date: new Date(appointment.date),
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        color: appointment.color || '#3f51b5'
      });
    }
  }

  timeRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const startTime = group.get('startTime')?.value;
    const endTime = group.get('endTime')?.value;

    if (!startTime || !endTime) {
      return null;
    }

    if (startTime >= endTime) {
      setTimeout(() => {
        console.log('ERROR', this.appointmentForm.hasError('timeRange'), this.appointmentForm);
      }, 1000);
      return {timeRange: true};
    }
    console.log('NO ERROR');
    return null;
  };

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;

      if (this.editAppointmentMode() && this.appointment()) {
        const updatedAppointment: CalendarAppointment = {
          id: this.appointment()!.id,
          title: formValue.title,
          description: formValue.description,
          date: formValue.date,
          startTime: formValue.startTime,
          endTime: formValue.endTime,
          color: formValue.color
        };

        this.update.emit(updatedAppointment);
      } else {
        const newAppointment: CalendarAppointment = {
          id: getUniqueId(),
          title: formValue.title,
          description: formValue.description,
          date: formValue.date,
          startTime: formValue.startTime,
          endTime: formValue.endTime,
          color: formValue.color
        };

        this.save.emit(newAppointment);
      }

      this.appointmentForm.reset({
        date: new Date(),
        startTime: '09:00',
        endTime: '10:00',
        color: '#3f51b5'
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onDelete(): void {
    if (this.appointment()) {
      this.delete.emit(this.appointment()!.id);
    }
  }
}

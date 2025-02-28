import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
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
import {animate, style, transition, trigger} from '@angular/animations';
import {provideAnimations} from '@angular/platform-browser/animations';
import {CalendarDayComponent} from './components/calendar-day/calendar-day.component';

@Component({
  selector: 'app-calendar',
  imports: [
    MatIcon,
    MatButton,
    AppointmentFormComponent,
    MatMenuModule,
    MatNativeDateModule,
    CalendarHeaderComponent,
    ResizeDirective,
    CalendarDayComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  standalone: true,
  providers: [provideAnimations()],
  animations: [
    trigger('slideAnimation', [
      transition('* => next', [
        style({transform: 'translateX(100%)', opacity: 0}),
        animate('100ms ease-out', style({transform: 'translateX(0)', opacity: 1}))
      ]),
      transition('* => prev', [
        style({transform: 'translateX(-100%)', opacity: 0}),
        animate('100ms ease-out', style({transform: 'translateX(0)', opacity: 1}))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent {
  private calendarService = inject(CalendarService);

  public calendarSectionEl = viewChild<ElementRef>('calendarSectionRef');

  public slideDirection = toSignal(this.calendarService.slideDirection$);
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

  constructor() {
    effect(() => {
      if (this.calendarSectionEl()?.nativeElement) {
        this.wheelListener();
      }
    });
  }

  public handleDayClick(day: CalendarDay, menuTrigger: MatMenuTrigger): void {}

  public handleAppointmentClick(appointment: CalendarAppointment, menuTrigger: MatMenuTrigger, event: Event): void {}

  public onDrop(event: CdkDragDrop<Date>): void {
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

  public onAnimationDone(): void {
    this.calendarService.resetSlideDirection();
  }

  private wheelListener() {
    this.calendarSectionEl()!.nativeElement.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        event.preventDefault();
        if (event.deltaY > 0) {
          this.calendarService.nextMonth();
        } else {
          this.calendarService.previousMonth();
        }
      },
      {passive: false}
    );
  }
}

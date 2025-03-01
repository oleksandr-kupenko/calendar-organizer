import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild
} from '@angular/core';
import {AppointmentFormComponent} from './components/appointment-form/appointment-form.component';
import {CalendarDayCellComponent} from '@calendar/containers/calendar-grid/components/calendar-day-cell/calendar-day-cell.component';
import {CalendarHeaderComponent} from './components/calendar-header/calendar-header.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {animate, style, transition, trigger} from '@angular/animations';
import {CalendarService} from '../../calendar.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {ElementSize} from '@core/models/resize.model';
import {WEEKS_PER_MONTH} from '@core/constants/calendar-grid.constants';
import {CalendarAppointment, CalendarDay} from '../../models/calendar.models';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {MatNativeDateModule} from '@angular/material/core';
import {ResizeDirective} from '@core/directives/resize.directive';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-calendar-grid',
  imports: [
    MatIcon,
    MatButton,
    AppointmentFormComponent,
    MatMenuModule,
    MatNativeDateModule,
    CalendarHeaderComponent,
    ResizeDirective,
    CalendarDayCellComponent,
    MatProgressSpinner
  ],
  templateUrl: './calendar-grid.component.html',
  styleUrl: './calendar-grid.component.scss',
  providers: [],
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
  ]
})
export class CalendarGridComponent implements OnDestroy {
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

  private wheelEventHandler: ((event: WheelEvent) => void) | null = null;

  constructor() {
    effect(() => {
      if (this.calendarSectionEl()?.nativeElement) {
        this.addWheelListener();
      }
    });
  }

  ngOnDestroy(): void {
    this.removeWheelListener();
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

  private addWheelListener(): void {
    this.wheelEventHandler = (event: WheelEvent) => {
      const targetElement = event.target as HTMLElement;
      const cellContent = targetElement.closest('.day-content');

      if (cellContent && cellContent.scrollHeight > cellContent.clientHeight) {
        return;
      }

      event.preventDefault();
      if (event.deltaY > 0) {
        this.calendarService.nextMonth();
      } else {
        this.calendarService.previousMonth();
      }
    };

    this.calendarSectionEl()!.nativeElement.addEventListener('wheel', this.wheelEventHandler, {passive: false});
  }

  private removeWheelListener(): void {
    if (this.calendarSectionEl()?.nativeElement && this.wheelEventHandler) {
      this.calendarSectionEl()!.nativeElement.removeEventListener('wheel', this.wheelEventHandler);
      this.wheelEventHandler = null;
    }
  }
}

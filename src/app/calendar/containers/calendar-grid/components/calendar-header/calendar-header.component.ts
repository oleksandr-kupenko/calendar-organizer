import {Component, computed, inject} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {CalendarService} from '@calendar/calendar.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {DatePipe} from '@angular/common';
import {CalendarMonth} from '@calendar/models/calendar.models';
import {HeaderLayoutComponent} from 'src/app/layouts/header-layout/header-layout.component';

@Component({
  selector: 'app-calendar-header',
  imports: [MatButton, MatIcon, MatIconButton, DatePipe, HeaderLayoutComponent],
  templateUrl: './calendar-header.component.html',
  styleUrl: './calendar-header.component.scss'
})
export class CalendarHeaderComponent {
  private calendarService = inject(CalendarService);

  public readonly currentDate = toSignal(this.calendarService.getCurrentDate$);
  public readonly currentMonth = toSignal(this.calendarService.getCalendarMonth$);

  public isTodayButtonDisabled = computed(() => {
    if (!this.currentDate() || !this.currentMonth()) {
      return true;
    }
    return this.isDateInCalendarRange(this.currentMonth()!);
  });

  constructor() {}

  previousMonth(): void {
    this.calendarService.previousMonth();
  }

  nextMonth(): void {
    this.calendarService.nextMonth();
  }

  goToToday(): void {
    this.calendarService.goToToday();
  }

  private isDateInCalendarRange(month: CalendarMonth): boolean {
    if (month.weeks.length === 0 || month.weeks[0].days.length === 0) {
      return false;
    }
    const today = new Date();
    const firstMonthDate = month.weeks[0].days[0].date;
    const lastWeek = month.weeks[month.weeks.length - 1];
    const lastMonthDate = lastWeek.days[lastWeek.days.length - 1].date;

    return today.getTime() >= firstMonthDate.getTime() && today.getTime() <= lastMonthDate.getTime();
  }
}

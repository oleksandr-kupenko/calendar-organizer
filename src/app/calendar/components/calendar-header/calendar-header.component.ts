import {Component, inject} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatToolbar} from '@angular/material/toolbar';
import {CalendarService} from '../../calendar.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-calendar-header',
  imports: [MatButton, MatIcon, MatIconButton, MatToolbar, DatePipe],
  templateUrl: './calendar-header.component.html',
  styleUrl: './calendar-header.component.scss'
})
export class CalendarHeaderComponent {
  private calendarService = inject(CalendarService);

  public readonly currentDate = toSignal(this.calendarService.currentDate$);

  previousMonth(): void {
    this.calendarService.previousMonth();
  }

  nextMonth(): void {
    this.calendarService.nextMonth();
  }

  goToToday(): void {
    this.calendarService.goToToday();
  }
}

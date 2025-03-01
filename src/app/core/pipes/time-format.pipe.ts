import {Pipe, PipeTransform} from '@angular/core';

//formating 24 hour time to 12 hour time

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {
  transform(time: string, shouldConvert: boolean = true): string {
    if (!time || !shouldConvert) {
      return time;
    }

    const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));

    if (isNaN(hours) || isNaN(minutes)) {
      return time;
    }

    let period = 'AM';
    let hour = hours;

    if (hours >= 12) {
      period = 'PM';
      hour = hours === 12 ? 12 : hours - 12;
    } else if (hours === 0) {
      hour = 12;
    }

    return `${hour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}

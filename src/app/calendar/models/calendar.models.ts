export interface CalendarAppointment {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  color?: string;
}

export interface ExtendedCalendarAppointment extends CalendarAppointment {
  top: number;
  height: number;
  left: string;
  width: string;
}

export interface CalendarDay {
  id: string;
  date: Date;
  appointments: CalendarAppointment[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[];
  id: string;
}

export interface CalendarMonth {
  year: number;
  month: number;
  weeks: CalendarWeek[];
}

// Form Model
export interface AppointmentFormData {
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  color?: string;
}

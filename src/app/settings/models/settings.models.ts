export enum TIME_FORMAT {
  twelveHour = '12',
  twentyFourHour = '24'
}

export enum DATE_FORMAT {
  mmDdYyyy = 'MM/dd/yyyy',
  ddMmYyyy = 'dd/MM/yyyy',
  yyyyMmDd = 'yyyy-MM-dd',
  mmmDYyyy = 'MMM d, yyyy'
}

export enum THEME_MODE {
  light = 'light',
  dark = 'dark',
  auto = 'auto'
}

export interface AppSettings {
  timeFormat: TIME_FORMAT;
  dateFormat: DATE_FORMAT;
  theme: THEME_MODE;
}

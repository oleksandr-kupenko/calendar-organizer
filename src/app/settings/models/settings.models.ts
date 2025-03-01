export enum REGION_FORMAT {
  european = 'european',
  american = 'american'
}

export enum THEME_MODE {
  light = 'light',
  dark = 'dark',
  auto = 'auto'
}

export interface AppSettings {
  regionFormat: REGION_FORMAT;
  theme: THEME_MODE;
}

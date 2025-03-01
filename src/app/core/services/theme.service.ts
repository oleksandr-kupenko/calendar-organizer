import {inject, Injectable} from '@angular/core';
import {SettingsService} from 'src/app/settings/settings.service';
import {BehaviorSubject} from 'rxjs';
import {THEME_MODE} from 'src/app/settings/models/settings.models';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private settingsService = inject(SettingsService);

  private currentTheme$$ = new BehaviorSubject<THEME_MODE.dark | THEME_MODE.light>(THEME_MODE.light);

  public getCurrentTheme$ = this.currentTheme$$.asObservable();

  private mediaQueryList: MediaQueryList;

  constructor() {
    this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    this.mediaQueryList.addEventListener('change', e => {
      this.handleSystemThemeChange(e);
    });

    this.settingsService.getSettings$.subscribe(settings => {
      if (settings) {
        if (settings.theme === THEME_MODE.auto) {
          const systemTheme = this.getSystemTheme();
          document.documentElement.setAttribute('data-theme', systemTheme);
          this.currentTheme$$.next(systemTheme);
        } else {
          document.documentElement.setAttribute('data-theme', settings.theme);
          this.currentTheme$$.next(settings.theme as THEME_MODE.dark | THEME_MODE.light);
        }
      }
    });
  }

  private getSystemTheme(): THEME_MODE.dark | THEME_MODE.light {
    return this.mediaQueryList.matches ? THEME_MODE.dark : THEME_MODE.light;
  }

  private handleSystemThemeChange(e: MediaQueryListEvent): void {
    this.settingsService.getSettings$
      .subscribe(settings => {
        if (settings && settings.theme === THEME_MODE.auto) {
          const newTheme = e.matches ? THEME_MODE.dark : THEME_MODE.light;
          document.documentElement.setAttribute('data-theme', newTheme);
          this.currentTheme$$.next(newTheme);
        }
      })
      .unsubscribe();
  }
}

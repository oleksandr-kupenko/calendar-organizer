import {inject, Injectable} from '@angular/core';
import {AppSettings, DATE_FORMAT, THEME_MODE, TIME_FORMAT} from 'src/app/settings/models/settings.models';
import {BehaviorSubject} from 'rxjs';
import {LocalStorageService} from '@core/services/local-storage.service';

@Injectable({providedIn: 'root'})
export class SettingsService {
  private localStorageService = inject(LocalStorageService);

  private settings$$ = new BehaviorSubject<AppSettings | null>(null);

  public getSettings$ = this.settings$$.asObservable();

  private defaultSettings: AppSettings = {
    timeFormat: TIME_FORMAT.twentyFourHour,
    dateFormat: DATE_FORMAT.mmDdYyyy,
    theme: THEME_MODE.auto
  };

  constructor() {
    this.initSettings();
  }

  public getDefaultSettings(): AppSettings {
    return this.defaultSettings;
  }

  public saveSettings(settings: AppSettings): void {
    console.log('SAVE SETTINGS', settings);
    this.settings$$.next(settings);
    this.localStorageService.saveSettings(settings);
  }

  private initSettings() {
    const savedSettings = this.localStorageService.getSettings() || this.defaultSettings;
    this.settings$$.next(savedSettings);
  }
}

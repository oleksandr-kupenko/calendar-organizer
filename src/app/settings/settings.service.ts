import {Injectable} from '@angular/core';
import {AppSettings} from 'src/app/settings/models/settings.models';
import {BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class SettingsService {
  private settings$$ = new BehaviorSubject<AppSettings | null>(null);

  public settings$ = this.settings$$.asObservable();

  constructor() {}

  public saveSettings(settings: AppSettings): void {
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  public getCurrentSettings(): AppSettings | null {
    const settings = localStorage.getItem('settings');
    return settings ? JSON.parse(settings) : null;
  }

  private initSettings() {}
}

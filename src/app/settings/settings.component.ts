import {Component, inject, OnInit} from '@angular/core';
import {HeaderLayoutComponent} from '../layouts/header-layout/header-layout.component';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {SettingsService} from 'src/app/settings/settings.service';
import {MatCardModule} from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {DATE_FORMAT, THEME_MODE, TIME_FORMAT} from 'src/app/settings/models/settings.models';

@Component({
  selector: 'app-settings',
  imports: [
    HeaderLayoutComponent,
    MatCardModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);

  public settingsForm!: FormGroup;

  public timeFormats = [
    {label: '12-hour format (AM/PM)', value: TIME_FORMAT.twelveHour},
    {label: '24-hour format', value: TIME_FORMAT.twentyFourHour}
  ];

  public dateFormats = [
    {label: 'MM/DD/YYYY', value: DATE_FORMAT.mmDdYyyy},
    {label: 'DD/MM/YYYY', value: DATE_FORMAT.ddMmYyyy},
    {label: 'YYYY-MM-DD', value: DATE_FORMAT.yyyyMmDd},
    {label: 'MMM D, YYYY', value: DATE_FORMAT.mmmDYyyy}
  ];

  public themeOptions = [
    {label: 'Light', value: THEME_MODE.light},
    {label: 'Dark', value: THEME_MODE.dark},
    {label: 'Auto (system default)', value: THEME_MODE.auto}
  ];

  ngOnInit() {
    this.initForm();
    this.loadCurrentSettings();
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      timeFormat: [TIME_FORMAT.twentyFourHour],
      dateFormat: [DATE_FORMAT.mmDdYyyy],
      theme: [THEME_MODE.auto]
    });
  }

  private loadCurrentSettings(): void {
    const currentSettings = this.settingsService.getCurrentSettings();
    if (currentSettings) {
      this.settingsForm.patchValue({
        timeFormat: currentSettings.timeFormat,
        dateFormat: currentSettings.dateFormat,
        theme: currentSettings.theme
      });
    }
  }

  public onSubmit(): void {
    if (this.settingsForm.valid) {
      this.settingsService.saveSettings(this.settingsForm.value);
    }
  }

  public onCancel(): void {
    this.loadCurrentSettings();
  }

  public resetToDefaults(): void {
    this.settingsForm.setValue({
      timeFormat: TIME_FORMAT.twentyFourHour,
      dateFormat: DATE_FORMAT.mmDdYyyy,
      theme: THEME_MODE.auto
    });
  }
}

import {Component, inject, OnInit} from '@angular/core';
import {HeaderLayoutComponent} from '../layouts/header-layout/header-layout.component';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {SettingsService} from 'src/app/settings/settings.service';
import {MatCardModule} from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {REGION_FORMAT, THEME_MODE} from 'src/app/settings/models/settings.models';
import {take} from 'rxjs';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  imports: [
    HeaderLayoutComponent,
    MatCardModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);

  public settingsForm!: FormGroup;

  public regionFormats = [
    {
      label: 'European',
      value: REGION_FORMAT.european,
      hint: 'Date: DD/MM/YYYY, Time: 24-hour format (14:30)'
    },
    {
      label: 'American',
      value: REGION_FORMAT.american,
      hint: 'Date: MM/DD/YYYY, Time: 12-hour format (2:30 PM)'
    }
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
    this.settingsForm = this.fb.group(this.settingsService.getDefaultSettings());
  }

  private loadCurrentSettings(): void {
    this.settingsService.getSettings$
      .pipe(
        filter(settings => !!settings),
        // unsubscribe after first value
        take(1)
      )
      .subscribe(settings => {
        if (settings) {
          this.settingsForm.patchValue({
            regionFormat: settings.regionFormat,
            theme: settings.theme
          });
        }
      });
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
    this.settingsForm.setValue(this.settingsService.getDefaultSettings());
  }
}

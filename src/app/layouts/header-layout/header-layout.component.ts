import {Component, inject, input, OnInit} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatToolbar} from '@angular/material/toolbar';
import {Router, RouterLink} from '@angular/router';
import {Location} from '@angular/common';
import {NavigationHistoryService} from '@core/services/navigation-history.service';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-header-layout',
  imports: [MatIcon, MatIconButton, MatToolbar, RouterLink, MatTooltip],
  templateUrl: './header-layout.component.html',
  styleUrl: './header-layout.component.scss'
})
export class HeaderLayoutComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private navigationHistoryService = inject(NavigationHistoryService);

  layoutTitle = input<string | null>('Calendar');
  defaultBackLink = input('');
  useLocationBackLink = input<boolean>(false);

  ngOnInit() {}

  onGoBack() {
    if (this.navigationHistoryService.hasPreviousNavigation() && this.useLocationBackLink()) {
      this.location.back();
    } else if (this.defaultBackLink()) {
      this.router.navigateByUrl(this.defaultBackLink());
    }
  }
}

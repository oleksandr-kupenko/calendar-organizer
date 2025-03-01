import {Component, inject, input, OnInit} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatToolbar} from '@angular/material/toolbar';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {filter} from 'rxjs';
import {Location} from '@angular/common';
import {NavigationHistoryService} from '../../core/services/navigation-history.service';

@Component({
  selector: 'app-header-layout',
  imports: [MatIcon, MatIconButton, MatToolbar, RouterLink],
  templateUrl: './header-layout.component.html',
  styleUrl: './header-layout.component.scss'
})
export class HeaderLayoutComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private navigationHistoryService = inject(NavigationHistoryService);

  layoutTitle = input<string | null>('Calendar');
  defaultBackLink = input('');

  ngOnInit() {}

  onGoBack() {
    if (this.navigationHistoryService.hasPreviousNavigation()) {
      console.log('LOCATION BACK', this.navigationHistoryService.getPreviousUrl());
      this.location.back();
    } else if (this.defaultBackLink()) {
      console.log('DEFAULT');
      this.router.navigateByUrl(this.defaultBackLink());
    }
  }
}

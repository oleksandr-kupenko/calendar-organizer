import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationHistoryService {
  private historyLimit = 2;
  private history: string[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.history.push(event.urlAfterRedirects);
      if (this.history.length > this.historyLimit) {
        this.history.shift();
      }
    });
  }

  public hasPreviousNavigation(): boolean {
    return this.history.length > 0;
  }
}

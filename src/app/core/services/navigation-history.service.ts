import {DestroyRef, inject, Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class NavigationHistoryService {
  private historyLimit = 2;
  private history: string[] = [];

  public destroyRef = inject(DestroyRef);

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        // NOTE  unsubscribe is unnecessary, but will be triggered when the service instance is destroyed (although this will never happen, because it is in the root module)
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
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

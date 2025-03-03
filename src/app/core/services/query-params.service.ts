import {DestroyRef, inject, Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Injectable({providedIn: 'root'})
export class QueryParamsService {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  public destroyRef = inject(DestroyRef);

  setDateParams(year: number, month: number): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {year, month},
      queryParamsHandling: 'merge'
    });
  }

  getDateParams(): {year: number; month: number} | null {
    let result = null;
    this.activatedRoute.queryParams
      // NOTE  unsubscribe is unnecessary, but will be triggered when the service instance is destroyed (although this will never happen, because it is in the root module)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        if (params['year'] && params['month']) {
          result = {
            year: +params['year'],
            month: +params['month']
          };
        }
      });

    return result;
  }
}

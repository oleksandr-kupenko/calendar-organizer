import {inject, Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class QueryParamsService {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  setDateParams(year: number, month: number): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {year, month},
      queryParamsHandling: 'merge'
    });
  }

  getDateParams(): {year: number; month: number} | null {
    let result = null;

    this.activatedRoute.queryParams.subscribe(params => {
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

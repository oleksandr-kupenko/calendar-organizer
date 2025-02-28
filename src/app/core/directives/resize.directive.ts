import {Directive, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output, effect, input} from '@angular/core';
import {ElementSize} from '../models/resize.model';

@Directive({
  selector: '[listenResize]',
  standalone: true
})
export class ResizeDirective implements OnDestroy {
  disableResizeChecking = input<boolean>(false);
  skipFirstValue = input<boolean>(false);
  firstChildResize = input<boolean>(false);
  listenResizeDelay = input<number>(0);

  @Output() listenResize = new EventEmitter<ElementSize>();

  private resizeObserver: ResizeObserver | null = null;
  private isFirstValue = true;
  private observedElement: Element | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private el: ElementRef,
    private zone: NgZone
  ) {
    effect(() => {
      this.cleanupResizeObserver();
      if (!this.disableResizeChecking()) {
        this.setupResizeObserver();
      }
    });
  }

  ngOnDestroy() {
    this.cleanupResizeObserver();
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  private setupResizeObserver() {
    this.observedElement = this.getElementToObserve();
    if (!this.observedElement) {
      console.warn('No element to observe');
      return;
    }

    this.resizeObserver = new ResizeObserver(entries => {
      this.zone.runOutsideAngular(() => {
        const entry = entries[0];
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (!this.skipFirstValue() || (this.skipFirstValue() && !this.isFirstValue)) {
          this.emitResizeWithDelay({width, height});
        }
        this.isFirstValue = false;
      });
    });

    this.resizeObserver.observe(this.observedElement);
  }

  private emitResizeWithDelay(size: ElementSize) {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.zone.run(() => {
        this.listenResize.emit(size);
      });
    }, this.listenResizeDelay());
  }

  private cleanupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.observedElement = null;
    this.isFirstValue = true;
  }

  private getElementToObserve(): Element | null {
    if (this.firstChildResize()) {
      const firstChild = this.el.nativeElement.firstElementChild;
      if (!firstChild) {
        console.warn('No first child element found');
        return null;
      }
      return firstChild;
    }
    return this.el.nativeElement;
  }
}

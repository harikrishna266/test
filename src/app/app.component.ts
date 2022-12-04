import {AfterViewInit, Component} from '@angular/core';
import {filter, mapTo, scan} from 'rxjs/operators';
import {interval, merge, Observable, Subject, } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit{

  INTERVAL = 300;
  counter$!: Observable<number>;
  resetClick$: Subject<number> = new Subject();
  isTicking = false;

  timer$!: Observable<boolean>;

  ngAfterViewInit() {
     this.startTimer();
  }

  startTimer(): void {
    this.generateTimer()
    this.startCounter();
  }

  generateTimer(): void {
    this.timer$ = interval(this.INTERVAL).pipe(
      mapTo(true),
      filter(e => e === this.isTicking)
    );
  }

  startCounter(): void {
    this.counter$ = merge(this.timer$, this.resetClick$).pipe(
      scan((acc, newVal) => acc = newVal === -1 ? 0 : acc + 1, 0)
    )
  }

  resetCounterToZero(): void {
    this.resetClick$.next(-1);
  }

  assignTickerStatus(status: boolean): void {
    this.isTicking = status;
  }
}

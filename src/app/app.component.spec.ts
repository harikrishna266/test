import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import {AppComponent} from './app.component';
import {BrowserModule, By} from "@angular/platform-browser";
import {MatBadgeModule} from "@angular/material/badge";
import {FormsModule} from "@angular/forms";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let startButton: DebugElement;
  let pauseButton: DebugElement;
  let resetButton: DebugElement;
  const noOfCycles = 100;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserModule, FormsModule, FlexLayoutModule, MatButtonModule, MatIconModule, MatBadgeModule, BrowserAnimationsModule
      ],
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    startButton = fixture.debugElement.query(By.css('.start-button'));
    pauseButton = fixture.debugElement.query(By.css('.pause-button'));
    resetButton = fixture.debugElement.query(By.css('.reset'));
    spyOn(component, 'assignTickerStatus').and.callThrough();
    component.isTicking = false;
    component.startTimer();
  });

  const clickStartButton = () => {
    startButton.triggerEventHandler('click', null);
    expect(component.assignTickerStatus).toHaveBeenCalled();
    component.isTicking = true;
    fixture.detectChanges();
  }

  const clickStopButton = () => {
    pauseButton.triggerEventHandler('click', null);
    expect(component.assignTickerStatus).toHaveBeenCalled();
    component.isTicking = false;
    fixture.detectChanges();
  }

  const clickResetButton = () => {
    spyOn(component, 'resetCounterToZero').and.callThrough();
    resetButton.triggerEventHandler('click', null);
    expect(component.resetCounterToZero).toHaveBeenCalled();
    fixture.detectChanges();
  }

  const getTimerValue = () => {
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('.mat-badge-content'));
    return badge.nativeElement.textContent.trim();
  }

  it(`should be able to assign the ticker status `, fakeAsync(() => {
    component.assignTickerStatus(true);
    expect(component.isTicking).toBe(true);
    component.assignTickerStatus(false);
    expect(component.isTicking).toBe(false);
    discardPeriodicTasks();
  }));


  const checkIfCounterIsAlsoIncrementingWithTimer = (startIndex = 0) => {
    Array(noOfCycles)
      .fill(1)
      .map((e: number) => e + startIndex)
      .map((e, index) => {
        tick(component.INTERVAL);
        expect(getTimerValue()).toBe((index + startIndex + 1).toString())
      });
  }

  it(`Click the start button and the counter should start counting`, fakeAsync(() => {
    clickStartButton();
    checkIfCounterIsAlsoIncrementingWithTimer();
    discardPeriodicTasks();
  }));

  it('The counter should not increment after the pause button is clicked', fakeAsync(() => {
    clickStartButton();
    checkIfCounterIsAlsoIncrementingWithTimer();
    clickStopButton();
    tick(component.INTERVAL * noOfCycles); // wait for some time to see if the counter has actually stopped.
    expect(getTimerValue()).toBe(noOfCycles.toString());
    discardPeriodicTasks(); // clear of all the timers
  }))

  it('On clicking start button after the counter is paused, the counter should run from where it was paused', fakeAsync(() => {
    clickStartButton();
    checkIfCounterIsAlsoIncrementingWithTimer();
    clickStopButton();
    tick(component.INTERVAL * noOfCycles); // wait for some time
    expect(getTimerValue()).toBe((noOfCycles).toString()) // here the counter should hold its values
    clickStartButton();
    checkIfCounterIsAlsoIncrementingWithTimer(noOfCycles); // 100, 101, 102....
    clickStopButton();
    expect(getTimerValue()).toBe((noOfCycles * 2).toString()) // counter should have 2*INTERVAL as the value
    tick(component.INTERVAL * noOfCycles); // wait for some time
    expect(getTimerValue()).toBe((noOfCycles * 2).toString()) // it should still have 2*INTERVAL as the value
    discardPeriodicTasks();
  }));

  it('The counter should reset the counter value whenever the reset button is clicked', fakeAsync(() => {
    clickStartButton();
    checkIfCounterIsAlsoIncrementingWithTimer();
    clickResetButton();
    checkIfCounterIsAlsoIncrementingWithTimer();
    discardPeriodicTasks();
  }))

  it('there should not be any count on the timer If the reset button is clicked while the counter is paused ', fakeAsync(() => {
    clickStartButton();
    checkIfCounterIsAlsoIncrementingWithTimer();
    clickStopButton();
    tick(component.INTERVAL * noOfCycles); // wait for some time
    clickResetButton();
    tick(component.INTERVAL * noOfCycles); // wait for some time
    const resetHidden = fixture.debugElement.query(By.css('.mat-badge-hidden'));
    expect(resetHidden).toBeTruthy();
    discardPeriodicTasks();
  }))

});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OhlcComponent } from './ohlc.component';

describe('OhlcComponent', () => {
  let component: OhlcComponent;
  let fixture: ComponentFixture<OhlcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OhlcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OhlcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

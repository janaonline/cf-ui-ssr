import { ComponentFixture, TestBed } from '@angular/core/testing';

import { National } from './national';

describe('National', () => {
  let component: National;
  let fixture: ComponentFixture<National>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [National]
    })
    .compileComponents();

    fixture = TestBed.createComponent(National);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

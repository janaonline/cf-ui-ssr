import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackWidget } from './feedback-widget';

describe('FeedbackWidget', () => {
  let component: FeedbackWidget;
  let fixture: ComponentFixture<FeedbackWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialPerformance } from './financial-performance';

describe('FinancialPerformance', () => {
  let component: FinancialPerformance;
  let fixture: ComponentFixture<FinancialPerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialPerformance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialPerformance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

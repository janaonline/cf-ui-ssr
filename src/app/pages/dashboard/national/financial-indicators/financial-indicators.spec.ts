import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialIndicators } from './financial-indicators';

describe('FinancialIndicators', () => {
  let component: FinancialIndicators;
  let fixture: ComponentFixture<FinancialIndicators>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialIndicators]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialIndicators);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

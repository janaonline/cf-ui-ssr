import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialIndicator } from './financial-indicator';

describe('FinancialIndicator', () => {
  let component: FinancialIndicator;
  let fixture: ComponentFixture<FinancialIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialIndicator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialIndicator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

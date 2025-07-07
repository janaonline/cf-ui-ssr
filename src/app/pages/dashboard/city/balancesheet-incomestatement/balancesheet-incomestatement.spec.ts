import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancesheetIncomestatement } from './balancesheet-incomestatement';

describe('BalancesheetIncomestatement', () => {
  let component: BalancesheetIncomestatement;
  let fixture: ComponentFixture<BalancesheetIncomestatement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalancesheetIncomestatement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalancesheetIncomestatement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

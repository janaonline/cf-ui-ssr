import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowingCreditRating } from './borrowing-credit-rating';

describe('BorrowingCreditRating', () => {
  let component: BorrowingCreditRating;
  let fixture: ComponentFixture<BorrowingCreditRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BorrowingCreditRating]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BorrowingCreditRating);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

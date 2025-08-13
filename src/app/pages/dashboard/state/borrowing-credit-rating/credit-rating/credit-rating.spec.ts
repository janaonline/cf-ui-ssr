import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditRating } from './credit-rating';

describe('CreditRating', () => {
  let component: CreditRating;
  let fixture: ComponentFixture<CreditRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditRating]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditRating);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

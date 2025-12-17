import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketReadiness } from './market-readiness';

describe('MarketReadiness', () => {
  let component: MarketReadiness;
  let fixture: ComponentFixture<MarketReadiness>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketReadiness]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketReadiness);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

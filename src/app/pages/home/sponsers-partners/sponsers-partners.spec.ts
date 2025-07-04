import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsersPartners } from './sponsers-partners';

describe('SponsersPartners', () => {
  let component: SponsersPartners;
  let fixture: ComponentFixture<SponsersPartners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsersPartners]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SponsersPartners);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

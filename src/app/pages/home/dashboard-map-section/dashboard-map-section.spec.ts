import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMapSection } from './dashboard-map-section';

describe('DashboardMapSection', () => {
  let component: DashboardMapSection;
  let fixture: ComponentFixture<DashboardMapSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMapSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMapSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UlbDashboard } from './ulb-dashboard';

describe('UlbDashboard', () => {
  let component: UlbDashboard;
  let fixture: ComponentFixture<UlbDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UlbDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UlbDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

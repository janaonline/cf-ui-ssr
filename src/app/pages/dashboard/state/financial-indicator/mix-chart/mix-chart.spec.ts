import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MixChart } from './mix-chart';

describe('MixChart', () => {
  let component: MixChart;
  let fixture: ComponentFixture<MixChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MixChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MixChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

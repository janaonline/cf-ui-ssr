import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalChart } from './national-chart';

describe('NationalChart', () => {
  let component: NationalChart;
  let fixture: ComponentFixture<NationalChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

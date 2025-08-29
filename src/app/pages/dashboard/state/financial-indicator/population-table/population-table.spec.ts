import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopulationTable } from './population-table';

describe('PopulationTable', () => {
  let component: PopulationTable;
  let fixture: ComponentFixture<PopulationTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopulationTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopulationTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

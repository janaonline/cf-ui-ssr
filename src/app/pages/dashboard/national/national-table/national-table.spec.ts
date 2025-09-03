import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalTable } from './national-table';

describe('NationalTable', () => {
  let component: NationalTable;
  let fixture: ComponentFixture<NationalTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataAvailability } from './data-availability';

describe('DataAvailability', () => {
  let component: DataAvailability;
  let fixture: ComponentFixture<DataAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAvailability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataAvailability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

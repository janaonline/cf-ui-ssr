import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiaMap } from './india-map';

describe('IndiaMap', () => {
  let component: IndiaMap;
  let fixture: ComponentFixture<IndiaMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndiaMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndiaMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

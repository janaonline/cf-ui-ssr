import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Slb } from './slb';

describe('Slb', () => {
  let component: Slb;
  let fixture: ComponentFixture<Slb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Slb]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Slb);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

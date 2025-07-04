import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Spotlight } from './spotlight';

describe('Spotlight', () => {
  let component: Spotlight;
  let fixture: ComponentFixture<Spotlight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spotlight]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Spotlight);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

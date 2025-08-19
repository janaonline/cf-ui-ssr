import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareBy } from './compare-by';

describe('CompareBy', () => {
  let component: CompareBy;
  let fixture: ComponentFixture<CompareBy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareBy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareBy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

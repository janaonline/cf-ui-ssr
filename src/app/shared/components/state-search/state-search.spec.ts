import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateSearch } from './state-search';

describe('StateSearch', () => {
  let component: StateSearch;
  let fixture: ComponentFixture<StateSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

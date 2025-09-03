import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareByDialog } from './compare-by-dialog';

describe('CompareByDialog', () => {
  let component: CompareByDialog;
  let fixture: ComponentFixture<CompareByDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareByDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareByDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

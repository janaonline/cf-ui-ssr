import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsPdfsDialog } from './afs-pdfs-dialog';

describe('AfsPdfsDialog', () => {
  let component: AfsPdfsDialog;
  let fixture: ComponentFixture<AfsPdfsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsPdfsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsPdfsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

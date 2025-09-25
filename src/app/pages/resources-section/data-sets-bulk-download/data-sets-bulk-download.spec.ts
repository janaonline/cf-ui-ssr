import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSetsBulkDownload } from './data-sets-bulk-download';

describe('DataSetsBulkDownload', () => {
  let component: DataSetsBulkDownload;
  let fixture: ComponentFixture<DataSetsBulkDownload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataSetsBulkDownload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataSetsBulkDownload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

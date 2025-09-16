import { TestBed } from '@angular/core/testing';

import { NationalDashboard } from './national-dashboard';

describe('NationalDashboard', () => {
  let service: NationalDashboard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NationalDashboard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

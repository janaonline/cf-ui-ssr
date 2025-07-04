import { TestBed } from '@angular/core/testing';

import { UlbService } from './ulb.service';

describe('UlbService', () => {
  let service: UlbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UlbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { UserInfoDialogueService } from './user-info-dialogue-service';

describe('UserInfoDialogueService', () => {
  let service: UserInfoDialogueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserInfoDialogueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

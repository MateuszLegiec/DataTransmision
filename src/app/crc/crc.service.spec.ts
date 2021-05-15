import { TestBed } from '@angular/core/testing';

import { CrcService } from './crc.service';

describe('CrcService', () => {
  let service: CrcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

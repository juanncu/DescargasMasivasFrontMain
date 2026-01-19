import { TestBed } from '@angular/core/testing';

import { DescargaFolios } from './descarga-folios';

describe('DescargaFolios', () => {
  let service: DescargaFolios;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DescargaFolios);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

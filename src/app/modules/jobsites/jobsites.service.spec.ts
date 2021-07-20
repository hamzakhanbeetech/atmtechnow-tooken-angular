import { TestBed, inject } from '@angular/core/testing';

import { JobsitesService } from './jobsites.service';

describe('JobsitesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JobsitesService]
    });
  });

  it('should be created', inject([JobsitesService], (service: JobsitesService) => {
    expect(service).toBeTruthy();
  }));
});

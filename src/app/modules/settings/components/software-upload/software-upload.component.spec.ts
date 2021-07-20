import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoftwareUploadComponent } from './software-upload.component';

describe('SoftwareUploadComponent', () => {
  let component: SoftwareUploadComponent;
  let fixture: ComponentFixture<SoftwareUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoftwareUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoftwareUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddonServicesComponent } from './addon-services.component';

describe('AddonServicesComponent', () => {
  let component: AddonServicesComponent;
  let fixture: ComponentFixture<AddonServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddonServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddonServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

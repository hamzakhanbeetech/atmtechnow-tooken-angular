import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseDisputeComponent } from './raise-dispute.component';

describe('RaiseDisputeComponent', () => {
  let component: RaiseDisputeComponent;
  let fixture: ComponentFixture<RaiseDisputeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaiseDisputeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseDisputeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

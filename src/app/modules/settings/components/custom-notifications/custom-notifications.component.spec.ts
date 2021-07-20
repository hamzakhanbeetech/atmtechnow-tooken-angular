import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomNotificationsComponent } from './custom-notifications.component';

describe('CustomNotificationsComponent', () => {
  let component: CustomNotificationsComponent;
  let fixture: ComponentFixture<CustomNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksEnterpriseComponent } from './tasks-enterprise.component';

describe('TasksEnterpriseComponent', () => {
  let component: TasksEnterpriseComponent;
  let fixture: ComponentFixture<TasksEnterpriseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksEnterpriseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksEnterpriseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentSkillComponent } from './agent-skill.component';

describe('AgentSkillComponent', () => {
  let component: AgentSkillComponent;
  let fixture: ComponentFixture<AgentSkillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentSkillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentSkillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

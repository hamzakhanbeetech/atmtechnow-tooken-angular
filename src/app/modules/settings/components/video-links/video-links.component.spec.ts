import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoLinksComponent } from './video-links.component';

describe('VideoLinksComponent', () => {
  let component: VideoLinksComponent;
  let fixture: ComponentFixture<VideoLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickBooksComponent } from './quick-books.component';

describe('QuickBooksComponent', () => {
  let component: QuickBooksComponent;
  let fixture: ComponentFixture<QuickBooksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickBooksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

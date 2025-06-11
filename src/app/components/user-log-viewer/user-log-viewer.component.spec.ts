import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLogViewerComponent } from './user-log-viewer.component';

describe('UserLogViewerComponent', () => {
  let component: UserLogViewerComponent;
  let fixture: ComponentFixture<UserLogViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLogViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserLogViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

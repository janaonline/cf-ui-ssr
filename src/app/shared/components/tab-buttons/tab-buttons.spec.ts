import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabButtons } from './tab-buttons';

describe('TabButtons', () => {
  let component: TabButtons;
  let fixture: ComponentFixture<TabButtons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabButtons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabButtons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

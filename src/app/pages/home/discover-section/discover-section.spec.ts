import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverSection } from './discover-section';

describe('DiscoverSection', () => {
  let component: DiscoverSection;
  let fixture: ComponentFixture<DiscoverSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscoverSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridView } from './grid-view';
import { ExploresectionTable } from '../../../core/models/interfaces';

describe('GridView', () => {
  let component: GridView;
  let fixture: ComponentFixture<GridView>;

  const gridData: ExploresectionTable[] = [
    { sequence: 0, label: 'Population', value: '100', info: '', src: '', tooltip: '' },
    { sequence: 1, label: 'ULBs', value: '50', info: '', src: '', tooltip: '' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridView);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gridData', gridData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to a 3-column grid', () => {
    const gridEl: HTMLElement = fixture.nativeElement.querySelector('.explore-data-grid');
    expect(gridEl.classList.contains('explore-data-grid--cols-2')).toBeFalse();
  });

  // DJ2-478: Home Page / National Dashboard opt into a 2-column layout so their
  // remaining data cards form a clean grid with no blank cells.
  it('applies the cols-2 modifier class when columns=2', () => {
    fixture.componentRef.setInput('columns', 2);
    fixture.detectChanges();

    const gridEl: HTMLElement = fixture.nativeElement.querySelector('.explore-data-grid');
    expect(gridEl.classList.contains('explore-data-grid--cols-2')).toBeTrue();
  });
});

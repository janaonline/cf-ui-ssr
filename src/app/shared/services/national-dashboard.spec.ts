import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NationalDashboard } from './national-dashboard';
import { CommonService } from '../../core/services/common.service';
import { AssetsService } from '../../core/services/assets/assets.service';
import { ExploreSectionResponse, ExploresectionTable } from '../../core/models/interfaces';
import { ICreditRatingData } from '../../core/models/creditRating/creditRatingResponse';

describe('NationalDashboard', () => {
  let service: NationalDashboard;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let assetsServiceSpy: jasmine.SpyObj<AssetsService>;

  const baseGridDetails: ExploresectionTable[] = [
    { sequence: 0, label: 'Population', value: '100', info: '', src: '', tooltip: '' },
    { sequence: 1, label: 'ULBs', value: '50', info: '', src: '', tooltip: '' },
    { sequence: 2, label: 'States', value: '28', info: '', src: '', tooltip: '' },
  ];

  const exploreSectionResponse: ExploreSectionResponse = {
    gridDetails: baseGridDetails,
    lastModifiedAt: '2026-01-01',
    popCat: '',
    state: {} as any,
    ulbId: '',
    ulbName: '',
    ulbType: '' as any,
  };

  const creditRatingReport: ICreditRatingData[] = [
    { ulb: 'ULB A', state: 'Karnataka', agency: 'CRISIL', creditRating: 'AA', creditrating: 'AA', status: '', date: '' },
    { ulb: 'ULB B', state: 'Karnataka', agency: 'CRISIL', creditRating: 'BB', creditrating: 'BB', status: '', date: '' },
  ];

  beforeEach(() => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'getExploreSectionData',
      'setDataForVisualizationCount',
    ]);
    commonServiceSpy.getExploreSectionData.and.returnValue(of(exploreSectionResponse));

    assetsServiceSpy = jasmine.createSpyObj('AssetsService', ['fetchCreditRatingReport']);
    assetsServiceSpy.fetchCreditRatingReport.and.returnValue(of(creditRatingReport));

    TestBed.configureTestingModule({
      providers: [
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: AssetsService, useValue: assetsServiceSpy },
      ],
    });
    service = TestBed.inject(NationalDashboard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // DJ2-478: 'ULBs Credit Rating Reports' and 'ULBs With Investment Grade Rating'
  // must not appear on the Home Page.
  it('should hide the credit rating cards on the Home Page', () => {
    service.fetchCreditRatingsData('home', true);

    const labels = service.exploreData().gridDetails.map((item) => item.label);
    expect(labels).not.toContain('ULBs Credit Rating Reports');
    expect(labels).not.toContain('ULBs With Investment Grade Rating');
  });

  // DJ2-478: same two cards, plus the National-only 'ULBs With Rating A & Above'
  // card, must not appear on the National Dashboard.
  it('should hide the credit rating cards on the National Dashboard', () => {
    service.fetchCreditRatingsData('national');

    const labels = service.exploreData().gridDetails.map((item) => item.label);
    expect(labels).not.toContain('ULBs Credit Rating Reports');
    expect(labels).not.toContain('ULBs With Investment Grade Rating');
    expect(labels).not.toContain('ULBs With Rating A & Above');
  });

  // DJ2-478: hiding the credit rating cards should not disturb the other
  // dashboard cards or leave gaps in the grid.
  it('should keep the remaining grid cards unchanged and gapless', () => {
    service.fetchCreditRatingsData('national');

    const grid = service.exploreData().gridDetails;
    expect(grid.length).toBe(baseGridDetails.length);
    expect(grid.every((item) => !!item)).toBeTrue();
    expect(grid.map((item) => item.label)).toEqual(baseGridDetails.map((item) => item.label));
  });
});

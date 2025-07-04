import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { UserUtility } from '../../../core/util/user/user';
import { MapConfig, ResettableMap, StateGeoJson, ULBDataPoint } from './interfaces';
import { MapService } from './map.service';
import { allUlbsData } from '../../../core/constants/ulbsListLocalStorage';

@Component({
  selector: 'app-map',
  imports: [MatProgressSpinnerModule],
  providers: [UserUtility],
  template: `
    <!--
          <div class="d-flex"><div class="flex-grow-1 position-relative" style="min-height: 500px;"><div id="map-container" [class.state-highlight]="stateCode"></div></div></div>
          -->
    <div id="map-container" [class.state-highlight]="stateCode"></div>
    <!-- Loader Overlay -->@if (isMapLoading) {
    <div class="custom-spinner-overlay position-absolute">
    	<mat-spinner></mat-spinner>
    </div>}`,
  styles: [
    `
    * {
        font-family: var(--ff-base);
    }`,
    `
    #map-container {
        width: 100%;
        height: 100%;
        background-image: url('/assets/images/maps/layer1.png') !important;
        background-size: cover;
        background-repeat: no-repeat;
        background-color: transparent !important;
    }`,
    `
    ::ng-deep .state-highlight path.leaflet-interactive {
        filter: drop-shadow(0px 1px 0px #1e3571) drop-shadow(0px 2px 0px #1e3571) drop-shadow(0px 3px 0px #1e3571) drop-shadow(0px 4px 0px #1e3571) drop-shadow(0px 5px 0px #1e3571) drop-shadow(0px 6px 0px #1e3571) drop-shadow(0px 7px 0px #1e3571);
        stroke-width: 0 !important;
    }`,
    `
    ::ng-deep .leaflet-interactive:focus {
        outline: none;
    }`,
  ],
})
export class Map implements OnChanges, AfterViewInit, OnDestroy, ResettableMap {
  // Note: Ensure the map component is initialized only after the parent component has fully loaded and rendered.
  @Input() stateCode!: string;
  @Input() ulbId!: string;
  @Output() ulbIdChange = new EventEmitter<string>();
  @Output() stateCodeChange = new EventEmitter<string>();

  private readonly DEFAULT_ZOOM_LEVEL = 4.2;
  private ulbsList: ULBDataPoint[] = [];
  private stateLayer: L.GeoJSON | null = null; // To hold current state layer.
  private mapConfig: MapConfig = {
    initialView: [23, 81],
    initialZoom: this.getZoomLevel(),
    minZoom: this.getZoomLevel(),
    maxZoom: this.getZoomLevel() + 2,
  };
  private destroy$ = new Subject<void>();
  public isMapLoading = true;
  private mapInitialized = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private mapService: MapService
  ) { }

  // Set map zoom based on screen width.
  private getZoomLevel(): number {
    if (isPlatformBrowser(this.platformId)) {
      const screenWidth = window.innerWidth;

      if (screenWidth < 350) return 3.5;
      else if (screenWidth < 600) return 4.0;
    }
    return this.DEFAULT_ZOOM_LEVEL;
  }

  // Update map zoom based on screen resize.
  // @HostListener('window:resize', ['$event'])
  // onResize() {
  //   const newZoom = this.getZoomLevel();
  //   this.mapService.map.setZoom(newZoom);
  // }

  // ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    const stateChanged =
      changes['stateCode'] &&
      !changes['stateCode'].isFirstChange() &&
      changes['stateCode'].currentValue !== '' &&
      changes['stateCode'].previousValue !== changes['stateCode'].currentValue;

    const ulbChanged =
      changes['ulbId'] &&
      !changes['ulbId'].isFirstChange() &&
      changes['ulbId'].previousValue !== changes['ulbId'].currentValue;

    if (stateChanged && this.mapInitialized) {
      this.loadMapData();
    }

    if (ulbChanged && this.mapInitialized) {
      this.mapService.updateSelectedULBMarker(changes['ulbId'].currentValue);
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.mapService.destroyMap();
    const container = document.getElementById('map-container');

    if (!container) {
      console.warn('Map container not found');
      return;
    }

    this.mapService.initMap('map-container', this.mapConfig);
    this.mapInitialized = true;
    this.loadMapData();

    this.subscribeToMapEvents();
  }

  private subscribeToMapEvents(): void {
    this.mapService.stateCodeClicked$
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe((code) => {
        if (!this.stateCode) {
          this.stateCode = code;
          this.stateCodeChange.emit(code);
          // this.loadMapData();
        }
      });

    this.mapService.ulbCodeClicked$.pipe(takeUntil(this.destroy$)).subscribe((code) => {
      if (code && this.ulbId !== code) {
        this.ulbId = code;
        this.ulbIdChange.emit(code);
      }
    });
  }

  private loadMapData(): void {
    if (!this.mapInitialized) return;
    this.isMapLoading = true;

    // Remove previous state layer if any
    if (this.stateLayer) {
      this.mapService.map?.removeLayer(this.stateLayer);
      this.stateLayer = null;
    }

    this.mapService
      .loadAndAddStates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: StateGeoJson) => {
          const features = this.stateCode
            ? data.features.filter((f) => f.properties['ST_CODE'] === this.stateCode)
            : data.features;
          // console.log('state length = ', features.length);
          const stateGeoJson: StateGeoJson = {
            type: 'FeatureCollection',
            features,
          };

          this.stateLayer = this.mapService.addGeoJsonLayer(stateGeoJson, this.stateCode);

          if (this.stateCode && features.length && this.stateLayer) {
            this.mapService.flyToStateBounds(this.stateLayer, [0, 0], 1.5, 0.5);
            this.loadCityCoordinates();
            this.mapService.addCityMarkersToMap(this.stateCode, this.ulbId, this.ulbsList);
          } else {
            this.mapService.map?.setView(this.mapConfig.initialView, this.mapConfig.initialZoom);
            this.mapService.clearCityMarkers();
          }
        },
        error: (err) => console.error('Error loading map data:', err),
        complete: () => {
          this.isMapLoading = false;
        },
      });
  }

  private loadCityCoordinates(): void {
    this.ulbsList = this.stateCode ? allUlbsData[this.stateCode]?.ulbs || [] : [];
  }

  public resetMap(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.stateCode = '';
    this.stateLayer?.clearLayers();
    this.stateLayer = null;
    this.mapService.clearCityMarkers();
    this.mapService.map?.setView(this.mapConfig.initialView, this.mapConfig.initialZoom);
    this.loadMapData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mapService.destroyMap();
  }
}

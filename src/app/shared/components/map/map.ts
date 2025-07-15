import { isPlatformBrowser, isPlatformServer } from '@angular/common';
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
  signal,
  SimpleChanges
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { IULB } from '../../../core/models/ulb';
import { UserUtility } from '../../../core/util/user/user';
import { MapConfig, ResettableMap, StateGeoJson } from './interfaces';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  imports: [MatProgressSpinnerModule],
  providers: [UserUtility],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnChanges, AfterViewInit, OnDestroy, ResettableMap {
  // Note: Ensure the map component is initialized only after the parent component has fully loaded and rendered.
  @Input() stateCode!: string;
  @Input() ulbId!: string;
  @Output() ulbObjChange = new EventEmitter<IULB>();
  @Output() slugNameChange = new EventEmitter<string>();
  @Output() stateCodeChange = new EventEmitter<string>();

  isBrowser = signal(false);

  private readonly DEFAULT_ZOOM_LEVEL = 4.2;
  private ulbsList: IULB[] = [];
  private stateLayer: L.GeoJSON | null = null; // To hold current state layer.
  private mapConfig: MapConfig = {
    initialView: [23, 81],
    initialZoom: this.getZoomLevel(),
    minZoom: this.getZoomLevel(),
    maxZoom: this.getZoomLevel() + 2,
  };
  private destroy$ = new Subject<void>();
  public isMapLoading = signal<boolean>(true);
  mapInitialized = signal<boolean>(false);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private mapService: MapService,
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
    if (!isPlatformBrowser(this.platformId)) return;

    const stateChanged =
      changes['stateCode'] &&
      !changes['stateCode'].isFirstChange() &&
      changes['stateCode'].currentValue !== '' &&
      changes['stateCode'].previousValue !== changes['stateCode'].currentValue;

    const ulbChanged =
      changes['ulbId'] &&
      !changes['ulbId'].isFirstChange() &&
      changes['ulbId'].previousValue !== changes['ulbId'].currentValue;

    if (stateChanged && this.mapInitialized()) {
      this.loadMapData();
    }

    if (ulbChanged && this.mapInitialized()) {
      this.mapService.updateSelectedULBMarker(changes['ulbId'].currentValue);
    }
  }

  ngAfterViewInit(): void {
    this.isBrowser.set(true);

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    }

    // if (isPlatformBrowser(this.platformId)) {
    //   this.ngZone.onStable.pipe(take(1)).subscribe(() => {
    //     this.initializeMap();
    //   });
    // }
  }

  private initializeMap(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.mapInitialized.set(false);
    this.mapService.destroyMap();
    const container = document.getElementById('map-container');

    if (!container) {
      console.warn('Map container not found');
      return;
    }

    const isMapInitiated = this.mapService.initMap('map-container', this.mapConfig);
    isMapInitiated.then((value) => {
      if (value) {
        this.mapInitialized.set(true);
        this.loadMapData();

        this.subscribeToMapEvents();
      } else console.warn('Map not initialized')
    })

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

    this.mapService.ulbCodeClicked$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ulbObj) => {
        if (ulbObj && this.ulbId !== ulbObj._id) {
          // console.log('ulb obj = ', ulbObj, this.ulbId);
          this.ulbObjChange.emit(ulbObj);
          this.ulbId = ulbObj._id;
        }
      });
  }

  private loadMapData(): void {
    if (!this.mapInitialized() || isPlatformServer(this.platformId)) return;
    this.isMapLoading.set(true);

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
            ? data.features.filter(
              (f) => f.properties['ST_CODE'] === this.stateCode
            )
            : data.features;
          // console.log('state length = ', features.length);
          const stateGeoJson: StateGeoJson = {
            type: 'FeatureCollection',
            features,
          };

          this.stateLayer = this.mapService.addGeoJsonLayer(
            stateGeoJson,
            this.stateCode
          );

          if (this.stateCode && features.length && this.stateLayer) {
            this.mapService.flyToStateBounds(this.stateLayer, [0, 0], 1.5, 0.5);
            // this.loadCityCoordinates();
            this.getUlbsObservable(this.stateCode).subscribe({
              next: (res) => {
                this.ulbsList = res['data'][this.stateCode]['ulbs'];
                this.mapService.addCityMarkersToMap(this.ulbId, this.ulbsList);
              },
              error: () => console.error('Failed to get data'),
            });
          } else {
            this.mapService.map?.setView(
              this.mapConfig.initialView,
              this.mapConfig.initialZoom
            );
            this.mapService.clearCityMarkers();
          }

          this.isMapLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading map data:', err);
          this.isMapLoading.set(false);
        },
      });
  }

  private getUlbsObservable(statecode: string) {
    return this.mapService.getUlbsData(statecode);
  }

  public resetMap(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.stateCode = '';
    this.stateLayer?.clearLayers();
    this.stateLayer = null;
    this.mapService.clearCityMarkers();
    this.mapService.map?.setView(
      this.mapConfig.initialView,
      this.mapConfig.initialZoom
    );
    this.loadMapData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mapService.destroyMap();
  }
}

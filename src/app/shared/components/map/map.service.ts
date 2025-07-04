import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import type * as Leaflet from 'leaflet';
import { Observable, Subject } from 'rxjs';
import { IStateLayerStyle } from '../../../core/util/map/models/mapCreationConfig';
import { MapConfig, StateGeoJson, ULBDataPoint } from './interfaces';

interface LeafletHTMLElement extends HTMLElement {
  _leaflet_id?: number;
}

declare module 'leaflet' {
  interface Marker {
    ulbData?: ULBDataPoint;
  }
}

@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly cfPrimary = '#e57d15';
  private readonly cfSecondary = '#3e5db1';
  public map: Leaflet.Map | null = null;
  private L!: typeof Leaflet;
  private leafletLoaded = false;

  private defaultStateLayerStyle: IStateLayerStyle = {
    fillColor: this.cfSecondary,
    weight: 1,
    opacity: 0.8,
    color: 'lightgrey',
    fillOpacity: 1,
  };

  private blueIcon!: Leaflet.Icon;
  private selectedIcon!: Leaflet.Icon;
  private selectedMarker: Leaflet.Marker | null = null;
  private cityMarkersGroup!: Leaflet.LayerGroup;

  private stateCodeClickedSubject = new Subject<string>();
  public stateCodeClicked$ = this.stateCodeClickedSubject.asObservable();
  private ulbCodeClickedSubject = new Subject<string>();
  public ulbCodeClicked$ = this.ulbCodeClickedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  private async loadLeaflet(): Promise<void> {
    if (this.leafletLoaded) return;
    this.L = await import('leaflet');
    this.leafletLoaded = true;

    this.blueIcon = this.L.icon({
      iconUrl: './assets/images/maps/simple_blue_dot.png',
      iconSize: [6, 6],
      iconAnchor: [3, 3],
    });

    this.selectedIcon = new this.L.Icon({
      iconUrl: 'assets/images/maps/map-marker.png',
      iconSize: [18, 18],
      iconAnchor: [8, 14],
    });

    this.cityMarkersGroup = new this.L.LayerGroup();
  }

  async initMap(elementId: string, config: MapConfig, options?: Leaflet.MapOptions): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    await this.loadLeaflet();

    if (this.map) this.destroyMap();

    const container = document.getElementById('map-container') as LeafletHTMLElement;
    if (container && container._leaflet_id) delete container._leaflet_id;

    this.map = this.L.map(elementId, {
      scrollWheelZoom: false,
      fadeAnimation: true,
      zoomControl: false,
      keyboard: false,
      attributionControl: false,
      doubleClickZoom: false,
      dragging: false,
      zoomSnap: 0.01,
      ...options,
    }).setView(config.initialView, config.initialZoom, { animate: true });
  }

  loadAndAddStates(): Observable<StateGeoJson> {
    return this.http.get<StateGeoJson>('/assets/jsonFile/state_boundaries_24Jan2024.json');
  }

  addGeoJsonLayer(geoJsonData: StateGeoJson, stateCode: string): Leaflet.GeoJSON | null {
    if (!isPlatformBrowser(this.platformId) || !this.map) return null;

    return this.L.geoJSON(geoJsonData, {
      style: this.defaultStateLayerStyle,
      onEachFeature: (feature, layer) => {
        const tooltip = feature.properties.ST_NM;

        if (!stateCode) {
          layer.bindTooltip(tooltip, {
            direction: 'top',
            offset: this.L.point(0, -10),
            sticky: true,
            opacity: 0.9,
          });
        }

        layer.on({
          click: () => {
            if (!stateCode) {
              this.stateCodeClickedSubject.next(feature.properties.ST_CODE);
              layer.openPopup();
            }
          },
          mouseover: () => {
            if (layer instanceof this.L.Path && !stateCode) {
              layer.setStyle({ fillColor: this.cfPrimary });
            }
          },
          mouseout: () => {
            if (layer instanceof this.L.Path && !stateCode) {
              layer.setStyle({ fillColor: this.defaultStateLayerStyle.fillColor });
            }
          },
        });
      },
    }).addTo(this.map);
  }

  flyToStateBounds(
    layer: Leaflet.GeoJSON,
    padding: Leaflet.PointExpression,
    maxZoomOffset: number,
    duration: number
  ): void {
    if (!isPlatformBrowser(this.platformId) || !this.map) return;

    setTimeout(() => {
      if (this.map) {
        this.map.flyToBounds(layer.getBounds(), {
          padding,
          maxZoom: this.map.getZoom() + maxZoomOffset,
          duration,
        });
      }
    }, 400);
  }

  addCityMarkersToMap(stateCode: string, ulbId: string, ulbsList: ULBDataPoint[]): void {
    if (!isPlatformBrowser(this.platformId) || !this.map) return;

    this.clearCityMarkers();
    let newlySelectedMarker: Leaflet.Marker | null = null;

    ulbsList.forEach((ulb) => {
      const lat = ulb.location.lat;
      const lng = ulb.location.lng;

      if (lat && lng) {
        const popup = this.L.popup({ closeButton: false, autoClose: true }).setContent(this.createToolTip(ulb.name || ''));
        const marker = this.addMarker(+lat, +lng, ulb).bindPopup(popup);
        this.cityMarkersGroup.addLayer(marker);

        marker.on({
          mouseover: () => marker.openPopup(),
          mouseout: () => marker.closePopup(),
          click: () => this.handleMarkerClick(marker),
        });

        if (ulbId && ulb._id == ulbId) {
          newlySelectedMarker = marker;
        }
      } else {
        console.warn(`Invalid coordinates: ${ulb.name} (Lat: ${lat}, Lng: ${lng})`);
      }
    });

    if (ulbId) this.handleMarkerClick(newlySelectedMarker);
    this.cityMarkersGroup.addTo(this.map);
  }

  updateSelectedULBMarker(ulbId: string): void {
    if (!isPlatformBrowser(this.platformId) || !this.map || !this.cityMarkersGroup) return;

    let selectedMarker: Leaflet.Marker | null = null;

    this.cityMarkersGroup.eachLayer((layer: Leaflet.Layer) => {
      if (layer instanceof this.L.Marker && layer.ulbData?._id === ulbId) {
        selectedMarker = layer;
      }
    });

    if (selectedMarker) {
      this.handleMarkerClick(selectedMarker);
    } else {
      console.warn(`ULB with ID ${ulbId} not found in current marker group.`);
    }
  }

  addMarker(lat: number, lng: number, ulb: ULBDataPoint): Leaflet.Marker {
    const marker = this.L.marker([lat, lng], {
      icon: this.blueIcon,
      interactive: true,
      bubblingMouseEvents: true,
    });

    marker.ulbData = ulb;
    return marker;
  }

  clearCityMarkers(): void {
    if (this.map) this.cityMarkersGroup.clearLayers();
  }

  handleMarkerClick(marker: Leaflet.Marker | null): void {
    if (this.selectedMarker) {
      this.selectedMarker.setIcon(this.blueIcon);
    }

    if (marker) {
      marker.setIcon(this.selectedIcon);
      this.selectedMarker = marker;
      this.ulbCodeClickedSubject.next(marker.ulbData?._id || '');
    } else {
      this.selectedMarker = null;
    }
  }

  createToolTip(ulbName: string): string {
    return `<p style="color: #000000; font-weight: 600; font-size: 0.7rem;">${ulbName}</p>`;
  }

  destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map.off();
      this.map = null;
    }
  }
}

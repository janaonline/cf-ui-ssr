import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import type * as Leaflet from 'leaflet';
import { Observable, Subject } from 'rxjs'; // Import throwError
import { environment } from '../../../../environments/environment';
import { IULB } from '../../../core/models/ulb';
import { MapConfig, StateDataByCode, StateGeoJson, ULBStateData } from './interfaces';

interface LeafletHTMLElement extends HTMLElement {
  _leaflet_id?: number;
}

declare module 'leaflet' {
  interface Marker {
    ulbData?: IULB;
  }
}

@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly cfPrimary = '#e57d15';
  private readonly cfSecondary = '#3e5db1';
  private readonly FLY_TO_DELAY_MS = 400;

  public map: Leaflet.Map | null = null;
  private L!: typeof Leaflet;
  private leafletLoaded = false;

  private defaultStateLayerStyle = (fillColor: string = this.cfSecondary) => {
    return {
      fillColor,
      weight: 1,
      opacity: 0.8,
      color: 'lightgrey',
      fillOpacity: 1,
    }
  };

  private blueIcon!: Leaflet.Icon;
  private selectedIcon!: Leaflet.Icon;
  private selectedMarker: Leaflet.Marker | null = null;
  private cityMarkersGroup!: Leaflet.LayerGroup;

  private stateCodeClickedSubject = new Subject<string>();
  public stateCodeClicked$ = this.stateCodeClickedSubject.asObservable();
  private ulbCodeClickedSubject = new Subject<IULB | undefined>();
  public ulbCodeClicked$ = this.ulbCodeClickedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  /**
   * Dynamically loads the Leaflet library.
   * Ensures Leaflet is only loaded once and handles potential load errors.
   */
  private async loadLeaflet(): Promise<void> {
    if (this.leafletLoaded) return;
    try {
      const leafletModule = await import('leaflet');
      this.L = leafletModule.default;
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
    } catch (error) {
      console.error('Failed to load Leaflet library.', error);
      this.map = null;
      this.leafletLoaded = false;
    }
  }

  /**
   * Initializes the Leaflet map in the specified DOM element.
   * Handles map destruction if an existing map is present.
   * @param elementId The ID of the HTML element where the map will be rendered.
   * @param config Map configuration (initial view, zoom).
   * @param options Optional Leaflet map options.
   */
  async initMap(
    elementId: string,
    config: MapConfig,
    options?: Leaflet.MapOptions
  ): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return true;

    await this.loadLeaflet();
    if (!this.L || !this.leafletLoaded) {
      console.error('Leaflet library not loaded, cannot initialize map.');
      return false;
    }

    // Destroy existing map instance to prevent leaks
    if (this.map) this.destroyMap();

    const mapContainer = document.getElementById(
      elementId
    ) as LeafletHTMLElement;
    if (!mapContainer) {
      console.error(
        `Map container with ID "${elementId}" not found in the DOM.`
      );
      return false;
    }

    // Leaflet can cache internal IDs on the DOM element. Deleting this
    // prevents issues if the same DOM element is reused for a new map.
    if (mapContainer._leaflet_id) {
      delete mapContainer._leaflet_id;
    }

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

    return true;
  }

  /**
   * Fetches state boundary GeoJSON data.
   * @returns An Observable of StateGeoJson.
   */
  loadAndAddStates(): Observable<StateGeoJson> {
    return this.http.get<StateGeoJson>(
      '/assets/jsonFile/state_boundaries_24Jan2024.json'
    );
  }

  /**
   * Adds a GeoJSON layer to the map.
   * @param geoJsonData The GeoJSON data for states.
   * @param stateCode Optional state code; if provided, disables interaction for all states.
   * @returns The created Leaflet.GeoJSON layer, or null if not in browser or map not initialized.
   */
  addGeoJsonLayer(
    geoJsonData: StateGeoJson,
    stateCode: string,
    stateColorCode: StateDataByCode,
  ): Leaflet.GeoJSON | null {
    if (!isPlatformBrowser(this.platformId) || !this.map || !this.L)
      return null;

    let color = this.cfSecondary;
    return this.L.geoJSON(geoJsonData, {
      style: (feature) => {
        if (!feature || !stateColorCode) return this.defaultStateLayerStyle(color);

        if (stateColorCode && feature.properties.ST_CODE in stateColorCode) {
          color = stateColorCode[feature.properties.ST_CODE].shade;
        }
        return this.defaultStateLayerStyle(color)
      },
      onEachFeature: (feature, layer) => {
        const stateName = feature.properties.ST_NM;
        const stateFeatureCode = feature.properties.ST_CODE;

        if (!stateCode) {
          // Apply tooltip and interactivity only if no specific state is selected
          layer.bindTooltip(stateName, {
            direction: 'top',
            offset: this.L.point(0, -10),
            sticky: true,
            opacity: 0.9,
          });
        }

        layer.on({
          click: () => {
            if (!stateCode) {
              // Clickable only if no stateCode is currently active/selected
              this.stateCodeClickedSubject.next(stateFeatureCode);
              // Open popup only on explicit user action, not on initial click
              // layer.openPopup();
            }
          },
          mouseover: () => {
            if (layer instanceof this.L.Path && !stateCode) {
              layer.setStyle({ fillColor: this.cfPrimary });
            }
          },
          mouseout: () => {
            if (layer instanceof this.L.Path && !stateCode) {
              layer.setStyle(this.defaultStateLayerStyle(color));
            }
          },
        });
      },
    }).addTo(this.map);
  }

  /**
   * Flies the map to the bounds of a given GeoJSON layer.
   * @param layer The Leaflet.GeoJSON layer to fly to.
   * @param padding Padding around the bounds.
   * @param maxZoomOffset Maximum zoom level offset from current.
   * @param duration Animation duration in seconds.
   */
  flyToStateBounds(
    layer: Leaflet.GeoJSON,
    padding: Leaflet.PointExpression,
    maxZoomOffset: number,
    duration: number
  ): void {
    if (!isPlatformBrowser(this.platformId) || !this.map) return;

    // A small timeout helps ensure the map has fully rendered before flying.
    setTimeout(() => {
      if (this.map) {
        // Double check map exists after timeout
        this.map.flyToBounds(layer.getBounds(), {
          padding,
          maxZoom: this.map.getZoom() + maxZoomOffset,
          duration,
        });
      }
    }, this.FLY_TO_DELAY_MS);
  }

  /**
   * Adds city markers to the map.
   * @param stateCode The current selected state code (for context, if needed).
   * @param ulbId The ID of the currently selected ULB (for initial selection).
   * @param ulbsList Array of ULB data points.
   */
  addCityMarkersToMap(ulbId: string, ulbsList: IULB[]): void {
    if (!isPlatformBrowser(this.platformId) || !this.map || !this.L) return;

    this.clearCityMarkers(); // Clear existing markers
    let newlySelectedMarker: Leaflet.Marker | null = null;

    ulbsList.forEach((ulb) => {
      const lat = ulb.location?.lat;
      const lng = ulb.location?.lng;

      // Ensure coordinates are valid numbers and exist
      if (lat && lng) {
        const popup = this.L.popup({
          closeButton: false,
          autoClose: true,
        }).setContent(this.createToolTip(ulb.name || ''));

        // Add marker and bind popup
        const marker = this.addMarker(+lat, +lng, ulb).bindPopup(popup);
        this.cityMarkersGroup.addLayer(marker);

        // Attach event listeners
        marker.on({
          mouseover: () => marker.openPopup(),
          mouseout: () => marker.closePopup(),
          click: () => this.handleMarkerClick(marker),
        });

        // Check for initial selection using strict equality
        if (ulbId && ulb._id === ulbId) {
          newlySelectedMarker = marker;
        }
      } else {
        console.warn(
          `Invalid coordinates for ULB: ${ulb.name} (Lat: ${lat}, Lng: ${lng})`
        );
      }
    });

    // If an initial ULB was selected, handle its click to highlight it
    if (ulbId && newlySelectedMarker) {
      // Only call if a matching marker was found
      this.handleMarkerClick(newlySelectedMarker);
    } else if (ulbId && !newlySelectedMarker) {
      console.warn(`Initial ULB with ID "${ulbId}" not found .`);
    }

    // Add all markers to the map
    this.cityMarkersGroup.addTo(this.map);
  }

  /**
   * Updates the visual state of a selected ULB marker.
   * @param ulbId The ID of the ULB to be selected.
   */
  updateSelectedULBMarker(ulbId: string): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      !this.map ||
      !this.cityMarkersGroup ||
      !this.L
    )
      return;

    let foundMarker: Leaflet.Marker | null = null;

    // Iterate over markers to find the one matching ulbId
    this.cityMarkersGroup.eachLayer((layer: Leaflet.Layer) => {
      if (layer instanceof this.L.Marker && layer.ulbData?._id === ulbId) {
        foundMarker = layer;
      }
    });

    // Handle click to update selection and emit event
    if (foundMarker) {
      this.handleMarkerClick(foundMarker);
    } else {
      console.warn(`ULB with ID "${ulbId}" not found.`);
      this.handleMarkerClick(null);
    }
  }

  /**
   * Adds a single marker to the map (internal helper).
   * @param lat Latitude.
   * @param lng Longitude.
   * @param ulb ULB data to associate with the marker.
   * @returns The created Leaflet.Marker.
   */
  private addMarker(lat: number, lng: number, ulb: IULB): Leaflet.Marker {
    const marker = this.L.marker([lat, lng], {
      icon: this.blueIcon,
      interactive: true,
      bubblingMouseEvents: true,
    });

    marker.ulbData = ulb;
    return marker;
  }

  clearCityMarkers(): void {
    if (this.map && this.cityMarkersGroup) {
      // Ensure cityMarkersGroup exists before clearing
      this.cityMarkersGroup.clearLayers();
    }
  }

  /**
   * Handles click events on markers, updating selected marker and emitting event.
   * @param marker The clicked Leaflet.Marker, or null to deselect.
   */
  handleMarkerClick(marker: Leaflet.Marker | null): void {
    // Deselect previous marker if any
    if (this.selectedMarker) {
      this.selectedMarker.setIcon(this.blueIcon);
    }

    if (marker) {
      marker.setIcon(this.selectedIcon);
      this.selectedMarker = marker;
      // Emit the ULB ID of the clicked marker
      // console.log('marker data', marker?.ulbData);
      this.ulbCodeClickedSubject.next(marker.ulbData);
    } else {
      this.selectedMarker = null;
      // this.ulbCodeClickedSubject.next('');
    }
  }

  /**
   * Creates simple HTML content for a marker tooltip/popup.
   * @param ulbName The name of the ULB.
   * @returns HTML string for the tooltip.
   */
  private createToolTip(ulbName: string): string {
    return `<p style="color: #000000; font-weight: 600; font-size: 0.7rem;">${ulbName}</p>`;
  }

  /**
   * Fetches ULB data from the API, optionally filtered by state code.
   * @param stateCode Optional state code to filter ULBs.
   * @returns An Observable containing ULB data.
   */
  getUlbsData(stateCode = '') {
    let params = new HttpParams();
    if (stateCode) params = params.set('stateCode', stateCode);

    return this.http.get<{
      data: { [stateCode: string]: ULBStateData };
    }>(`${environment.api.url}/ulbs`, { params });
  }

  // Destroys the current Leaflet map instance and cleans up resources.
  destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map.off();
      this.map = null;
    }

    // Also clear other Leaflet-related objects if they hold significant memory
    if (this.cityMarkersGroup) {
      this.cityMarkersGroup.clearLayers();
    }
    this.selectedMarker = null;
  }
}

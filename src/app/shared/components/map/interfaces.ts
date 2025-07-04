// TODO: remove unwanted keys and clean all the interface.
import * as L from 'leaflet';

export interface ULBDataPoint {
  location: { lat: number | string | null; lng: number | string | null };
  name: string;
  _id: string;
  state: string;
  code: string;
  natureOfUlb: string | null;
  type: string;
  area: number | null;
  population: number;
  amrut: string;
}

export interface StateGeoJson {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface MapConfig {
  initialView: L.LatLngExpression;
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
}

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  properties: {
    id: string;
    ST_NM: string;
    ST_CODE: string;
  };
}
export interface ResettableMap {
  resetMap: () => void;
}

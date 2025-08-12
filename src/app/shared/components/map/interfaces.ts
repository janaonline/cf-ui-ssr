// TODO: remove unwanted keys and clean all the interface.
import * as L from 'leaflet';
import { IULB } from '../../../core/models/ulb';

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
  slug: string;
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

export interface ULBStateData {
  state: string;
  ulbs: IULB[];
  _id: string;
}

export interface LeafletHTMLElement extends HTMLElement {
  _leaflet_id?: number;
}

interface StateInfo {
  _id: string;
  stateId: string;
  percentage: number;
  shade: string;
}

export interface StateDataByCode {
  [stateCode: string]: StateInfo;
}
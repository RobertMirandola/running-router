/**
 * Interface for marker data used in map components
 */
export interface MarkerData {
  name: string;
  lat: number;
  lng: number;
}

/**
 * Props for the MapMarker component
 */
export interface MapMarkerProps {
  data: MarkerData;
} 
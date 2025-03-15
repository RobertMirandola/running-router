'use client';

//Map component Component from library
import { GoogleMap, DirectionsService } from "@react-google-maps/api";

import { useCallback, useRef } from "react";

//Map's styling
const defaultMapContainerStyle = {
    width: '100%',
    height: '100vh',
    borderRadius: '15px 0px 0px 15px',
};

const defaultMapCenter = {
    lat: 43.805152,
    lng: -79.628020
}

//Default zoom level, can be adjusted
const defaultMapZoom = 18

//Map options
const defaultMapOptions = {
    zoomControl: true,
    tilt: 0,
    gestureHandling: 'auto',
    draggableCursor: 'crosshair',
};

const handleMapClick = () => {
  console.log('map clicked')
}


export function MapDisplay() {

  const mapRef = useRef<google.maps.Map | null>(null); 

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
    }
  }, [])
  
  
  return (
    <div className='w-full'>
     <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={defaultMapCenter}
        zoom={defaultMapZoom}
        options={defaultMapOptions}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
      >
      </GoogleMap>
    </div>
  );
}
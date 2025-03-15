'use client';

//Map component Component from library
import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";

import { useCallback, useRef, useState, useMemo } from "react";

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
    mapId: 'my_map'
};

export function MapDisplay() {

  const mapRef = useRef<google.maps.Map | null>(null); 
  const [selectedElement, setSelectedElement] = useState<{name: string; info: string, lat: number; lng: number;} | null>(null);
  const [activeMarker, setActiveMarker] = useState<google.maps.LatLng | null>(null);

  const onMapLoad = useCallback(async (map: google.maps.Map) => {
    mapRef.current = map;

    if (mapRef.current) {
      const center = mapRef.current.getCenter();
    }
  }, [])

  // Calculate adjusted position for the InfoWindow
  const markerPosition = useMemo(() => {
    if (!activeMarker) return undefined;
    
    // Create a new position with slightly higher latitude (moves it up)
    const offset = 0.00012; // Small latitude offset
    return {
      lat: activeMarker.lat() + offset,
      lng: activeMarker.lng()
    };
  }, [activeMarker]);

  const pinStops = [
    {
      name: '59 Royalpark Way',
      info: 'This is my house located in Vaughan, Ontario, Canada.',
      lat: 43.805152,
      lng: -79.628020,
    }
  ]
  
  return (
    <div className='w-full'>
     <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={defaultMapCenter}
        zoom={defaultMapZoom}
        options={defaultMapOptions}
        onLoad={onMapLoad}
      >
        {pinStops.map((element, index) => {
          return (
            <Marker
              key={index}
              title={element.name}
              position={{
                lat: element.lat,
                lng: element.lng
              }}
              onClick={(e) => {
                setSelectedElement(element);
                setActiveMarker(e.latLng);
              }}
            />
          );
        })}
        {selectedElement ? (
          <InfoWindow
            position={markerPosition}
            onCloseClick={() => {
              setSelectedElement(null);
            }}
          >
            <div>
              <h1>{selectedElement.name}</h1>
              <p>{selectedElement.info}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}
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
  const markerRefs = useRef<{[key: number]: google.maps.Marker}>({});
  const [activeMarkerIndex, setActiveMarkerIndex] = useState<number | null>(null);
  const [selectedElement, setSelectedElement] = useState<{name: string; info: string, lat: number; lng: number;} | null>(null);

  const onMapLoad = useCallback(async (map: google.maps.Map) => {
    mapRef.current = map;

    if (mapRef.current) {
      const center = mapRef.current.getCenter();
    }
  }, [])

  // Get the active marker reference based on the active index
  const activeMarker = useMemo(() => {
    if (activeMarkerIndex === null) return null;
    return markerRefs.current[activeMarkerIndex] || null;
  }, [activeMarkerIndex]);


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
              onLoad={(marker) => {
                markerRefs.current[index] = marker;
              }}
              onClick={(e) => {
                setSelectedElement(element);
                setActiveMarkerIndex(index);
              }}
            />
          );
        })}
        {selectedElement && activeMarker ? (
          <InfoWindow
            anchor={activeMarker}
            onCloseClick={() => {
              setSelectedElement(null);
              setActiveMarkerIndex(null);
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
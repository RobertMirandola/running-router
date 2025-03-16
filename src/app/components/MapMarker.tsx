'use client';

import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef
} from "@vis.gl/react-google-maps";

import { useState } from "react";

interface MarkerData {
  name: string;
  info: string;
  lat: number;
  lng: number;
}

interface MapMarkerProps {
  data: MarkerData;
}

export function MapMarker({ data }: MapMarkerProps) {
  // Create a ref for the marker
  const [markerRef, marker] = useAdvancedMarkerRef();
  
  // State to control InfoWindow visibility
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: data.lat, lng: data.lng }}
        title={data.name}
        onClick={() => setIsOpen(true)}
      />
      
      {isOpen && marker && (
        <InfoWindow 
          anchor={marker} 
          onCloseClick={() => setIsOpen(false)}
        >
          <div>
            <h1>{data.name}</h1>
            <p>{data.info}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
} 
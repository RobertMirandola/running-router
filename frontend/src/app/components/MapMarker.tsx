'use client';

import {
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef
} from "@vis.gl/react-google-maps";
import { useState } from "react";
import { MapMarkerProps } from "../types/map";

export function MapMarker({ index, data }: MapMarkerProps) {
  // Create a ref for the marker
  const [markerRef, marker] = useAdvancedMarkerRef();
  
  // State to control InfoWindow visibility
  const [isOpen, setIsOpen] = useState(false);

  const applyMarkerBackground = () => {
    if (index === 0) {
      return '#74C074'; // light green
    }
  }
  
  const applyMarkerGlyph = () => {
    if (index === 0) {
      return '#006400'; // dark green
    }
  }
  
  const applyMarkerBorder = () => {
    if (index === 0) {
      return '#006400'; // dark green
    }
  }
  
  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: data.lat, lng: data.lng }}
        title={data.name}
        // onClick={() => setIsOpen(true)}
      >
      <Pin
        glyphColor={applyMarkerGlyph()}
        background={applyMarkerBackground()}
        borderColor={applyMarkerBorder()}
      />
      </AdvancedMarker>
      
      {/* {isOpen && marker && (
        <InfoWindow 
          anchor={marker} 
          onCloseClick={() => setIsOpen(false)}
        >
          <div>
            <h1>{data.name}</h1>
          </div>
        </InfoWindow>
      )} */}
    </>
  );
} 
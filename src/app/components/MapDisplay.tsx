'use client';

//Map component Component from library
import {
  Map,
} from "@vis.gl/react-google-maps";

import { MapMarker } from "./MapMarker";
import { MarkerData } from "../types/map";

import { useState, useCallback, useRef } from "react";

const DEFAULT_CENTER = { lat: 43.805153, lng: -79.628021 };

export function MapDisplay() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [numWayPoints, setNumWayPoints] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleButtonClick = () => {
    // Clear all markers
    setMarkers([]);
    // Reset waypoint counter
    setNumWayPoints(0);
  };

  const handleMapClick = useCallback((event: any) => {
    const nextWaypoint = numWayPoints + 1;
    setNumWayPoints(numWayPoints + 1);
    
    const newMarker: MarkerData = {
      name: `Waypoint ${nextWaypoint}`,
      lat: event.detail.latLng.lat,
      lng: event.detail.latLng.lng,
    };
    
    setMarkers(prevMarkers => [...prevMarkers, newMarker]);
  }, [numWayPoints]);
  
  return (
    <div className="relative h-screen w-screen">
      {/* Custom button positioned absolutely at the top center - only shown after map loads */}
      {mapLoaded && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <button 
            onClick={handleButtonClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg cursor-pointer"
          >
            Clear Waypoints
          </button>
        </div>
      )}

      <Map 
        defaultZoom={18} 
        defaultCenter={DEFAULT_CENTER} 
        mapId="my_map" 
        draggableCursor='crosshair'
        onClick={handleMapClick}
        onTilesLoaded={() => {
          // Use this event to detect when the map is ready
          if (!mapLoaded) {
            setMapLoaded(true);
          }
        }}
      >
        {markers.map((element, index) => (
          <MapMarker key={index} data={element} />
        ))}
      </Map>
    </div>
  );
}
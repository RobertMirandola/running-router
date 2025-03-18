'use client';

//Map component Component from library
import {
  Map,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

import { MapMarker } from "./MapMarker";
import { MarkerData } from "../types/map";
import { Directions } from "./Directions";

import { useState, useCallback } from "react";

const DEFAULT_MAP_CENTER = { lat: 43.805153, lng: -79.628021 };

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
    setNumWayPoints(nextWaypoint);
    
    const newMarker: MarkerData = {
      name: `Waypoint ${nextWaypoint}`,
      lat: event.detail.latLng.lat,
      lng: event.detail.latLng.lng,
    };
    
    setMarkers(prevMarkers => [...prevMarkers, newMarker]);
  }, [numWayPoints]);
  
  // Handle removing the last marker (used by Directions component)
  const handleUndoLastMarker = useCallback(() => {
    if (markers.length === 0) return;
    
    // Remove the last marker
    setMarkers(prevMarkers => prevMarkers.slice(0, -1));
    
    // Decrease waypoint counter
    setNumWayPoints(prev => Math.max(0, prev - 1));
  }, [markers.length]);
  
  return (
    <div className="relative h-screen w-full">
      {/* Custom button positioned absolutely at the top center - only shown after map loads */}
      {mapLoaded && (
        <div className='absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-4'>
          <button 
            onClick={handleButtonClick}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg cursor-pointer'
          >
            Clear Waypoints
          </button>
        </div>
      )}

      <Map 
        defaultZoom={16} 
        defaultCenter={DEFAULT_MAP_CENTER} 
        mapId="my_map" 
        draggableCursor='crosshair'
        mapTypeControl={false}
        fullscreenControl={false}
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
        <Directions markers={markers} onUndo={handleUndoLastMarker} />
      </Map>
    </div>
  );
}
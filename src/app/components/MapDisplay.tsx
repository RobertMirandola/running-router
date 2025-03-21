'use client';

//Map component Component from library
import {
  Map,
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

  const handleClearMarkers = () => {
    // Clear all markers
    setMarkers([]);
    // Reset waypoint counter
    setNumWayPoints(0);
  };

  const addMarkerToMap = (marker: MarkerData, nextWaypoint: number) => {
    setNumWayPoints(nextWaypoint);
    setMarkers(prevMarkers => [...prevMarkers, marker]);
  }


  const handleMapclick = (event: any) => {
    const nextWaypoint = numWayPoints + 1;
    const newMarker: MarkerData = {
      name: `Waypoint ${nextWaypoint}`,
      lat: event.detail.latLng.lat,
      lng: event.detail.latLng.lng,
    }
    addMarkerToMap(newMarker, nextWaypoint);
  }

  // const handleAddMarker = useCallback((event: any) => {
  //   debugger
  //   const nextWaypoint = numWayPoints + 1;
  //   setNumWayPoints(nextWaypoint);
    
  //   const newMarker: MarkerData = {
  //     name: `Waypoint ${nextWaypoint}`,
  //     lat: event.detail.latLng.lat,
  //     lng: event.detail.latLng.lng,
  //   };

    
  //   setMarkers(prevMarkers => [...prevMarkers, newMarker]);
  // }, [numWayPoints]);
  
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
      <Map 
        defaultZoom={16} 
        defaultCenter={DEFAULT_MAP_CENTER} 
        mapId="my_map" 
        draggableCursor='crosshair'
        disableDefaultUI={true}
        onClick={handleMapclick}
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

        {mapLoaded && (
            <Directions markers={markers} onUndo={handleUndoLastMarker} onClearWaypoints={handleClearMarkers} onAddMarker={addMarkerToMap} />
        )}

      </Map>
    </div>
  );
}
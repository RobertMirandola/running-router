'use client';

//Map component Component from library
import {
  Map
} from "@vis.gl/react-google-maps";

import { MapMarker } from "./MapMarker";
import { MarkerData } from "../types/map";

import { useState, useCallback } from "react";

const DEFAULT_CENTER = { lat: 43.805153, lng: -79.628021 };

export function MapDisplay() {

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [numWayPoints, setNumWayPoints] = useState(0);


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
    <div className="h-screen w-screen">
      <Map 
        defaultZoom={18} 
        defaultCenter={DEFAULT_CENTER} 
        mapId="my_map" 
        draggableCursor='crosshair'
        onClick={handleMapClick}
      >
        {markers.map((element, index) => (
          <MapMarker key={index} data={element} />
        ))}
      </Map>
    </div>
  );
}
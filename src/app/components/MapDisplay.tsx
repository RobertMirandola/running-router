'use client';

//Map component Component from library
import {
  Map
} from "@vis.gl/react-google-maps";

import { MapMarker } from "./MapMarker";

export function MapDisplay() {
  const position = { lat: 43.805153, lng: -79.628021 };

  const pinStops = [
    {
      name: '59 Royalpark Way',
      info: 'This is my house located in Vaughan, Ontario, Canada.',
      lat: 43.805152,
      lng: -79.628020,
    },
    {
      name: '47 Royalpark Way',
      info: 'This is a different house located in Vaughan, Ontario, Canada.',
      lat: 43.806334,
      lng: -79.628829,
    },
  ]
  
  return (
    <div className="h-screen w-screen">
      <Map defaultZoom={18} defaultCenter={position} mapId="my_map" draggableCursor='crosshair'>
        {pinStops.map((element, index) => (
          <MapMarker key={index} data={element} />
        ))}
      </Map>
    </div>
  );
}
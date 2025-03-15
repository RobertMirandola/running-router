'use client';

//Map component Component from library
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef
} from "@vis.gl/react-google-maps";

import { useState } from "react";


export function MapDisplay() {
  const position = { lat: 43.805153, lng: -79.628021 };

  const [markerRef, marker] = useAdvancedMarkerRef();
  const [selectedMarker, setSelectedMarker] = useState<{name: string; info: string, lat: number; lng: number;} | null>(null);
  const [open, setOpen] = useState(false);


  const pinStops = [
    {
      name: '59 Royalpark Way',
      info: 'This is my house located in Vaughan, Ontario, Canada.',
      lat: 43.805152,
      lng: -79.628020,
    }
  ]
  
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}>
      <div className="h-screen w-screen">
        <Map defaultZoom={18} defaultCenter={position} mapId="my_map" draggableCursor='crosshair'>

        {pinStops.map((element, index) => {
          return (
            <AdvancedMarker
              ref={markerRef}
              key={index}
              title={element.name}
              position={{
                lat: element.lat,
                lng: element.lng
              }}
              onClick={() => {
                setOpen(true)
                setSelectedMarker(element);
              }}
            />
          );
        })}
        {open && selectedMarker && (
          <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
            <div>
              <h1>{selectedMarker.name}</h1>
              <p>{selectedMarker.info}</p>
            </div>
          </InfoWindow>
        )}

       
        </Map>
      </div>
    </APIProvider>
  );
}
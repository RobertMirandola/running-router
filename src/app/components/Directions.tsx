'use client';

import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { MarkerData } from "../types/map";

interface DirectionsProps {
  markers: MarkerData[];
}

interface DirectionRenderer {
  originIndex: number,
  destinationIndex: number,
  directionRenderer: google.maps.DirectionsRenderer
}

export function Directions({ 
  markers, 
}: DirectionsProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [renderers, setRenderers] =
    useState<DirectionRenderer[]>([]);

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
  }, [routesLibrary, map]);

  const clearDirections = () => {
    for (let i = 0; i < renderers.length; i++) {
      renderers[i].directionRenderer.set('directions', null);
    }
  }

  // Calculate and display directions when markers change
  useEffect(() => {
    // First, handle the case where we need to clear directions
    if (!directionsService) return;
    
    if (markers.length < 2) {
      // Clear directions if we don't have enough markers
      clearDirections();
      return;
    }
    
    // First and last markers are origin and destination
    const origin = markers[markers.length - 2];
    const destination = markers[markers.length - 1];
    
    // Create the route request
    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(origin.lat, origin.lng),
      destination: new google.maps.LatLng(destination.lat, destination.lng),
      travelMode: google.maps.TravelMode.WALKING,
      optimizeWaypoints: false // Keep waypoints in order
    };
    
    // Request the route
    directionsService.route(request)
      .then(response => {
        const directionsDisplay = new google.maps.DirectionsRenderer({
          map,
          draggable: true,
          markerOptions: {
            visible: false // Hide the default markers
          },
          preserveViewport: true // Don't auto-zoom on route change
        });
        directionsDisplay.setDirections(response);
        
        // Add direction info to renderer state
        const newDirectionRenderer: DirectionRenderer = {
          originIndex: markers.indexOf(origin),
          destinationIndex: markers.indexOf(destination),
          directionRenderer: directionsDisplay,
        }

        setRenderers(prevRenderers => [
          ...prevRenderers,
          newDirectionRenderer
        ]);
      })
      .catch(error => {
        console.error('Directions request failed:', error);
      });
  }, [directionsService, markers]);

  return null;
}

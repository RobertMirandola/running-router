'use client';

import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useState, useEffect, useCallback } from "react";
import { MarkerData } from "../types/map";


interface DirectionsProps {
  markers: MarkerData[];
}

export function Directions({ 
  markers, 
}: DirectionsProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    
    setDirectionsService(new routesLibrary.DirectionsService());
    
    // Create a renderer that's draggable and doesn't show markers
    // (since we already have our own markers)
    const renderer = new routesLibrary.DirectionsRenderer({
      draggable: true,
      map,
      markerOptions: {
        visible: false // Hide the default markers
      },
      preserveViewport: true // Don't auto-zoom on route change
    });
    
    setDirectionsRenderer(renderer);
    
    // Clean up when unmounting
    return () => {
      renderer.setMap(null);
    };
  }, [routesLibrary, map]);

  // Calculate and display directions when markers change
  useEffect(() => {
    // First, handle the case where we need to clear directions
    if (!directionsService || !directionsRenderer) return;
    
    if (markers.length < 2) {
      // Clear directions if we don't have enough markers
      directionsRenderer.set('directions', null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // First and last markers are origin and destination
    const origin = markers[0];
    const destination = markers[markers.length - 1];
    
    // All markers in between become waypoints
    const waypoints = markers.slice(1, -1).map(marker => ({
      location: new google.maps.LatLng(marker.lat, marker.lng),
      stopover: true
    }));
    
    // Create the route request
    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(origin.lat, origin.lng),
      destination: new google.maps.LatLng(destination.lat, destination.lng),
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.WALKING,
      optimizeWaypoints: false // Keep waypoints in order
    };
    
    // Request the route
    directionsService.route(request)
      .then(response => {
        directionsRenderer.setDirections(response);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Directions request failed:', error);
        setError('Failed to calculate route');
        setIsLoading(false);
      });
  }, [directionsService, directionsRenderer, markers, map]);

  // Add listener for directions_changed event to capture user drag interactions
  useEffect(() => {
    if (!directionsRenderer) return;
    
    const listener = directionsRenderer.addListener('directions_changed', () => {
      const result = directionsRenderer.getDirections();
      if (result) {
        console.log('Route modified by user:', result);
        // You can update your app state here if needed when user drags the route
      }
    });
    
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [directionsRenderer]);

  return (
    <>
      {isLoading && <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow">Calculating route...</div>}
      {error && <div className="absolute bottom-4 right-4 bg-red-100 p-2 rounded shadow text-red-700">{error}</div>}
    </>
  );
}

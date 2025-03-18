'use client';

import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useState, useEffect, useRef } from "react";
import { MarkerData } from "../types/map";

interface DirectionsProps {
  markers: MarkerData[];
  onUndo?: () => void; // Add optional callback for parent component
}

interface DirectionRenderer {
  originIndex: number,
  destinationIndex: number,
  directionRenderer: google.maps.DirectionsRenderer
  directionResult: google.maps.DirectionsResult | null,
}

export function Directions({ 
  markers,
  onUndo,
}: DirectionsProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [renderers, setRenderers] =
    useState<DirectionRenderer[]>([]);
  // Keep track of previous markers length to detect additions vs removals
  const prevMarkersLengthRef = useRef(0);

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
  }, [routesLibrary, map]);

  const clearDirections = () => {
    for (let i = 0; i < renderers.length; i++) {
      renderers[i].directionRenderer.set('directions', null);
      setRenderers([]);
    }
  }

  const computeTotalDistance = () => {
    let totalDistance = 0;
    for (let i = 0; i < renderers.length; i++) {
      const directionResult = renderers[i].directionResult;

      if (!directionResult) continue;
      const myroute = directionResult.routes[0];
      if (!myroute) {
        continue;
      }
    
      for (let i = 0; i < myroute.legs.length; i++) {
        totalDistance += myroute.legs[i]!.distance!.value;
      }
    }

    // total = total / 1000;
    console.log('total route distance = ', totalDistance)
  }

  useEffect(() => {
    computeTotalDistance();
  }, [renderers]);

  // Update prevMarkersLengthRef after each markers change
  useEffect(() => {
    // This runs after the main effect
    return () => {
      prevMarkersLengthRef.current = markers.length;
    };
  }, [markers]);

  // Calculate and display directions when markers change
  useEffect(() => {
    // Skip if we're undoing or removing markers
    if (markers.length < prevMarkersLengthRef.current) {
      return;
    }

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

    const directionsDisplay = new google.maps.DirectionsRenderer({
      map,
      draggable: true,
      markerOptions: {
        visible: false // Hide the default markers
      },
      preserveViewport: true // Don't auto-zoom on route change
    });
    

    directionsDisplay.addListener("directions_changed", () => {
      const directions = directionsDisplay.getDirections();

      if (directions) {
        // Update the directionResult in renderers array
        setRenderers(prevRenderers => {
          return prevRenderers.map(renderer => {
            // Check if this is the renderer that was changed
            if (renderer.directionRenderer === directionsDisplay) {
              // Update the directionResult while keeping all other properties
              return {
                ...renderer,
                directionResult: directions
              };
            }
            // Return unchanged renderer
            return renderer;
          });
        });
      }
    });
    
    // Request the route
    directionsService.route(request)
      .then(directionResult => {
        directionsDisplay.setDirections(directionResult);

        // Add direction info to renderer state
        const newDirectionRenderer: DirectionRenderer = {
          originIndex: markers.indexOf(origin),
          destinationIndex: markers.indexOf(destination),
          directionRenderer: directionsDisplay,
          directionResult: directionResult,
        }

        const updatedRenderers = [...renderers, newDirectionRenderer];
        setRenderers(updatedRenderers);
      })
  }, [directionsService, markers]);

  const handleUndo = () => {
    if (renderers.length === 0) return;
    
    // Remove last renderer visually
    const updatedRenderers = [...renderers];
    const lastRenderer = updatedRenderers[updatedRenderers.length - 1];
    
    if (lastRenderer && lastRenderer.directionRenderer) {
      // Remove direction from map
      lastRenderer.directionRenderer.set('directions', null);
    }
    
    // Remove last renderer from state
    updatedRenderers.pop();
    setRenderers(updatedRenderers);
    
    // Notify parent component to remove the last marker
    if (onUndo) {
      onUndo();
    }
  }

  return (
    <>
      {markers && markers.length >= 2 && (
        <div className="absolute bottom-4 left-4 flex flex-col items-end gap-2">
          <button 
            onClick={handleUndo}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors"
          >
            Undo Last Marker
          </button>
        </div>
      )}
    </>
  );
}

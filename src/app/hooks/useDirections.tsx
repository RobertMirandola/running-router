'use client';

import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useState, useEffect, useRef } from "react";
import { MarkerData } from "../types/map";

// Interface for renderer object
interface DirectionRenderer {
  originIndex: number,
  destinationIndex: number,
  directionRenderer: google.maps.DirectionsRenderer
  directionResult: google.maps.DirectionsResult | null,
}

// Interface for hook parameters
interface UseDirectionsProps {
  markers: MarkerData[];
  onUndo?: () => void;
  onClearWaypoints?: () => void;
}

// Interface for hook return values
interface UseDirectionsReturn {
  renderers: DirectionRenderer[];
  clearDirections: () => void;
  handleUndoDirection: () => void;
  handleClearWayPoints: () => void;
}

// Hook to manage directions
export function useDirections({
  markers,
  onUndo,
  onClearWaypoints
}: UseDirectionsProps): UseDirectionsReturn {
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
    let routePath: google.maps.LatLng[] = [];

    if (renderers.length > 0) {
      for (let i = 0; i < renderers.length; i++) {
        const directionResult = renderers[i].directionResult;
        if (!directionResult) continue;
        
  
        const route = directionResult.routes[0];
        if (!route) continue;

        routePath = [...routePath, ...route.overview_path];
      
        for (let i = 0; i < route.legs.length; i++) {
          totalDistance += route.legs[i]!.distance!.value;
        }
      }
  
      // const elevator = new google.maps.ElevationService;
      // elevator.getElevationAlongPath({
      //   path: routePath,
      //   samples: 256,
      // }).then((response) => {
      //   console.log(response)
      //   debugger
      // })

      // total = total / 1000;
      console.log('total route distance = ', totalDistance)
      // console.log('total paths = ', routePath)
    }
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
  }, [directionsService, markers, map]);

  const handleUndoDirection = () => {
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

  const handleClearWayPoints = () => {
    clearDirections();

    if (onClearWaypoints) {
      onClearWaypoints();
    }
  }

  return {
    renderers,
    clearDirections,
    handleUndoDirection,
    handleClearWayPoints
  };
} 
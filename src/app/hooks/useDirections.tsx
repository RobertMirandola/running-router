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
  listener: google.maps.MapsEventListener
}

// Interface for hook parameters
interface UseDirectionsProps {
  markers: MarkerData[];
  onUndo?: () => void;
  onClearWaypoints?: () => void;
}

// Interface for hook return values
interface UseDirectionsReturn {
  totalDistance: number,
  elevationGain: number,
  elevationLoss: number,
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
  const [totalDistance, setTotalDistance] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);
  const [elevationLoss, setElevationLoss] = useState(0)

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
  }, [routesLibrary, map]);

  const clearDirections = () => {
    for (let i = 0; i < renderers.length; i++) {
      renderers[i].directionRenderer.set('directions', null);
      renderers[i].listener.remove();
    }
    setRenderers([]);
  }

  const updatedRenderersWithNewDirections = (directionsDisplay: google.maps.DirectionsRenderer) => {
    const directions = directionsDisplay.getDirections();

    if (directions) {
      // Update the directionResult in renderers array
      setRenderers(prevRenderers => {
        return prevRenderers.map(renderer => {
          // Check if this is the renderer that was changed
          if (renderer.directionRenderer === directionsDisplay) {
            return {
              ...renderer,
              directionResult: directions
            };
          }
          return renderer;
        });
      });
    }
  }

  const computeRouteMetrics = () => {
    let totalDistance = 0;
    let routePath: google.maps.LatLng[] = [];

    if (renderers.length === 0) {
      setTotalDistance(0);
      setElevationGain(0);
      setElevationLoss(0);
    }
    else {
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
      setTotalDistance(totalDistance > 0 ? Number((totalDistance / 1000).toFixed(2)) : 0);
    }

    const elevator = new google.maps.ElevationService;
    elevator.getElevationAlongPath({
      path: routePath,
      samples: 256,
    }).then((response) => {
      let totalElevationGain = 0;
      let totalElevationLoss = 0;
      
      for (let i = 1; i < response.results.length; i++) {
        const elevationDiff = response.results[i].elevation - response.results[i-1].elevation;
        if (elevationDiff > 0) {
          totalElevationGain += elevationDiff;
        } else {
          totalElevationLoss += Math.abs(elevationDiff);
        }
      }

      setElevationGain(totalElevationGain > 0 ? Number(totalElevationGain.toFixed(2)) : 0);
      setElevationLoss(totalElevationLoss > 0 ? Number(totalElevationLoss.toFixed(2)) : 0);
    });
  }

  useEffect(() => {
    computeRouteMetrics();
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

    // Store the listener function for cleanup
    const listener = () => updatedRenderersWithNewDirections(directionsDisplay);
    const mapsEventListener = directionsDisplay.addListener("directions_changed", listener);
    
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
          listener: mapsEventListener
        }

        const updatedRenderers = [...renderers, newDirectionRenderer];
        setRenderers(updatedRenderers);
      })
  }, [directionsService, markers, map]);

  const handleUndoDirection = () => {
    if (renderers.length === 0) return;
    
    const updatedRenderers = [...renderers];
    const lastRenderer = updatedRenderers[updatedRenderers.length - 1];
    
    if (lastRenderer && lastRenderer.directionRenderer) {
      // Remove direction from map
      lastRenderer.directionRenderer.set('directions', null);
      // Remove the event listener
      lastRenderer.listener.remove();
    }
    
    updatedRenderers.pop();
    setRenderers(updatedRenderers);
    
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
    totalDistance,
    elevationGain,
    elevationLoss,
    handleUndoDirection,
    handleClearWayPoints
  };
} 
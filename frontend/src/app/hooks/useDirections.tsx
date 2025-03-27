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
  handleSaveRoute: () => void;
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
  const [elevationLoss, setElevationLoss] = useState(0);

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

  const processElevationData = async (routePath : google.maps.LatLng[]) => {
    const elevator = new google.maps.ElevationService;
    // Check if routePath is too long (over 512 coordinates)
    const MAX_PATH_LENGTH = 512;
    let totalElevationGain = 0;
    let totalElevationLoss = 0;
    
    // Process the path in chunks since the max path length for elevation api is 512 coordinates
    for (let i = 0; i < routePath.length; i += MAX_PATH_LENGTH) {
      const pathChunk = routePath.slice(i, Math.min(i + MAX_PATH_LENGTH, routePath.length));
      const samples = Math.min(256, pathChunk.length);
      
      try {
        const response = await elevator.getElevationAlongPath({
          path: pathChunk,
          samples: samples,
        });
        
        // Process each chunk's elevation data
        for (let j = 1; j < response.results.length; j++) {
          const elevationDiff = response.results[j].elevation - response.results[j-1].elevation;
          if (elevationDiff > 0) {
            totalElevationGain += elevationDiff;
          } else {
            totalElevationLoss += Math.abs(elevationDiff);
          }
        }
      } catch (error) {
        console.error("Error fetching elevation data:", error);
      }
    }
    
    // Set the final elevation values
    setElevationGain(totalElevationGain > 0 ? Math.round(totalElevationGain) : 0);
    setElevationLoss(totalElevationLoss > 0 ? Math.round(totalElevationLoss) : 0);
  };

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
      
      processElevationData(routePath);
    }
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
    if (renderers.length > 0) {
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
    }
    
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

  const handleSaveRoute = () => {
    // Clear existing routes
    handleClearWayPoints();

    if (!directionsService || !map || markers.length < 2) {
      console.error('Cannot save route: Missing directionsService, map, or insufficient markers');
      return;
    }


    // Array to store all waypoints in their correct order
    const allWaypoints: google.maps.DirectionsWaypoint[] = [];
      
    // Process each segment between consecutive markers
    for (let i = 0; i < markers.length - 1; i++) {
      const currentMarker = markers[i];
      
      // If this isn't the first marker, add it as a stopover
      if (i > 0) {
        allWaypoints.push({
          location: new google.maps.LatLng(currentMarker.lat, currentMarker.lng),
          stopover: true
        });
      }
      
      // Find any renderer that connects these two markers
      const renderer = renderers.find(r => 
        r.originIndex === i && r.destinationIndex === i + 1);
      
      // If we found a renderer with via_waypoints, add them
      if (renderer && renderer.directionResult && 
          renderer.directionResult.routes[0] && 
          renderer.directionResult.routes[0].legs[0] && 
          renderer.directionResult.routes[0].legs[0].via_waypoints) {
        
        // Add all via_waypoints as non-stopover waypoints
        renderer.directionResult.routes[0].legs[0].via_waypoints.forEach(waypoint => {
          allWaypoints.push({
            location: new google.maps.LatLng(waypoint.lat(), waypoint.lng()),
            stopover: true
          });
        });
      }
    }
    
    const overviewPath: google.maps.LatLng[] = [];

    for (let i = 0; i < renderers.length; i++) {
      const renderer = renderers[i];
      
      // If we found a renderer with via_waypoints, add them
      if (renderer && renderer.directionResult && 
          renderer.directionResult.routes[0]) {
        const rendererOverviewPath = renderer.directionResult.routes[0].overview_path;
        for (let i = 0; i < rendererOverviewPath.length; i++) {
          overviewPath.push(new google.maps.LatLng(
            rendererOverviewPath[i].lat(), 
            rendererOverviewPath[i].lng()
          ));
        }
      }
    }
    
    console.log('markers', markers)
    console.log('Overview path: ', overviewPath)
    debugger

    const routePath = new google.maps.Polyline({
      path: overviewPath,
      geodesic: true,
      strokeColor: "#8FBCFF",
      strokeOpacity: 1.0,
      strokeWeight: 5,
    });
  
    routePath.setMap(map);


    /**
     * We want to save the following:
     * - Route Name : string
     * - Route Description : string
     * - Route Overview Path : array of lat lng objects
     * - Markers: array of lat, lng, waypoint names
     * - Route Waypoints: array of google.maps.DirectionWaypoint
     * - Distance : number
     * - Elevation Gain : number
     * - Elevation Loss : number
     */
  
  }

  return {
    totalDistance,
    elevationGain,
    elevationLoss,
    handleUndoDirection,
    handleClearWayPoints,
    handleSaveRoute
  };
} 
'use client';

import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
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
  const [directionRenderer, setDirectionRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [waypoints, setWaypoints] = useState<google.maps.DirectionsWaypoint[]>([]);

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionRenderer(new routesLibrary.DirectionsRenderer( {
      map,
      draggable: true,
      markerOptions: {
        visible: false // Hide the default markers
      },
      preserveViewport: true // Don't auto-zoom on route change
    }));
  }, [routesLibrary, map]);


  // Only runs when markers change
  useEffect(() => {
    // First, handle the case where we need to clear directions
    if (!directionsService || !directionRenderer) return;
    
    if (markers.length < 2) {
      // Clear directions if we don't have enough markers
      directionRenderer.set('directions', null);
      return;
    }
    
    // First and last markers are origin and destination
    const origin = markers[0];
    const destination = markers[markers.length - 1];
  

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(origin.lat, origin.lng),
      destination: new google.maps.LatLng(destination.lat, destination.lng),
      waypoints: waypoints.length > 0 ? waypoints : undefined, // Only add waypoints if we have any
      travelMode: google.maps.TravelMode.WALKING,
      optimizeWaypoints: false // Keep waypoints in order
    };
    
    // Request the route
    directionsService.route(request)
      .then(response => {
        directionRenderer.setDirections(response);

        // Only add listener if it doesn't already exist
        google.maps.event.clearListeners(directionRenderer, 'directions_changed');
        
        directionRenderer.addListener("directions_changed", () => {

          const directions = directionRenderer.getDirections();
          if (directions && directions.routes && directions.routes.length > 0) {
            // Create an array to hold all waypoints
            let newWaypoints: google.maps.DirectionsWaypoint[] = [];
            
            // Now process legs and their via_waypoints in order
            let waypointIndex = 0;
            
            directions.routes[0].legs.forEach((leg, legIndex) => {
              // Each leg connects two waypoints - add any dragged waypoints in between
              if (leg.via_waypoints && leg.via_waypoints.length > 0) {
                console.log(`Leg ${legIndex} has ${leg.via_waypoints.length} via waypoints`);
                
                // Extract the via_waypoints from this leg
                leg.via_waypoints.forEach((via: google.maps.LatLng) => {
                  // Create a new waypoint from the via_waypoint location
                  const draggedWaypoint: google.maps.DirectionsWaypoint = {
                    location: via,
                    stopover: true
                  };
                  
                  newWaypoints.push(draggedWaypoint);
                });
              }
              
              // After each leg (except the last one), add the corresponding existing waypoint 
              // from the original waypoints array
              if (legIndex < directions.routes[0].legs.length - 1 && waypointIndex < waypoints.length) {
                newWaypoints.push(waypoints[waypointIndex]);
                waypointIndex++;
              }
            });
            
            // The last point (destination) should be added as a waypoint for the next route
            const destinationWaypoint: google.maps.DirectionsWaypoint = {
              location: new google.maps.LatLng(
                markers[markers.length - 1].lat,
                markers[markers.length - 1].lng
              ),
              stopover: true
            };
            
            // Compare the two arrays properly
            const waypointsChanged = 
              newWaypoints.length !== waypoints.length || 
              JSON.stringify(newWaypoints) !== JSON.stringify(waypoints);
            
            // Only update if the waypoints have actually changed
            if (waypointsChanged) {
              // Add the destination waypoint for future routes
              newWaypoints.push(destinationWaypoint);
              setWaypoints(newWaypoints);
            }
          }
        });
      })
      .catch(error => {
        console.error('Directions request failed:', error);
      });
  }, [markers]);

  return null;
}

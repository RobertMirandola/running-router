'use client';

import { MarkerData } from "../types/map";
import { useDirections } from "../hooks/useDirections";
import { Undo, Trash2, Map, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DirectionsProps {
  markers: MarkerData[];
  onUndo?: () => void;
  onClearWaypoints?: () => void;
}

export function Directions({ 
  markers,
  onUndo,
  onClearWaypoints
}: DirectionsProps) {
  // Use our custom hook to handle all directions logic
  const {
    totalDistance,
    elevationGain,
    elevationLoss,
    handleUndoDirection,
    handleClearWayPoints,
  } = useDirections({
    markers,
    onUndo,
    onClearWaypoints
  });


  return (
    <>
      <div className="absolute top-4 left-0 right-0 flex flex-row gap-4 justify-center">
        <button 
          onClick={handleUndoDirection}
          className="p-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded shadow-lg cursor-pointer transition-colors"
          aria-label="Undo Last Marker"
          title="Undo Last Marker"
        >
          <Undo size={24} />
        </button>
        <button 
          onClick={handleClearWayPoints}
          className="p-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded shadow-lg cursor-pointer transition-colors"
          aria-label="Clear Waypoints"
          title="Clear Waypoints"
        >
          Clear Waypoints
          {/* <Trash2 size={24} /> */}
        </button>
      </div>

      {/* Distance display bar at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-10 flex justify-center items-center">
        <div className="flex items-center mr-6">
          <Map className="h-6 w-6 mr-2 text-blue-500" />
          <span className="font-bold mr-2">Total Distance:</span>
          <span>{totalDistance} km</span>
        </div>
        <div className="flex items-center mr-6">
          <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
          <span className="font-bold mr-2">Elevation Gain:</span>
          <span>{elevationGain} m</span>
        </div>
        <div className="flex items-center">
          <TrendingDown className="h-6 w-6 mr-2 text-red-500" />
          <span className="font-bold mr-2">Elevation Loss:</span>
          <span>{elevationLoss} m</span>
        </div>
      </div>
    </>
  );
}

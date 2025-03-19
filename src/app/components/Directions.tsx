'use client';

import { MarkerData } from "../types/map";
import { useDirections } from "../hooks/useDirections";

interface DirectionsProps {
  markers: MarkerData[];
  onUndo?: () => void;
  onClearWaypoints?: () => void;
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
  onClearWaypoints
}: DirectionsProps) {
  // Use our custom hook to handle all directions logic
  const {
    handleUndoDirection,
    handleClearWayPoints
  } = useDirections({
    markers,
    onUndo,
    onClearWaypoints
  });

  return (
    <>
      <div className="absolute top-4 right-4 flex flex-row gap-4">
        <button 
          onClick={handleUndoDirection}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded shadow-lg cursor-pointer transition-colors"
          aria-label="Undo"
        >
          Undo Last Marker
        </button>
        <button 
          onClick={handleClearWayPoints}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded shadow-lg cursor-pointer transition-colors"
        >
          Clear Waypoints
        </button>
      </div>
    </>
  );
}

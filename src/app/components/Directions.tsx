'use client';

import { MarkerData } from "../types/map";
import { useDirections } from "../hooks/useDirections";

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

      {/* Distance display bar at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-10 flex justify-center items-center">
        <div className="flex items-center mr-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="font-bold mr-2">Total Distance:</span>
          <span>{totalDistance} km</span>
        </div>
        <div className="flex items-center mr-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <span className="font-bold mr-2">Elevation Gain:</span>
          <span>{elevationGain} m</span>
        </div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="font-bold mr-2">Elevation Loss:</span>
          <span>{elevationLoss} m</span>
        </div>
      </div>
    </>
  );
}

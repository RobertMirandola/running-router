'use client';

import { MarkerData } from "../types/map";
import { useDirections } from "../hooks/useDirections";
import { Undo, Trash2, Map, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import SearchBar from "../../components/ui/searchBar";
import { useMap } from "@vis.gl/react-google-maps";

interface DirectionsProps {
  markers: MarkerData[];
  onUndo?: () => void;
  onClearWaypoints?: () => void;
  onAddMarker?: (marker: MarkerData, nextWaypoint: number) => void;
}

export function Directions({ 
  markers,
  onUndo,
  onClearWaypoints,
  onAddMarker
}: DirectionsProps) {
  // Get map instance to center on selected location
  const map = useMap();
  const [routeName, setRouteName] = useState("");
  const [routeDescription, setRouteDescription] = useState("");
  
  // Use our custom hook to handle all directions logic
  const {
    totalDistance,
    elevationGain,
    elevationLoss,
    handleUndoDirection,
    handleClearWayPoints,
    handleSaveRoute
  } = useDirections({
    markers,
    onUndo,
    onClearWaypoints
  });

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // Add your custom options here if needed
    },
    debounce: 300,
  });

  // Handle selecting a place from the search results
  const handleSelectSuggestion = async (selectedValue: string) => {
    try {
      // Set the value to the selected suggestion
      setValue(selectedValue, false);
      
      // Clear suggestions
      clearSuggestions();

      // Clear all previous directions
      handleClearWayPoints();
      
      // Get latitude and longitude from the selected address
      const results = await getGeocode({ address: selectedValue });
      const { lat, lng } = await getLatLng(results[0]);
      
      // Create a new marker data object
      const newMarker: MarkerData = {
        name: selectedValue,
        lat,
        lng
      };
      
      // Add the marker to the map
      if (onAddMarker) {
        onAddMarker(newMarker, 0);
      }
      
      // Center the map on the selected location
      if (map) {
        map.panTo({ lat, lng });
      }
      
    } catch (error) {
      console.error("Error finding location: ", error);
    }
  };

  // Handle search input change
  const handleSearchChange = (newValue: string) => {
    setValue(newValue);
  };

  const handleRouteDialogSave = async () => {
    handleSaveRoute(routeName, routeDescription);
    
    setRouteName("");
    setRouteDescription("");
  }

  return (
    <>
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <div className="w-full flex justify-between">
          <div className="ml-4 mt-1 flex gap-2">
            <SearchBar 
              placeholder="Choose a starting point ..."
              value={value}
              onChange={handleSearchChange}
              onSelectSuggestion={handleSelectSuggestion}
              suggestions={data}
              showSuggestions={status === "OK"}
            />
            <button 
              onClick={handleUndoDirection}
              className="h-[42px] p-2 bg-white hover:bg-gray-100 text-gray-500 font-bold rounded-md shadow-lg cursor-pointer transition-colors flex-shrink-0 border-1 border-gray-400"
              aria-label="Undo Last Marker"
              title="Undo Last Marker"
            >
              <Undo size={24} />
            </button>
            <button 
              onClick={handleClearWayPoints}
              className="h-[42px] p-2 bg-white hover:bg-gray-100 text-gray-500 font-bold rounded-md shadow-lg cursor-pointer transition-colors flex-shrink-0 border-1 border-gray-400"
              aria-label="Clear Waypoints"
              title="Clear Waypoints"
            >
              <Trash2 size={24} />
            </button>
          </div>
          <div className="mr-4 mt-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="cursor-pointer" disabled={markers.length < 2} size="lg" type="button">Save Route</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Save Route</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right flex justify-end">
                    Name
                  </Label>
                  <Input id="name" value={routeName} onChange={(e) => setRouteName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="routedesc" className="text-right flex justify-end">
                    Description
                  </Label>
                  <Textarea id="routedesc" value={routeDescription} onChange={(e) => setRouteDescription(e.target.value)} className="col-span-3"/>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="cursor-pointer" type="submit" onClick={handleRouteDialogSave}>Save</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Distance display bar at the bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 shadow-lg z-10 flex justify-center items-center rounded-xl">
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

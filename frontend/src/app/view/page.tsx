'use client';

import React, { useEffect, useState } from 'react';
import { MapsProvider } from '../providers/MapsProvider';
import axios from 'axios';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface RouteData {
  _id: string;
  name: string;
  description: string;
  encodedPolyline: string,
  distance: number;
  duration: number,
  elevationGain: number;
  elevationLoss: number;
  createdAt: string;
}

export default function ViewPage() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Get API key from environment variable
    const googleMapsApiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY || '';
    setApiKey(googleMapsApiKey);

    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3500/map');
        setRoutes(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching routes:', err);
        setError('Failed to load routes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Generate Google Maps Static API URL for the route
  const getMapImageUrl = (encodedPolyline: string): string | undefined => {
    if (!encodedPolyline || !apiKey) return undefined;
    
    return `https://maps.googleapis.com/maps/api/staticmap?size=640x250&scale=2&path=color:0xFF5722FF|weight:5|enc:${encodedPolyline}&key=${apiKey}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 h-full overflow-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Routes</h1>
        <Link href="/create">
          <Button className="cursor-pointer text-lg py-6 px-8" size="lg" type="button">Create New Route</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 border-opacity-50"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : routes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <h2 className="text-xl font-medium text-gray-700">No routes found</h2>
          <p className="mt-2 text-gray-500">Create your first route to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div key={route._id} className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Route map image using Google Maps Static API */}
              <div className="bg-gray-100 relative h-[250px]">
                {route.encodedPolyline && apiKey ? (
                  <img 
                    src={getMapImageUrl(route.encodedPolyline)} 
                    alt={`Map of ${route.name || 'route'}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    No map data available
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-2xl font-bold">{route.name || `${route.distance.toFixed(1)}k Route`}</h2>
                  <div className="text-gray-600">{formatDate(route.createdAt)}</div>
                </div>
                
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-1" />
                    <span>{route.distance.toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-1" />
                    <span>{route.elevationGain} m</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingDown className="w-5 h-5 mr-1" />
                    <span>{route.elevationLoss} m</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

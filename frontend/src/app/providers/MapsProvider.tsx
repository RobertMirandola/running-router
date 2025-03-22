'use client';

import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

type MapsApiProviderProps = {
  children: React.ReactNode;
};

export function MapsProvider({ children }: MapsApiProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY as string;
  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      {children}
    </APIProvider>
  );
}
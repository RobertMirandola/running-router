'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { MapDisplay } from './MapDisplay';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar Navigation */}
      {/* <Navbar collapsed={sidebarCollapsed} onToggle={toggleSidebar} /> */}
      
      {/* Main Content */}
      <div className="flex-1 h-screen overflow-hidden">
        <MapDisplay />
      </div>
    </div>
  );
} 
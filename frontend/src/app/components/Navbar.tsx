'use client';

import React from 'react';
import { MapPin, Menu, Settings, List, Home } from 'lucide-react';

interface NavbarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Navbar({ collapsed = false, onToggle }: NavbarProps) {
  return (
    <div 
      className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-md ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* App Logo/Title */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-blue-600">Running Router</h1>
        )}
        <button 
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2">
          <li>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md mx-2"
            >
              <Home className="h-5 w-5 text-gray-500" />
              {!collapsed && <span className="ml-3">Home</span>}
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md mx-2"
            >
              <MapPin className="h-5 w-5 text-gray-500" />
              {!collapsed && <span className="ml-3">My Routes</span>}
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md mx-2"
            >
              <List className="h-5 w-5 text-gray-500" />
              {!collapsed && <span className="ml-3">Saved Routes</span>}
            </a>
          </li>
        </ul>
      </nav>

    </div>
  );
} 
'use client';

import { useState } from 'react';
import KioskInterface from '@/components/kiosk/KioskInterface';
import type { Language } from '@/types';

export default function KioskDemoPage() {
  const [kioskLocation, setKioskLocation] = useState({
    type: 'bus_station' as const,
    name: 'Main Bus Station',
    district: 'ernakulam'
  });

  const locationOptions = [
    { type: 'bus_station' as const, name: 'Main Bus Station', district: 'ernakulam' },
    { type: 'bus_station' as const, name: 'Central Railway Station', district: 'thiruvananthapuram' },
    { type: 'labor_camp' as const, name: 'Industrial Estate Camp', district: 'kochi' },
    { type: 'labor_camp' as const, name: 'Construction Workers Camp', district: 'thrissur' },
    { type: 'hospital' as const, name: 'General Hospital', district: 'kozhikode' },
    { type: 'mobile_unit' as const, name: 'Mobile Health Van', district: 'wayanad' }
  ];

  return (
    <div className="min-h-screen">
      {/* Location Selector for Demo (hidden in production) */}
      <div className="fixed top-4 left-4 z-50 bg-white p-4 rounded-lg shadow-lg max-w-xs opacity-80 hover:opacity-100 transition-opacity">
        <h3 className="font-bold text-sm mb-2">Demo: Select Kiosk Location</h3>
        <select
          value={JSON.stringify(kioskLocation)}
          onChange={(e) => setKioskLocation(JSON.parse(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          {locationOptions.map((location, index) => (
            <option key={index} value={JSON.stringify(location)}>
              {location.name} - {location.district}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600 mt-2">
          This selector is for demo purposes only. In production, location would be auto-detected.
        </p>
      </div>

      {/* Kiosk Interface */}
      <KioskInterface location={kioskLocation} />
    </div>
  );
}
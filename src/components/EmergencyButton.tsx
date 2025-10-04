'use client';

import React from 'react';

export default function EmergencyButton() {
  const handleEmergencyCall = () => {
    window.open('tel:108', '_self');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        className="bg-error-red text-white p-4 rounded-full shadow-lg animate-pulse-neon hover:bg-red-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300"
        aria-label="Emergency Contact"
        title="Emergency Contact - Call 108"
        onClick={handleEmergencyCall}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
          />
        </svg>
      </button>
    </div>
  );
}
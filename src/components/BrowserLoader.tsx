import React from 'react';
import './BrowserLoader.css';

export function BrowserLoader() {
  return (
    <div className="main-container">
      <div className="loader">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f093fb', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f5576c', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#4facfe', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#00f2fe', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Outer ring */}
          <circle 
            cx="100" 
            cy="100" 
            r="70" 
            fill="none" 
            stroke="url(#gradient1)" 
            strokeWidth="4" 
            strokeDasharray="350 90"
            className="ring ring-1"
          />
          
          {/* Middle ring */}
          <circle 
            cx="100" 
            cy="100" 
            r="55" 
            fill="none" 
            stroke="url(#gradient2)" 
            strokeWidth="3" 
            strokeDasharray="250 90"
            className="ring ring-2"
          />
          
          {/* Inner ring */}
          <circle 
            cx="100" 
            cy="100" 
            r="40" 
            fill="none" 
            stroke="url(#gradient3)" 
            strokeWidth="2" 
            strokeDasharray="180 70"
            className="ring ring-3"
          />
          
          {/* Center glow */}
          <circle cx="100" cy="100" r="25" fill="url(#gradient1)" className="glow" opacity="0.3" />
          <circle cx="100" cy="100" r="15" fill="url(#gradient2)" className="glow-pulse" />
        </svg>
        
        <div className="loading-text-modern">MESSU BOUW</div>
      </div>
    </div>
  );
}

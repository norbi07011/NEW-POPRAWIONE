import React from 'react';
import './BrowserLoader.css';

export function BrowserLoader() {
  return (
    <div className="main-container">
      <div className="loader">
        <svg id="browser" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <line className="grid-line" x1="0" y1="0" x2="0" y2="20" />
              <line className="grid-line" x1="0" y1="0" x2="20" y2="0" />
            </pattern>

            {/* Trace gradients */}
            <linearGradient id="traceGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#00ccff', stopOpacity: 0 }} />
              <stop offset="50%" style={{ stopColor: '#00ccff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#00ccff', stopOpacity: 0 }} />
            </linearGradient>

            <linearGradient id="traceGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#ff3366', stopOpacity: 0 }} />
              <stop offset="50%" style={{ stopColor: '#ff3366', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#ff3366', stopOpacity: 0 }} />
            </linearGradient>

            <linearGradient id="traceGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#ffcc00', stopOpacity: 0 }} />
              <stop offset="50%" style={{ stopColor: '#ffcc00', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#ffcc00', stopOpacity: 0 }} />
            </linearGradient>

            <linearGradient id="traceGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#66ff00', stopOpacity: 0 }} />
              <stop offset="50%" style={{ stopColor: '#66ff00', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#66ff00', stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {/* Background grid */}
          <rect width="800" height="600" fill="url(#grid)" />

          {/* Browser frame */}
          <rect className="browser-frame" x="100" y="100" width="600" height="400" rx="8" ry="8" />
          
          {/* Browser top bar */}
          <rect className="browser-top" x="100" y="100" width="600" height="40" rx="8" ry="8" />
          <rect className="browser-top" x="100" y="130" width="600" height="10" />

          {/* Browser controls */}
          <circle cx="120" cy="120" r="6" fill="#ff5f56" />
          <circle cx="140" cy="120" r="6" fill="#ffbd2e" />
          <circle cx="160" cy="120" r="6" fill="#27c93f" />

          {/* Loading text */}
          <text className="loading-text" x="400" y="125" textAnchor="middle">
            MESSU BOUW - Laden...
          </text>

          {/* Content skeletons */}
          <rect className="skeleton" x="120" y="170" width="560" height="20" />
          <rect className="skeleton" x="120" y="210" width="400" height="15" />
          <rect className="skeleton" x="120" y="240" width="480" height="15" />
          <rect className="skeleton" x="120" y="270" width="350" height="15" />
          
          <rect className="skeleton" x="120" y="310" width="260" height="120" />
          <rect className="skeleton" x="400" y="310" width="280" height="120" />

          <rect className="skeleton" x="120" y="450" width="180" height="30" />
          <rect className="skeleton" x="320" y="450" width="180" height="30" />
          <rect className="skeleton" x="520" y="450" width="160" height="30" />

          {/* Animated traces */}
          <path className="trace-flow" d="M 100 300 Q 200 250, 300 300 T 500 300 L 700 300" style={{ animationDelay: '0s' }} />
          <path className="trace-flow" d="M 100 350 Q 250 400, 400 350 T 600 350 L 700 350" style={{ animationDelay: '0.5s' }} />
          <path className="trace-flow" d="M 100 400 Q 200 350, 350 400 T 550 400 L 700 400" style={{ animationDelay: '1s' }} />
          <path className="trace-flow" d="M 100 450 Q 300 500, 500 450 T 650 450 L 700 450" style={{ animationDelay: '1.5s' }} />
        </svg>
      </div>
    </div>
  );
}

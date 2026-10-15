import React from 'react';

export default function HeroCarIllustration({ className = 'w-full h-auto' }) {
  return (
    <svg
      viewBox="0 0 520 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ground Shadow */}
      <ellipse cx="260" cy="195" rx="230" ry="14" fill="#042a25" opacity="0.75" />

      {/* Main Car Silhouette / Body */}
      <path
        d="M 50 148 
           L 42 148 
           C 38 148 35 144 35 140 
           L 35 130 
           C 35 125 38 120 44 118 
           L 95 106 
           C 105 103 115 98 124 90 
           L 182 42 
           C 192 34 205 30 218 30 
           L 330 30 
           C 344 30 357 35 366 45 
           L 425 100 
           C 432 106 442 110 452 112 
           L 472 116 
           C 480 118 485 124 485 132 
           L 485 140 
           C 485 146 480 150 474 150 
           L 445 150 
           A 46 46 0 0 0 353 150 
           L 205 150 
           A 46 46 0 0 0 113 150 
           L 50 150 
           Z"
        fill="#d5efe7"
      />

      {/* Beltline Groove / Body Line */}
      <path
        d="M 40 126 L 476 126"
        stroke="#b8e1d5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Rear Taillight */}
      <rect x="34" y="121" width="10" height="9" rx="3" fill="#75cebd" />

      {/* Front Headlight */}
      <rect x="474" y="120" width="12" height="10" rx="4" fill="#fef8aa" />

      {/* Windows Cutout Area */}
      {/* Rear Quarter & Passenger Window */}
      <path
        d="M 134 94 
           L 188 48 
           C 194 43 202 40 210 40 
           L 255 40 
           L 255 106 
           L 134 106 
           Z"
        fill="#3f615c"
      />

      {/* Front Driver / Passenger Window */}
      <path
        d="M 264 40 
           L 326 40 
           C 336 40 345 44 352 51 
           L 404 98 
           C 408 102 411 106 414 106 
           L 264 106 
           Z"
        fill="#3f615c"
      />

      {/* Center Pillar */}
      <rect x="255" y="38" width="9" height="70" fill="#d5efe7" />

      {/* Rear Wheel */}
      <g>
        {/* Tire */}
        <circle cx="159" cy="155" r="38" fill="#0d2621" />
        {/* Rim */}
        <circle cx="159" cy="155" r="22" fill="#d5efe7" />
        {/* Hubcap Center */}
        <circle cx="159" cy="155" r="9" fill="#0d2621" />
      </g>

      {/* Front Wheel */}
      <g>
        {/* Tire */}
        <circle cx="399" cy="155" r="38" fill="#0d2621" />
        {/* Rim */}
        <circle cx="399" cy="155" r="22" fill="#d5efe7" />
        {/* Hubcap Center */}
        <circle cx="399" cy="155" r="9" fill="#0d2621" />
      </g>
    </svg>
  );
}

/**
 * G H Raisoni E-Cell Logo Component
 * Highly polished vector SVG replicating the official E-Cell GHRCEM logo.
 * /src/components/ECellLogo.tsx
 */

import React from 'react';

interface ECellLogoProps {
  className?: string;
  size?: number;
  variant?: 'icon' | 'full';
}

export const ECellLogo: React.FC<ECellLogoProps> = ({ 
  className = 'w-6 h-6', 
  size, 
  variant = 'icon' 
}) => {
  // Brand Color Gold
  const gold = '#D4AF37';
  const width = size || (variant === 'full' ? 120 : 32);
  const height = size || 32;

  return (
    <svg 
      className={className} 
      width={width} 
      height={height} 
      viewBox={variant === 'full' ? '0 0 200 100' : '0 0 115 100'} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Geometrical Hexagonal Outer Frame in Gold */}
      {/* Top Segment */}
      <path 
        d="M 32,22 L 82,35 L 82,43" 
        stroke={gold} 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Bottom Segment */}
      <path 
        d="M 82,53 L 82,72 L 35,92 L 10,52 M 10,41 L 32,22" 
        stroke={gold} 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* 2. Sleek Modern Rocket (Pointing up-right) */}
      <g>
        {/* Exhaust Jets Trails (Flaring bottom-left through the gap) */}
        {/* Bottom Jet */}
        <path 
          d="M 31,71 C 24,77 15,81 4,86 C 14,81 22,76 29,71 Z" 
          fill={gold} 
          opacity="0.8"
        />
        {/* Center Jet */}
        <path 
          d="M 34,67 C 26,71 16,73 6,75 C 16,72 25,69 32,67 Z" 
          fill={gold} 
        />
        {/* Top Jet */}
        <path 
          d="M 37,63 C 30,65 20,66 10,67 C 20,65 29,63 35,62 Z" 
          fill={gold} 
          opacity="0.8"
        />

        {/* Rocket Body */}
        <path 
          d="M 31,71 C 36,65 42,55 58,45 C 68,38 72,36 72,36 C 72,36 70,40 63,50 C 53,64 45,71 39,73 Z" 
          fill={gold} 
        />
        
        {/* Cockpit Window */}
        <circle cx="56" cy="48" r="2.8" fill="#0d0d0f" />

        {/* Wings & Fins */}
         <path 
          d="M 45,55 L 36,44 C 40,46 43,50 45,55 Z" 
          fill={gold} 
        />
        <path 
          d="M 47,65 L 40,78 C 42,73 45,69 47,65 Z" 
          fill={gold} 
        />
      </g>

      {/* 3. Stylized Letter "E" Block */}
      <path 
        d="M 90,36 L 105,36 L 105,42 L 96,42 L 96,50 L 102,50 L 102,56 L 96,56 L 96,65 L 105,65 L 105,71 L 90,71 Z" 
        fill={gold} 
      />

      {/* 4. Text component for variant="full" */}
      {variant === 'full' && (
        <g>
          <text 
            x="115" 
            y="49" 
            fill={gold} 
            fontFamily="Inter, system-ui, sans-serif" 
            fontWeight="900" 
            fontSize="12" 
            letterSpacing="0.08em"
          >
            CELL
          </text>
          <text 
            x="115" 
            y="69" 
            fill={gold} 
            fontFamily="Inter, system-ui, sans-serif" 
            fontWeight="900" 
            fontSize="12" 
            letterSpacing="0.08em"
          >
            GHRCEM
          </text>
        </g>
      )}
    </svg>
  );
};

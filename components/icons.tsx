import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function MotorcycleIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Wheels */}
      <circle cx="5.5" cy="16.5" r="3" />
      <circle cx="18.5" cy="16.5" r="3" />
      {/* Front fork & handlebars */}
      <path d="M18.5 16.5L16 8.5M16 8.5L14 5.5M16 8.5h-2.5" />
      {/* Main frame / Engine chassis */}
      <path d="M5.5 16.5h3.5l3-5.5h4L18.5 16.5" />
      {/* Seat / Fuel tank */}
      <path d="M6 13.5c1.5-2 4-2.5 6-1.5M7.5 11h3.5" />
    </svg>
  );
}

export function CarIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Sleek Coupe Outline */}
      <path d="M2 15h3.5a2.5 2.5 0 0 1 4 0h5a2.5 2.5 0 0 1 4 0H22v-2.5c0-1.2-.8-2.2-2-2.5l-3.5-1.5-3.5-2.5H8L5 8.5c-1 .5-1.8 1.5-1.8 2.8V15z" />
      {/* Wheels */}
      <circle cx="7.5" cy="15" r="2" />
      <circle cx="16.5" cy="15" r="2" />
      {/* Sleek Windows */}
      <path d="M8.5 7h4l2 2.5H6.5L8.5 7z" />
    </svg>
  );
}

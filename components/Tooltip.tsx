/**
 * Tooltip Component
 */

import { useState, ReactNode, KeyboardEvent } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClass = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }[position];

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsVisible(!isVisible);
          }
        }}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute ${positionClass} bg-gray-800 text-white text-sm px-3 py-2 rounded whitespace-nowrap pointer-events-none z-10`}
          role="tooltip"
        >
          {text}
        </div>
      )}
    </div>
  );
}

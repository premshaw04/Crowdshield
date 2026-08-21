'use client';

import React from 'react';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onValueChange: (value: number) => void;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ value, onValueChange, min = 0, max = 100, className = '', ...props }, ref) => {
    
    const percentage = ((value - Number(min)) / (Number(max) - Number(min))) * 100;

    return (
      <div className={`relative w-full h-1.5 bg-muted rounded-full ${className}`}>
        <div 
          className="absolute h-full bg-primary rounded-full" 
          style={{ width: `${percentage}%` }}
        />
        <input 
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          ref={ref}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        {/* Custom Thumb */}
        <div 
          className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full top-1/2 -translate-y-1/2 shadow-md pointer-events-none transition-transform"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

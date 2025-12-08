import React from 'react';
import { Button } from "@/components/ui/button";

/**
 * Touch-optimized button with larger touch targets for mobile
 */
export function TouchButton({ children, className = '', ...props }) {
  return (
    <Button
      {...props}
      className={`min-h-[44px] min-w-[44px] ${className}`}
    >
      {children}
    </Button>
  );
}

/**
 * Touch-optimized icon button
 */
export function TouchIconButton({ children, className = '', ...props }) {
  return (
    <Button
      {...props}
      size="icon"
      className={`h-11 w-11 ${className}`}
    >
      {children}
    </Button>
  );
}

/**
 * Touch-optimized checkbox with larger click area
 */
export function TouchCheckbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 py-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 rounded border-gray-300"
      />
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

/**
 * Touch-optimized select with larger tap area
 */
export function TouchSelect({ children, className = '', ...props }) {
  return (
    <select
      {...props}
      className={`min-h-[44px] px-3 rounded-md border ${className}`}
    >
      {children}
    </select>
  );
}
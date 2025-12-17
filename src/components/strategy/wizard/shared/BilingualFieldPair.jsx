import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Standard Bilingual Field Pair for wizard steps
 * Provides EN/AR input fields with completion indicators
 */
export function BilingualInput({
  labelEn = 'English',
  labelAr = 'Arabic',
  valueEn = '',
  valueAr = '',
  onChangeEn,
  onChangeAr,
  placeholderEn = '',
  placeholderAr = '',
  isReadOnly = false,
  required = false,
  showLabels = true,
  className
}) {
  const isEnFilled = valueEn && valueEn.trim().length > 0;
  const isArFilled = valueAr && valueAr.trim().length > 0;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {/* English Field */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label className="flex items-center gap-2">
            {labelEn}
            {required && <span className="text-destructive">*</span>}
            {isEnFilled && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
          </Label>
        )}
        <Input
          value={valueEn}
          onChange={(e) => onChangeEn?.(e.target.value)}
          placeholder={placeholderEn}
          disabled={isReadOnly}
          dir="ltr"
          className={cn(
            "transition-all",
            isEnFilled && "border-green-500/50 focus:border-green-500"
          )}
        />
      </div>

      {/* Arabic Field */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label className="flex items-center gap-2">
            {labelAr}
            {isArFilled && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
          </Label>
        )}
        <Input
          value={valueAr}
          onChange={(e) => onChangeAr?.(e.target.value)}
          placeholder={placeholderAr}
          disabled={isReadOnly}
          dir="rtl"
          className={cn(
            "transition-all",
            isArFilled && "border-green-500/50 focus:border-green-500"
          )}
        />
      </div>
    </div>
  );
}

/**
 * Bilingual Textarea Pair
 */
export function BilingualTextarea({
  labelEn = 'English',
  labelAr = 'Arabic',
  valueEn = '',
  valueAr = '',
  onChangeEn,
  onChangeAr,
  placeholderEn = '',
  placeholderAr = '',
  isReadOnly = false,
  required = false,
  showLabels = true,
  rows = 3,
  className
}) {
  const isEnFilled = valueEn && valueEn.trim().length > 0;
  const isArFilled = valueAr && valueAr.trim().length > 0;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {/* English Field */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label className="flex items-center gap-2">
            {labelEn}
            {required && <span className="text-destructive">*</span>}
            {isEnFilled && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
          </Label>
        )}
        <Textarea
          value={valueEn}
          onChange={(e) => onChangeEn?.(e.target.value)}
          placeholder={placeholderEn}
          disabled={isReadOnly}
          dir="ltr"
          rows={rows}
          className={cn(
            "transition-all resize-none",
            isEnFilled && "border-green-500/50 focus:border-green-500"
          )}
        />
      </div>

      {/* Arabic Field */}
      <div className="space-y-1.5">
        {showLabels && (
          <Label className="flex items-center gap-2">
            {labelAr}
            {isArFilled && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
          </Label>
        )}
        <Textarea
          value={valueAr}
          onChange={(e) => onChangeAr?.(e.target.value)}
          placeholder={placeholderAr}
          disabled={isReadOnly}
          dir="rtl"
          rows={rows}
          className={cn(
            "transition-all resize-none",
            isArFilled && "border-green-500/50 focus:border-green-500"
          )}
        />
      </div>
    </div>
  );
}

/**
 * Single field with completion indicator
 */
export function CompletionInput({
  label,
  value = '',
  onChange,
  placeholder = '',
  isReadOnly = false,
  required = false,
  type = 'text',
  dir = 'ltr',
  className
}) {
  const isFilled = value && String(value).trim().length > 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label className="flex items-center gap-2">
          {label}
          {required && <span className="text-destructive">*</span>}
          {isFilled && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
        </Label>
      )}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={isReadOnly}
        dir={dir}
        className={cn(
          "transition-all",
          isFilled && "border-green-500/50 focus:border-green-500"
        )}
      />
    </div>
  );
}

export default BilingualInput;

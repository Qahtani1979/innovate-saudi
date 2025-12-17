import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Standard Validation Alerts for wizard steps
 * Displays errors, warnings, and info messages consistently
 */

const ALERT_CONFIG = {
  error: {
    icon: AlertCircle,
    variant: 'destructive',
    className: 'border-destructive/50 bg-destructive/10',
  },
  warning: {
    icon: AlertTriangle,
    variant: 'default',
    className: 'border-amber-500/50 bg-amber-500/10',
  },
  info: {
    icon: Info,
    variant: 'default',
    className: 'border-blue-500/50 bg-blue-500/10',
  },
  success: {
    icon: CheckCircle2,
    variant: 'default',
    className: 'border-green-500/50 bg-green-500/10',
  },
};

export function ValidationAlert({ 
  type = 'info', 
  title, 
  message, 
  language = 'en',
  className 
}) {
  const config = ALERT_CONFIG[type] || ALERT_CONFIG.info;
  const Icon = config.icon;

  // Handle bilingual messages
  const displayMessage = typeof message === 'object' 
    ? message[language] || message.en || message.ar 
    : message;

  const displayTitle = typeof title === 'object'
    ? title[language] || title.en || title.ar
    : title;

  return (
    <Alert 
      variant={type === 'error' ? 'destructive' : 'default'} 
      className={cn(config.className, className)}
    >
      <Icon className="h-4 w-4" />
      {displayTitle && <AlertTitle>{displayTitle}</AlertTitle>}
      <AlertDescription>{displayMessage}</AlertDescription>
    </Alert>
  );
}

/**
 * Multiple alerts container
 */
export function ValidationAlerts({ 
  alerts = [], 
  language = 'en',
  maxVisible = 5,
  className 
}) {
  if (!alerts || alerts.length === 0) return null;

  const visibleAlerts = alerts.slice(0, maxVisible);
  const hiddenCount = alerts.length - maxVisible;

  return (
    <div className={cn("space-y-2", className)}>
      {visibleAlerts.map((alert, idx) => (
        <ValidationAlert
          key={idx}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          language={language}
        />
      ))}
      {hiddenCount > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {language === 'ar' 
            ? `+${hiddenCount} تنبيهات أخرى`
            : `+${hiddenCount} more alerts`}
        </p>
      )}
    </div>
  );
}

/**
 * Generate standard validation alerts from checks
 */
export function generateValidationAlerts(checks, language = 'en') {
  const alerts = [];

  // Check for critical errors
  if (checks.criticalMissing?.length > 0) {
    checks.criticalMissing.forEach(field => {
      alerts.push({
        type: 'error',
        message: {
          en: `Required: ${field}`,
          ar: `مطلوب: ${field}`
        }
      });
    });
  }

  // Check for warnings
  if (checks.warnings?.length > 0) {
    checks.warnings.forEach(warning => {
      alerts.push({
        type: 'warning',
        message: warning
      });
    });
  }

  // Check for info
  if (checks.recommendations?.length > 0) {
    checks.recommendations.forEach(rec => {
      alerts.push({
        type: 'info',
        message: rec
      });
    });
  }

  return alerts;
}

/**
 * Inline validation message
 */
export function InlineValidation({ 
  type = 'error', 
  message,
  show = true,
  className 
}) {
  if (!show || !message) return null;

  const colors = {
    error: 'text-destructive',
    warning: 'text-amber-600',
    info: 'text-blue-600',
    success: 'text-green-600',
  };

  return (
    <p className={cn("text-xs mt-1", colors[type], className)}>
      {message}
    </p>
  );
}

export default ValidationAlerts;

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  X, 
  ChevronDown, 
  ChevronUp,
  Lightbulb 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '../../../LanguageContext';

/**
 * StepAlerts - Consolidated alerts component for wizard steps
 * Combines validation alerts, info messages, warnings, and success notifications
 * 
 * Alert Types:
 * - error: Critical issues that must be fixed
 * - warning: Important issues that should be addressed
 * - info: Informational messages
 * - success: Confirmation of completed actions
 * - tip: AI recommendations or suggestions
 */

const ALERT_CONFIG = {
  error: {
    icon: AlertCircle,
    variant: 'destructive',
    className: 'border-destructive/50 bg-destructive/10 text-destructive',
    iconColor: 'text-destructive'
  },
  warning: {
    icon: AlertTriangle,
    variant: 'default',
    className: 'border-amber-500/50 bg-amber-500/10',
    iconColor: 'text-amber-500'
  },
  info: {
    icon: Info,
    variant: 'default',
    className: 'border-blue-500/50 bg-blue-500/10',
    iconColor: 'text-blue-500'
  },
  success: {
    icon: CheckCircle2,
    variant: 'default',
    className: 'border-green-500/50 bg-green-500/10',
    iconColor: 'text-green-500'
  },
  tip: {
    icon: Lightbulb,
    variant: 'default',
    className: 'border-purple-500/50 bg-purple-500/10',
    iconColor: 'text-purple-500'
  }
};

/**
 * Single Alert Component
 */
export function StepAlert({ 
  type = 'info', 
  title, 
  message, 
  action,
  onDismiss,
  className 
}) {
  const { t } = useLanguage();
  const config = ALERT_CONFIG[type] || ALERT_CONFIG.info;
  const Icon = config.icon;

  return (
    <Alert 
      variant={type === 'error' ? 'destructive' : 'default'} 
      className={cn(config.className, 'relative', className)}
    >
      <Icon className={cn('h-4 w-4', config.iconColor)} />
      {title && <AlertTitle>{t(title)}</AlertTitle>}
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="flex-1">{t(message)}</span>
        <div className="flex items-center gap-2 shrink-0">
          {action && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={action.onClick}
              className="h-7 text-xs"
            >
              {t(action.label)}
            </Button>
          )}
          {onDismiss && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onDismiss}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * StepAlerts - Multiple alerts container with collapse functionality
 */
export function StepAlerts({ 
  alerts = [], 
  maxVisible = 3,
  collapsible = true,
  showCount = true,
  className 
}) {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [dismissedIds, setDismissedIds] = React.useState(new Set());

  // Filter out dismissed alerts
  const activeAlerts = alerts.filter((_, idx) => !dismissedIds.has(idx));
  
  if (!activeAlerts || activeAlerts.length === 0) return null;

  // Sort by priority: error > warning > info > success > tip
  const priorityOrder = { error: 0, warning: 1, info: 2, success: 3, tip: 4 };
  const sortedAlerts = [...activeAlerts].sort(
    (a, b) => (priorityOrder[a.type] || 5) - (priorityOrder[b.type] || 5)
  );

  const visibleAlerts = isExpanded 
    ? sortedAlerts 
    : sortedAlerts.slice(0, maxVisible);
  const hiddenCount = sortedAlerts.length - maxVisible;
  const hasMore = hiddenCount > 0 && collapsible;

  const handleDismiss = (idx) => {
    setDismissedIds(prev => new Set([...prev, idx]));
  };

  // Count by type
  const counts = activeAlerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={cn("space-y-2", className)}>
      {/* Optional summary bar */}
      {showCount && activeAlerts.length > 1 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          {counts.error > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3 w-3" />
              {counts.error} {language === 'ar' ? 'أخطاء' : 'errors'}
            </span>
          )}
          {counts.warning > 0 && (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle className="h-3 w-3" />
              {counts.warning} {language === 'ar' ? 'تحذيرات' : 'warnings'}
            </span>
          )}
          {counts.info > 0 && (
            <span className="flex items-center gap-1 text-blue-500">
              <Info className="h-3 w-3" />
              {counts.info} {language === 'ar' ? 'معلومات' : 'info'}
            </span>
          )}
        </div>
      )}

      {/* Alert list */}
      {visibleAlerts.map((alert, idx) => (
        <StepAlert
          key={alert.id || idx}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          action={alert.action}
          onDismiss={alert.dismissible ? () => handleDismiss(idx) : undefined}
        />
      ))}

      {/* Show more/less toggle */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              {language === 'ar' ? 'إظهار أقل' : 'Show less'}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              {language === 'ar' 
                ? `إظهار ${hiddenCount} تنبيهات أخرى`
                : `Show ${hiddenCount} more alerts`}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * Helper to generate alerts from validation checks
 */
export function generateStepAlerts(checks, language = 'en') {
  const alerts = [];

  // Critical errors
  if (checks.errors?.length > 0) {
    checks.errors.forEach((error, idx) => {
      alerts.push({
        id: `error-${idx}`,
        type: 'error',
        message: error,
        dismissible: false
      });
    });
  }

  // Warnings
  if (checks.warnings?.length > 0) {
    checks.warnings.forEach((warning, idx) => {
      alerts.push({
        id: `warning-${idx}`,
        type: 'warning',
        message: warning,
        dismissible: true
      });
    });
  }

  // Info/recommendations
  if (checks.info?.length > 0) {
    checks.info.forEach((info, idx) => {
      alerts.push({
        id: `info-${idx}`,
        type: 'info',
        message: info,
        dismissible: true
      });
    });
  }

  // AI tips
  if (checks.tips?.length > 0) {
    checks.tips.forEach((tip, idx) => {
      alerts.push({
        id: `tip-${idx}`,
        type: 'tip',
        message: tip,
        dismissible: true
      });
    });
  }

  return alerts;
}

export default StepAlerts;

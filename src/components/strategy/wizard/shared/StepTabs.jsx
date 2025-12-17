import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from '../../../LanguageContext';

/**
 * StepTabs - Standardized tab navigation for wizard steps
 * 
 * Used by multi-tab steps like:
 * - Step 15 Governance (3 tabs)
 * - Step 16 Communication (4 tabs)
 * - Step 17 Evaluation (3 tabs)
 * - Step 18 Review (2 tabs)
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Tab configuration array
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.onTabChange - Tab change callback
 * @param {string} props.variant - 'default' | 'underline' | 'pills'
 * @param {string} props.className - Additional classes
 */

export function StepTabs({
  tabs = [],
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'default',
  fullWidth = true,
  className,
  children
}) {
  const { t, language } = useLanguage();

  const variantStyles = {
    default: {
      list: 'bg-muted/50 p-1 rounded-lg',
      trigger: 'data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md'
    },
    underline: {
      list: 'border-b bg-transparent p-0 rounded-none',
      trigger: 'border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-3'
    },
    pills: {
      list: 'bg-transparent gap-2 p-0',
      trigger: 'border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary rounded-full px-4'
    }
  };

  const sizeStyles = {
    sm: 'h-8 text-xs',
    default: 'h-9 text-sm',
    lg: 'h-10 text-base'
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange}
      className={cn('w-full', className)}
    >
      <TabsList className={cn(
        styles.list,
        fullWidth && 'w-full grid',
        fullWidth && `grid-cols-${tabs.length}`
      )} style={fullWidth ? { gridTemplateColumns: `repeat(${tabs.length}, 1fr)` } : undefined}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const label = typeof tab.label === 'object' 
            ? t(tab.label) 
            : tab.label;
          
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className={cn(
                styles.trigger,
                sizeStyles[size],
                'gap-2 transition-all',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <Badge 
                  variant={tab.badgeVariant || 'secondary'} 
                  className="ml-1 h-5 min-w-5 text-xs px-1.5"
                >
                  {tab.badge}
                </Badge>
              )}
              {tab.status === 'complete' && (
                <span className="h-2 w-2 rounded-full bg-green-500" />
              )}
              {tab.status === 'warning' && (
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              )}
              {tab.status === 'error' && (
                <span className="h-2 w-2 rounded-full bg-destructive" />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
      
      {/* Render tab content if children provided */}
      {children}
    </Tabs>
  );
}

/**
 * StepTabContent - Wrapper for tab content with consistent styling
 */
export function StepTabContent({
  value,
  className,
  children
}) {
  return (
    <TabsContent 
      value={value} 
      className={cn('mt-4 focus-visible:outline-none focus-visible:ring-0', className)}
    >
      {children}
    </TabsContent>
  );
}

/**
 * Helper to create tab configuration
 */
export function createTabConfig(tabs, language = 'en') {
  return tabs.map(tab => ({
    id: tab.id,
    label: {
      en: tab.labelEn,
      ar: tab.labelAr
    },
    icon: tab.icon,
    badge: tab.badge,
    badgeVariant: tab.badgeVariant,
    status: tab.status,
    disabled: tab.disabled
  }));
}

export default StepTabs;

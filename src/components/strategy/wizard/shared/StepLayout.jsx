import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../../../LanguageContext';

// Import existing shared components
import { StepDashboardHeader } from './StepDashboardHeader';
import { MainAIGeneratorCard } from './MainAIGeneratorCard';
import { StepAlerts } from './StepAlerts';
import { StepTabs, StepTabContent } from './StepTabs';
import { ViewModeToggle } from './ViewModeToggle';
import { AIActionButton } from './AIActionButton';

/**
 * StepLayout - Master layout component for wizard steps
 * 
 * Provides consistent structure across all 18 wizard steps including:
 * - Dashboard header with score and stats
 * - Main AI generator (card or button variant)
 * - View mode toggle
 * - Add One AI button
 * - Validation alerts
 * - Tab navigation
 * 
 * @example
 * <StepLayout
 *   dashboardConfig={{
 *     score: 75,
 *     title: { en: 'KPIs', ar: 'المؤشرات' },
 *     stats: [{ icon: Target, value: 5, label: 'KPIs' }]
 *   }}
 *   mainAI={{
 *     enabled: true,
 *     onGenerate: handleGenerate,
 *     isGenerating: loading
 *   }}
 *   viewMode={{
 *     enabled: true,
 *     mode: 'cards',
 *     onModeChange: setMode
 *   }}
 * >
 *   {content}
 * </StepLayout>
 */
export function StepLayout({
  // Dashboard Header Configuration
  dashboardConfig,
  
  // Main AI Generator Configuration
  mainAI = { enabled: false },
  
  // Add One AI Button Configuration  
  addOneAI = { enabled: false },
  
  // View Mode Toggle Configuration
  viewMode = { enabled: false },
  
  // Tabs Configuration
  tabs = { enabled: false },
  
  // Alerts Configuration
  alerts = [],
  
  // Common props
  isReadOnly = false,
  className,
  
  // Content
  children,
  
  // Header slot for custom content
  headerSlot,
  
  // Actions slot (appears after view mode toggle)
  actionsSlot
}) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className={cn(
      'space-y-6 w-full',
      isRTL && 'rtl',
      className
    )}>
      {/* Dashboard Header */}
      {dashboardConfig && (
        <StepDashboardHeader
          score={dashboardConfig.score}
          title={dashboardConfig.title}
          subtitle={dashboardConfig.subtitle}
          stats={dashboardConfig.stats || []}
          language={language}
          className={dashboardConfig.className}
        />
      )}

      {/* Custom header slot */}
      {headerSlot}

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <StepAlerts
          alerts={alerts}
          maxVisible={3}
          collapsible={true}
        />
      )}

      {/* Main AI Generator */}
      {mainAI.enabled && !isReadOnly && (
        <MainAIGeneratorCard
          variant={mainAI.variant || 'card'}
          title={mainAI.title}
          description={mainAI.description}
          icon={mainAI.icon}
          onGenerate={mainAI.onGenerate}
          isGenerating={mainAI.isGenerating}
          isReadOnly={isReadOnly}
          disabled={mainAI.disabled}
          buttonLabel={mainAI.buttonLabel}
          className={mainAI.className}
        >
          {mainAI.children}
        </MainAIGeneratorCard>
      )}

      {/* View Mode + Add One + Actions Row */}
      {(viewMode.enabled || addOneAI.enabled || actionsSlot) && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left side: View Mode Toggle */}
          <div className="flex items-center gap-3">
            {viewMode.enabled && (
              <ViewModeToggle
                value={viewMode.mode}
                onChange={viewMode.onModeChange}
                options={viewMode.options || ['cards', 'list', 'summary']}
                language={language}
              />
            )}
          </div>

          {/* Right side: Add One AI + Custom Actions */}
          <div className="flex items-center gap-2">
            {actionsSlot}
            
            {addOneAI.enabled && !isReadOnly && (
              <AIActionButton
                variant={addOneAI.variant || 'suggest'}
                size={addOneAI.size || 'sm'}
                label={addOneAI.label}
                onGenerate={addOneAI.onGenerate}
                isGenerating={addOneAI.isGenerating}
                isReadOnly={isReadOnly}
                disabled={addOneAI.disabled}
                context={addOneAI.context}
                className={addOneAI.className}
              />
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {tabs.enabled && (
        <StepTabs
          tabs={tabs.items || []}
          activeTab={tabs.activeTab}
          onTabChange={tabs.onTabChange}
          variant={tabs.variant}
          size={tabs.size}
          fullWidth={tabs.fullWidth !== false}
          className={tabs.className}
        >
          {tabs.children}
        </StepTabs>
      )}

      {/* Main Content */}
      <div className="step-layout-content">
        {children}
      </div>
    </div>
  );
}

/**
 * StepSection - Section wrapper within a step for consistent spacing
 */
export function StepSection({
  title,
  subtitle,
  actions,
  className,
  children
}) {
  const { t } = useLanguage();

  return (
    <div className={cn('space-y-4', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="font-semibold text-base">
                {t(title)}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {t(subtitle)}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * StepGrid - Grid wrapper for card layouts
 */
export function StepGrid({
  columns = 2,
  gap = 4,
  className,
  children
}) {
  return (
    <div 
      className={cn(
        'grid gap-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        className
      )}
      style={{ gap: `${gap * 0.25}rem` }}
    >
      {children}
    </div>
  );
}

/**
 * StepEmptyState - Empty state for when no items exist
 */
export function StepEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}) {
  const { t } = useLanguage();

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      'border-2 border-dashed rounded-lg bg-muted/20',
      className
    )}>
      {Icon && (
        <div className="p-3 rounded-full bg-muted mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      {title && (
        <h4 className="font-medium text-base mb-1">
          {t(title)}
        </h4>
      )}
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {t(description)}
        </p>
      )}
      {action}
    </div>
  );
}

// Re-export tab content for convenience
export { StepTabContent };

export default StepLayout;

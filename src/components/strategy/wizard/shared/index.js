// Shared Wizard Components - Standard components for all wizard steps

// Dashboard Header
export { StepDashboardHeader, CompactScoreBadge } from './StepDashboardHeader';

// View Mode Toggle
export { ViewModeToggle } from './ViewModeToggle';

// Collapsible Cards
export { CollapsibleItemCard, SimpleItemCard } from './CollapsibleItemCard';

// Bilingual Fields
export { BilingualInput, BilingualTextarea, CompletionInput } from './BilingualFieldPair';

// Validation Alerts (legacy - use StepAlerts for new code)
export { 
  ValidationAlert, 
  ValidationAlerts, 
  InlineValidation,
  generateValidationAlerts 
} from './ValidationAlerts';

// Step Alerts (new consolidated alerts)
export {
  StepAlert,
  StepAlerts,
  generateStepAlerts
} from './StepAlerts';

// Empty States
export { EmptyState, InlineEmptyState, SectionEmptyState } from './EmptyState';

// Summary Tab Components
export {
  DistributionChart,
  QualityMetrics,
  RecommendationsCard,
  StatsGrid,
  CompletionGrid,
  TrendIndicator,
} from './SummaryTab';

// Navigation Components
export { WizardNavigation, CompactStepIndicator } from './WizardNavigation';

// AI Action Components
export { AIActionButton, AIActionGroup, AIGenerateCard } from './AIActionButton';

// Main AI Generator Card (new)
export { MainAIGeneratorCard } from './MainAIGeneratorCard';

// Analysis Components (SWOT/PESTEL)
export { AnalysisCard, AnalysisMatrix } from './AnalysisCard';

// Metric Components (KPIs/Risks/Milestones)
export { MetricCard, MetricList } from './MetricCard';

// Step Tabs (new)
export { StepTabs, StepTabContent, createTabConfig } from './StepTabs';

// Step Layout (new master component)
export { 
  StepLayout, 
  StepSection, 
  StepGrid, 
  StepEmptyState 
} from './StepLayout';

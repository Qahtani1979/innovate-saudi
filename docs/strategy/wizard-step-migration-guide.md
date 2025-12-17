# Wizard Step Standardization - Complete Migration Guide

## Executive Summary

This document provides a detailed migration plan for standardizing all 18 wizard steps to use the new shared component library. The goal is to achieve consistent UI patterns, reduce code duplication, and improve maintainability across the Strategy Wizard.

---

## Phase 1: Core Components (✅ COMPLETED)

### Components Created

| Component | File | Purpose |
|-----------|------|---------|
| `StepLayout` | `shared/StepLayout.jsx` | Master layout container |
| `MainAIGeneratorCard` | `shared/MainAIGeneratorCard.jsx` | Main AI generation (4 variants) |
| `StepAlerts` | `shared/StepAlerts.jsx` | Consolidated alerts (5 types) |
| `StepTabs` | `shared/StepTabs.jsx` | Tab navigation (3 variants) |
| `StepSection` | `shared/StepLayout.jsx` | Section with title + actions |
| `StepGrid` | `shared/StepLayout.jsx` | Responsive grid layout |
| `StepEmptyState` | `shared/StepLayout.jsx` | Empty state placeholder |

### Existing Components (Already Standardized)

| Component | File | Status |
|-----------|------|--------|
| `StepDashboardHeader` | `shared/StepDashboardHeader.jsx` | ✅ Used in all steps |
| `AIActionButton` | `shared/AIActionButton.jsx` | ✅ Integrated |
| `ViewModeToggle` | `shared/ViewModeToggle.jsx` | ✅ Available |
| `ValidationAlerts` | `shared/ValidationAlerts.jsx` | ✅ Legacy (use StepAlerts) |

---

## Phase 2: Step-by-Step Migration Analysis

### Step 1: Context (Step1Context.jsx)

**File:** `src/components/strategy/wizard/steps/Step1Context.jsx`  
**Lines:** 885  
**Complexity:** Medium  
**Migration Effort:** 2-3 hours

#### Current Implementation
- ✅ Uses `StepDashboardHeader`
- ❌ Custom AI Generator Card (lines 206-225)
- ❌ Custom Tabs implementation
- ❌ Custom collapsible sections
- ❌ No `StepLayout` wrapper

#### Components to Replace

| Current Pattern | Replace With | Lines |
|-----------------|--------------|-------|
| Custom AI Card | `MainAIGeneratorCard` variant="card" | 206-225 |
| Custom Tabs | `StepTabs` | 228-246 |
| Collapsible sections | Keep as-is (complex logic) | N/A |

#### Migration Steps

```jsx
// BEFORE (lines 206-225)
<Card className="border-primary/20">
  <CardContent className="py-4">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {t({ en: 'AI-Powered Context Generation', ar: 'إنشاء السياق بالذكاء الاصطناعي' })}
        </h4>
        ...
      </div>
      <Button onClick={onGenerateAI} disabled={isGenerating || !data.name_en}>
        ...
      </Button>
    </div>
  </CardContent>
</Card>

// AFTER
<MainAIGeneratorCard
  variant="card"
  title={{ en: 'AI-Powered Context Generation', ar: 'إنشاء السياق بالذكاء الاصطناعي' }}
  description={{ en: 'Fill in basic details and let AI suggest vision, mission, and themes', ar: 'أدخل التفاصيل الأساسية ودع الذكاء الاصطناعي يقترح الرؤية والرسالة والمحاور' }}
  onGenerate={onGenerateAI}
  isGenerating={isGenerating}
  disabled={!data.name_en}
  isReadOnly={isReadOnly}
/>
```

#### Full StepLayout Migration

```jsx
// Wrap entire step with StepLayout
<StepLayout
  dashboardConfig={{
    score: completenessMetrics.overallScore,
    title: { en: 'Strategic Context', ar: 'السياق الاستراتيجي' },
    subtitle: { en: 'Define plan identity, scope, and discovery inputs', ar: 'تحديد هوية الخطة والنطاق ومدخلات الاستكشاف' },
    stats: [
      { icon: Calendar, value: `${data.end_year - data.start_year} Yrs`, label: 'Duration' },
      { icon: Building, value: data.target_sectors?.length || 0, label: 'Sectors' },
      { icon: Users, value: data.quick_stakeholders?.length || 0, label: 'Stakeholders' },
      { icon: Cpu, value: data.focus_technologies?.length || 0, label: 'Technologies' }
    ]
  }}
  mainAI={{
    enabled: true,
    variant: 'card',
    title: { en: 'AI-Powered Context Generation', ar: 'إنشاء السياق بالذكاء الاصطناعي' },
    onGenerate: onGenerateAI,
    isGenerating: isGenerating,
    disabled: !data.name_en
  }}
  tabs={{
    enabled: true,
    items: [
      { id: 'identity', label: { en: 'Identity', ar: 'الهوية' }, icon: Target },
      { id: 'scope', label: { en: 'Scope', ar: 'النطاق' }, icon: MapPin },
      { id: 'discovery', label: { en: 'Discovery', ar: 'الاستكشاف' }, icon: Lightbulb },
      { id: 'summary', label: { en: 'Summary', ar: 'ملخص' }, icon: CheckCircle2 }
    ],
    activeTab,
    onTabChange: setActiveTab
  }}
  isReadOnly={isReadOnly}
>
  {/* Tab content remains the same */}
</StepLayout>
```

---

### Step 2: SWOT Analysis (Step2SWOT.jsx)

**File:** `src/components/strategy/wizard/steps/Step2SWOT.jsx`  
**Lines:** 667  
**Complexity:** Medium  
**Migration Effort:** 2 hours

#### Current Implementation
- ✅ Uses `StepDashboardHeader`
- ✅ Uses `AIActionButton`
- ❌ Custom Tabs implementation
- ❌ No `StepLayout` wrapper
- ❌ Custom quadrant components (keep as-is)

#### Components to Replace

| Current Pattern | Replace With | Lines |
|-----------------|--------------|-------|
| AI Generate Button | `MainAIGeneratorCard` variant="button" | 376-385 |
| Tabs | `StepTabs` | 388-406 |

#### Migration Steps

```jsx
// BEFORE (lines 376-385)
{!isReadOnly && (
  <div className="flex justify-end">
    <AIActionButton
      type="generate"
      label={t({ en: 'Generate SWOT', ar: 'إنشاء SWOT' })}
      onAction={onGenerateAI}
      isLoading={isGenerating}
    />
  </div>
)}

// AFTER - Integrated into StepLayout
<StepLayout
  mainAI={{
    enabled: true,
    variant: 'button',
    buttonLabel: { en: 'Generate SWOT', ar: 'إنشاء SWOT' },
    onGenerate: onGenerateAI,
    isGenerating: isGenerating
  }}
  viewMode={{
    enabled: true,
    mode: activeTab,
    onModeChange: setActiveTab,
    options: ['matrix', 'list', 'strategies', 'summary']
  }}
>
```

---

### Step 3: Stakeholders (Step3Stakeholders.jsx)

**File:** `src/components/strategy/wizard/steps/Step3Stakeholders.jsx`  
**Lines:** 720  
**Complexity:** Medium  
**Migration Effort:** 2 hours

#### Current Implementation
- ✅ Uses `StepDashboardHeader`
- ✅ Uses `AIActionButton`
- ❌ Custom Tabs implementation
- ❌ No `StepLayout` wrapper

#### Migration Config

```jsx
<StepLayout
  dashboardConfig={{
    score: completenessMetrics.score,
    title: { en: 'Stakeholder Analysis', ar: 'تحليل أصحاب المصلحة' },
    stats: [
      { icon: Users, value: total, label: 'Total' },
      { icon: AlertCircle, value: manageClosely, label: 'Manage Closely' },
      { icon: UserCheck, value: keepSatisfied, label: 'Keep Satisfied' },
      { icon: MessageSquare, value: keepInformed, label: 'Keep Informed' }
    ]
  }}
  mainAI={{
    enabled: true,
    variant: 'button',
    buttonLabel: { en: 'Suggest Stakeholders', ar: 'اقتراح أصحاب المصلحة' },
    onGenerate: onGenerateAI,
    isGenerating: isGenerating
  }}
  addOneAI={{
    enabled: true,
    label: { en: 'Add Stakeholder', ar: 'إضافة صاحب مصلحة' },
    onGenerate: addStakeholder
  }}
  tabs={{
    enabled: true,
    items: [
      { id: 'list', label: { en: 'List', ar: 'القائمة' }, icon: Users, badge: total },
      { id: 'matrix', label: { en: 'Matrix', ar: 'المصفوفة' }, icon: Grid3X3 },
      { id: 'engagement', label: { en: 'Plan', ar: 'الخطة' }, icon: FileText },
      { id: 'summary', label: { en: 'Summary', ar: 'ملخص' }, icon: BarChart3 }
    ],
    activeTab,
    onTabChange: setActiveTab
  }}
>
```

---

### Step 4: PESTEL (Step4PESTEL.jsx)

**File:** `src/components/strategy/wizard/steps/Step4PESTEL.jsx`  
**Lines:** 831  
**Complexity:** Medium  
**Migration Effort:** 2 hours

#### Current Implementation
- ✅ Uses `StepDashboardHeader`
- ✅ Uses `AIActionButton`
- ❌ Custom Tabs implementation
- ❌ Custom category collapsibles (keep as-is)

#### Migration Config

```jsx
<StepLayout
  dashboardConfig={{
    score: completenessScore,
    title: { en: 'PESTEL Analysis', ar: 'تحليل PESTEL' },
    stats: [
      { icon: Globe, value: stats.total, label: 'Total Factors' },
      { icon: AlertTriangle, value: stats.highImpact, label: 'High Impact' },
      { icon: TrendingUp, value: stats.growing, label: 'Growing Trends' },
      { icon: Clock, value: stats.shortTerm, label: 'Short-term' }
    ]
  }}
  mainAI={{
    enabled: true,
    variant: 'button',
    buttonLabel: { en: 'Generate PESTEL', ar: 'إنشاء تحليل PESTEL' },
    onGenerate: onGenerateAI,
    isGenerating: isGenerating
  }}
  tabs={{
    enabled: true,
    items: [
      { id: 'factors', label: { en: 'Factors', ar: 'العوامل' }, icon: ListChecks },
      { id: 'overview', label: { en: 'Overview', ar: 'نظرة عامة' }, icon: PieChart },
      { id: 'impact', label: { en: 'Impact', ar: 'التأثير' }, icon: BarChart3 },
      { id: 'summary', label: { en: 'Summary', ar: 'ملخص' }, icon: Target }
    ],
    activeTab,
    onTabChange: setActiveTab
  }}
>
```

---

### Step 5: KPIs (Step5KPIs.jsx)

**File:** `src/components/strategy/wizard/steps/Step5KPIs.jsx`  
**Lines:** 1094  
**Complexity:** High  
**Migration Effort:** 3 hours

#### Current Implementation
- ✅ Uses `StepDashboardHeader`
- ✅ Uses `AIActionButton`
- ❌ Custom view mode toggle
- ❌ Complex KPI cards with SMART scoring (keep as-is)

#### Migration Config

```jsx
<StepLayout
  dashboardConfig={{
    score: overallCompleteness,
    title: { en: 'Performance Indicators', ar: 'مؤشرات الأداء' },
    stats: [
      { icon: Target, value: stats.total, label: 'Total KPIs' },
      { icon: Gauge, value: `${stats.avgSMARTScore}%`, label: 'SMART Score' },
      { icon: CheckCircle2, value: stats.objectivesWithKPIs, label: 'Objectives Covered' },
      { icon: BarChart3, value: `${stats.balanceRatio}%`, label: 'Leading Ratio' }
    ]
  }}
  mainAI={{
    enabled: true,
    variant: 'card',
    title: { en: 'Generate KPIs', ar: 'توليد المؤشرات' },
    description: { en: 'AI will suggest SMART KPIs for your objectives', ar: 'سيقترح الذكاء الاصطناعي مؤشرات ذكية لأهدافك' },
    onGenerate: onGenerateAI,
    isGenerating: isGenerating
  }}
  viewMode={{
    enabled: true,
    mode: viewMode,
    onModeChange: setViewMode,
    options: ['byObjective', 'byCategory', 'timeline']
  }}
  addOneAI={{
    enabled: true,
    label: { en: 'Add KPI', ar: 'إضافة مؤشر' },
    onGenerate: () => addKPI(null),
    context: 'kpi'
  }}
>
```

---

### Step 6: Action Plans (Step6ActionPlans.jsx)

**File:** `src/components/strategy/wizard/steps/Step6ActionPlans.jsx`  
**Lines:** 1200  
**Complexity:** High  
**Migration Effort:** 3 hours

#### Current Implementation
- ✅ Uses `StepDashboardHeader`
- ✅ Uses `AIActionButton`
- ❌ Custom view mode toggle
- ❌ Complex action cards with entity generation (keep as-is)

#### Migration Config

```jsx
<StepLayout
  dashboardConfig={{
    score: overallCompleteness,
    title: { en: 'Action Plans', ar: 'خطط العمل' },
    stats: [
      { icon: Layers, value: portfolioStats.total, label: 'Total Actions' },
      { icon: DollarSign, value: formatBudget(portfolioStats.totalBudget), label: 'Total Budget' },
      { icon: Lightbulb, value: `${portfolioStats.innovationScore}%`, label: 'Innovation Score' },
      { icon: Target, value: `${portfolioStats.objectiveCoverage}%`, label: 'Coverage' }
    ]
  }}
  mainAI={{
    enabled: true,
    variant: 'card',
    title: { en: 'Generate Action Plans', ar: 'توليد خطط العمل' },
    onGenerate: onGenerateAI,
    isGenerating: isGenerating
  }}
  viewMode={{
    enabled: true,
    mode: viewMode,
    onModeChange: setViewMode,
    options: ['objectives', 'types', 'timeline', 'portfolio']
  }}
  addOneAI={{
    enabled: true,
    label: { en: 'Add Action', ar: 'إضافة إجراء' },
    onGenerate: () => addActionPlan(null)
  }}
  alerts={alerts}
>
```

---

### Step 7: Risks (Step7Risks.jsx)

**File:** `src/components/strategy/wizard/steps/Step7Risks.jsx`  
**Lines:** 869  
**Complexity:** Medium  
**Migration Effort:** 2 hours

#### Migration Config

```jsx
<StepLayout
  dashboardConfig={{
    score: completenessScore,
    title: { en: 'Risk Assessment', ar: 'تقييم المخاطر' },
    stats: [
      { icon: Shield, value: stats.total, label: 'Total Risks' },
      { icon: AlertTriangle, value: stats.highRisk, label: 'High Risk' },
      { icon: TrendingDown, value: stats.mitigating, label: 'Mitigating' },
      { icon: CheckCircle2, value: stats.resolved, label: 'Resolved' }
    ]
  }}
  mainAI={{
    enabled: true,
    variant: 'card',
    onGenerate: onGenerateAI,
    isGenerating: isGenerating
  }}
  tabs={{
    enabled: true,
    items: [
      { id: 'register', label: { en: 'Register', ar: 'السجل' }, icon: ListChecks },
      { id: 'matrix', label: { en: 'Matrix', ar: 'المصفوفة' }, icon: Grid3X3 },
      { id: 'appetite', label: { en: 'Appetite', ar: 'الشهية' }, icon: Target },
      { id: 'summary', label: { en: 'Summary', ar: 'ملخص' }, icon: BarChart3 }
    ],
    activeTab,
    onTabChange: setActiveTab
  }}
>
```

---

### Step 7 Alt: Timeline (Step7Timeline.jsx)

**File:** `src/components/strategy/wizard/steps/Step7Timeline.jsx`  
**Lines:** 1145  
**Complexity:** High  
**Migration Effort:** 3 hours

#### Current Implementation
- ✅ Uses `StepDashboardHeader`
- ✅ Uses `AIActionButton`
- Complex phase/milestone visualization (keep as-is)

---

### Step 8: Dependencies (Step8Dependencies.jsx)

**File:** `src/components/strategy/wizard/steps/Step8Dependencies.jsx`  
**Lines:** ~800  
**Complexity:** Medium  
**Migration Effort:** 2 hours

---

### Step 13: Resources (Step13Resources.jsx)

**File:** `src/components/strategy/wizard/steps/Step13Resources.jsx`  
**Lines:** ~900  
**Complexity:** Medium  
**Migration Effort:** 2 hours

---

### Step 15: Governance (Step15Governance.jsx)

**File:** `src/components/strategy/wizard/steps/Step15Governance.jsx`  
**Lines:** 1235  
**Complexity:** High  
**Migration Effort:** 3-4 hours

#### Current Implementation
- ✅ Uses `StepDashboardHeader`
- ❌ Custom Tabs (3 tabs)
- ❌ Custom view mode toggle
- ❌ Complex RACI matrix (keep as-is)

#### Migration Config

```jsx
<StepLayout
  dashboardConfig={{
    score: completenessScore,
    title: { en: 'Governance', ar: 'الحوكمة' },
    stats: [
      { icon: Building2, value: committees.length, label: 'Committees' },
      { icon: UserCog, value: roles.length, label: 'Roles' },
      { icon: LayoutDashboard, value: dashboards.length, label: 'Dashboards' },
      { icon: CheckCircle2, value: raciMatrix.length, label: 'RACI Items' }
    ]
  }}
  mainAI={{
    enabled: true,
    variant: 'card',
    onGenerate: onGenerateAI,
    isGenerating: isGenerating
  }}
  tabs={{
    enabled: true,
    items: [
      { id: 'committees', label: { en: 'Committees', ar: 'اللجان' }, icon: Building2, badge: committees.length },
      { id: 'roles', label: { en: 'Roles & RACI', ar: 'الأدوار' }, icon: Users, badge: roles.length },
      { id: 'dashboards', label: { en: 'Dashboards', ar: 'لوحات التحكم' }, icon: LayoutDashboard, badge: dashboards.length }
    ],
    activeTab,
    onTabChange: setActiveTab
  }}
>
```

---

### Step 16: Communication (Step16Communication.jsx)

**File:** `src/components/strategy/wizard/steps/Step16Communication.jsx`  
**Lines:** 1142  
**Complexity:** High  
**Migration Effort:** 3-4 hours

#### Current Implementation
- ✅ Uses `StepDashboardHeader`
- ❌ Custom Tabs (4 tabs)
- ❌ Complex audience/channel cards (keep as-is)

#### Migration Config

```jsx
<StepLayout
  dashboardConfig={{
    score: completenessScore,
    title: { en: 'Communication Plan', ar: 'خطة التواصل' },
    stats: [
      { icon: Users, value: targetAudiences.length, label: 'Audiences' },
      { icon: MessageSquare, value: keyMessages.length, label: 'Messages' },
      { icon: Radio, value: internalChannels.length, label: 'Internal' },
      { icon: Globe, value: externalChannels.length, label: 'External' }
    ]
  }}
  mainAI={{
    enabled: true,
    variant: 'card',
    onGenerate: onGenerateAI,
    isGenerating: isGenerating
  }}
  tabs={{
    enabled: true,
    items: [
      { id: 'audiences', label: { en: 'Audiences', ar: 'الجمهور' }, icon: Users },
      { id: 'messages', label: { en: 'Messages', ar: 'الرسائل' }, icon: MessageSquare },
      { id: 'channels', label: { en: 'Channels', ar: 'القنوات' }, icon: Radio },
      { id: 'summary', label: { en: 'Summary', ar: 'ملخص' }, icon: BarChart3 }
    ],
    activeTab,
    onTabChange: setActiveTab
  }}
>
```

---

### Step 17: Change Management (Step17Change.jsx)

**File:** `src/components/strategy/wizard/steps/Step17Change.jsx`  
**Lines:** ~900  
**Complexity:** Medium  
**Migration Effort:** 2 hours

---

### Step 18: Review (Step18Review.jsx)

**File:** `src/components/strategy/wizard/steps/Step18Review.jsx`  
**Lines:** 1076  
**Complexity:** High  
**Migration Effort:** 3 hours

#### Current Implementation
- ✅ Uses `StepDashboardHeader`
- ❌ Custom view toggle (summary/details)
- ❌ Complex export functionality (keep as-is)
- ❌ AI Analyzer integration (keep as-is)

#### Migration Config

```jsx
<StepLayout
  dashboardConfig={{
    score: completenessMetrics.overall,
    title: { en: 'Plan Review', ar: 'مراجعة الخطة' },
    stats: [
      { icon: CheckCircle2, value: `${completenessMetrics.overall}%`, label: 'Readiness' },
      { icon: Target, value: objectives.length, label: 'Objectives' },
      { icon: Activity, value: kpis.length, label: 'KPIs' },
      { icon: Layers, value: actionPlans.length, label: 'Actions' }
    ]
  }}
  tabs={{
    enabled: true,
    items: [
      { id: 'summary', label: { en: 'Summary', ar: 'ملخص' }, icon: BarChart3 },
      { id: 'details', label: { en: 'Details', ar: 'التفاصيل' }, icon: FileText }
    ],
    activeTab: activeView,
    onTabChange: setActiveView
  }}
  actionsSlot={
    <div className="flex gap-2">
      <Button onClick={handleExport}>Export</Button>
      <Button onClick={onSubmitForApproval}>Submit</Button>
    </div>
  }
>
```

---

## Phase 3: Migration Priority Matrix

### Priority 1 - Quick Wins (Low Risk, High Impact)
| Step | Complexity | Effort | Impact |
|------|------------|--------|--------|
| Step 1 Context | Medium | 2h | High |
| Step 18 Review | High | 3h | High |

### Priority 2 - Standard Steps
| Step | Complexity | Effort | Impact |
|------|------------|--------|--------|
| Step 2 SWOT | Medium | 2h | Medium |
| Step 3 Stakeholders | Medium | 2h | Medium |
| Step 4 PESTEL | Medium | 2h | Medium |
| Step 7 Risks | Medium | 2h | Medium |

### Priority 3 - Complex Steps (Higher Risk)
| Step | Complexity | Effort | Impact |
|------|------------|--------|--------|
| Step 5 KPIs | High | 3h | Medium |
| Step 6 Action Plans | High | 3h | Medium |
| Step 7 Timeline | High | 3h | Medium |
| Step 15 Governance | High | 4h | Medium |
| Step 16 Communication | High | 4h | Medium |

---

## Phase 4: Import Patterns

### Standard Import for Migrated Steps

```jsx
import { 
  StepLayout,
  StepSection,
  StepGrid,
  StepEmptyState,
  MainAIGeneratorCard,
  StepAlerts,
  StepTabs,
  StepTabContent,
  AIActionButton,
  ViewModeToggle,
  StepDashboardHeader
} from '../shared';
```

---

## Phase 5: Testing Checklist

For each migrated step, verify:

- [ ] Dashboard header renders correctly with score and stats
- [ ] Main AI generator works (card/button variant)
- [ ] Add One AI button functions correctly
- [ ] View mode toggle switches views
- [ ] Tab navigation works
- [ ] Alerts display correctly
- [ ] RTL layout works
- [ ] Read-only mode disables interactions
- [ ] Mobile responsiveness maintained
- [ ] No console errors

---

## Phase 6: Rollback Strategy

If migration causes issues:

1. Each step can be reverted independently
2. Keep old patterns in separate files during migration
3. Use feature flags for gradual rollout
4. Monitor error logs after deployment

---

## Appendix A: Component API Reference

### StepLayout Props

```typescript
interface StepLayoutProps {
  dashboardConfig?: {
    score: number;
    title: BilingualText;
    subtitle?: BilingualText;
    stats: Array<{
      icon: LucideIcon;
      value: string | number;
      label: string;
      subValue?: string;
      iconColor?: string;
    }>;
  };
  mainAI?: {
    enabled: boolean;
    variant?: 'card' | 'button' | 'compact' | 'inline';
    title?: BilingualText;
    description?: BilingualText;
    icon?: LucideIcon;
    onGenerate: () => void;
    isGenerating?: boolean;
    disabled?: boolean;
    buttonLabel?: BilingualText;
  };
  addOneAI?: {
    enabled: boolean;
    variant?: 'suggest' | 'generate';
    label?: BilingualText;
    onGenerate: () => void;
    isGenerating?: boolean;
    context?: string;
  };
  viewMode?: {
    enabled: boolean;
    mode: string;
    onModeChange: (mode: string) => void;
    options?: string[];
  };
  tabs?: {
    enabled: boolean;
    items: Array<{
      id: string;
      label: BilingualText;
      icon?: LucideIcon;
      badge?: number;
      status?: 'complete' | 'warning' | 'error';
    }>;
    activeTab: string;
    onTabChange: (tab: string) => void;
    variant?: 'default' | 'underline' | 'pills';
  };
  alerts?: Array<{
    type: 'error' | 'warning' | 'info' | 'success' | 'tip';
    title?: BilingualText;
    message: BilingualText;
    action?: { label: BilingualText; onClick: () => void };
    dismissible?: boolean;
  }>;
  isReadOnly?: boolean;
  headerSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  children: React.ReactNode;
}
```

---

## Appendix B: Estimated Total Effort

| Phase | Steps | Total Effort |
|-------|-------|--------------|
| Priority 1 | 2 | 5 hours |
| Priority 2 | 4 | 8 hours |
| Priority 3 | 5 | 17 hours |
| **Total** | **11** | **30 hours** |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-XX | AI | Initial document |

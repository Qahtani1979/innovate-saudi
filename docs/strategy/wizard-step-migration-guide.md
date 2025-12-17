# Wizard Step Standardization - Complete Migration Guide

> **Last Updated**: December 2024  
> **Status**: Phase 1 Complete - Ready for Migration  
> **Analysis Based On**: Actual file inspection of all step components

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Phase 1: Core Components (✅ Completed)](#phase-1-core-components)
3. [Phase 2: Step-by-Step Gap Analysis](#phase-2-step-by-step-gap-analysis)
4. [Phase 3: Migration Priority Matrix](#phase-3-migration-priority-matrix)
5. [Phase 4: Implementation Patterns](#phase-4-implementation-patterns)
6. [Phase 5: Testing Checklist](#phase-5-testing-checklist)
7. [Appendix: Component API Reference](#appendix-component-api-reference)

---

## Executive Summary

### Current State Analysis (Verified)
All 18 wizard steps have been analyzed. Key findings:

| Pattern | Custom Implementation | Shared Component | Migration Status |
|---------|----------------------|------------------|------------------|
| Dashboard Header | 0 steps | 18 steps | ✅ Already standardized |
| Main AI Generator | 15 custom cards | 3 use `AIActionButton` | 🔴 High priority |
| Tab Navigation | 18 custom Tabs | 0 use `StepTabs` | 🔴 All need migration |
| Alerts/Validation | 6 custom arrays | 0 use `StepAlerts` | 🟡 Medium priority |
| View Mode Toggle | 4 custom states | 0 use shared | 🟡 Low priority |

### Steps Already Using Shared Components
| Step | `StepDashboardHeader` | `AIActionButton` |
|------|----------------------|------------------|
| Step3Stakeholders | ✅ | ✅ (line 221) |
| Step2SWOT | ✅ | ✅ (line 378) |
| Step4PESTEL | ✅ | ✅ (line 271) |
| Step13Resources | ✅ | ✅ (line 23) |

### Migration Goals
1. Replace inline AI generation cards with `MainAIGeneratorCard`
2. Standardize tab navigation with `StepTabs`
3. Consolidate alerts with `StepAlerts`
4. Wrap steps in `StepLayout` for consistency

---

## Phase 1: Core Components

### ✅ Completed Components

| Component | File | Purpose | Variants |
|-----------|------|---------|----------|
| `MainAIGeneratorCard` | `shared/MainAIGeneratorCard.jsx` | Bulk AI generation | card, button, inline, compact |
| `StepAlerts` | `shared/StepAlerts.jsx` | Validation alerts | info, warning, error, success, tip |
| `StepTabs` | `shared/StepTabs.jsx` | Tab navigation | default, underline, pills |
| `StepLayout` | `shared/StepLayout.jsx` | Master layout wrapper | - |
| `StepSection` | `shared/StepLayout.jsx` | Section wrapper | - |
| `StepGrid` | `shared/StepLayout.jsx` | Grid layout | - |
| `StepEmptyState` | `shared/StepLayout.jsx` | Empty state | - |

### Pre-existing Components (Already in Use)

| Component | File | Used By |
|-----------|------|---------|
| `StepDashboardHeader` | `shared/StepDashboardHeader.jsx` | All 18 steps ✅ |
| `AIActionButton` | `shared/AIActionButton.jsx` | 4 steps (SWOT, PESTEL, Stakeholders, Resources) |
| `ViewModeToggle` | `shared/ViewModeToggle.jsx` | Available but unused |

---

## Phase 2: Step-by-Step Gap Analysis

---

### Step 1: Context (`Step1Context.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 885 lines |
| **Complexity** | High |
| **Migration Effort** | 2 hours |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Lines 173-202 | None |
| Main AI | ❌ Inline Card | Lines 206-225 | Replace with `MainAIGeneratorCard` |
| Tabs | ❌ Raw `<Tabs>` | Lines 228-246 | Replace with `StepTabs` |
| Alerts | ❌ None | - | Add validation alerts |
| View Mode | ❌ None | - | N/A |

#### Custom AI Card Code to Replace (Lines 206-225)
```jsx
// CURRENT - Custom implementation
<Card className="border-primary/20">
  <CardContent className="py-4">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {t({ en: 'AI-Powered Context Generation', ar: '...' })}
        </h4>
        <p className="text-sm text-muted-foreground">...</p>
      </div>
      <Button onClick={onGenerateAI} disabled={isGenerating || !data.name_en}>
        {isGenerating ? <Loader2 /> : <Sparkles />}
        {t({ en: 'Generate', ar: 'إنشاء' })}
      </Button>
    </div>
  </CardContent>
</Card>

// REPLACEMENT
<MainAIGeneratorCard
  variant="card"
  title={{ en: 'AI-Powered Context Generation', ar: 'إنشاء السياق بالذكاء الاصطناعي' }}
  description={{ en: 'Fill in basic details and let AI suggest vision, mission, and themes', ar: '...' }}
  onGenerate={onGenerateAI}
  isGenerating={isGenerating}
  isReadOnly={isReadOnly}
  disabled={!data.name_en}
/>
```

#### Tabs Configuration (4 tabs)
```jsx
const tabConfig = [
  { id: 'identity', labelEn: 'Identity', labelAr: 'الهوية', icon: Target },
  { id: 'scope', labelEn: 'Scope', labelAr: 'النطاق', icon: MapPin },
  { id: 'discovery', labelEn: 'Discovery', labelAr: 'الاستكشاف', icon: Lightbulb },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: CheckCircle2 }
];
```

---

### Step 2: Vision & Values (`Step2Vision.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 643 lines |
| **Complexity** | Medium |
| **Migration Effort** | 1.5 hours |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Lines 173-204 | None |
| Main AI | ❌ Inline Card | Lines 207-227 | Replace with `MainAIGeneratorCard` |
| Tabs | ❌ Raw `<Tabs>` | Lines 230-246 | Replace with `StepTabs` |
| Alerts | ❌ None | - | N/A |

#### Tabs Configuration (3 tabs)
```jsx
const tabConfig = [
  { id: 'values', labelEn: 'Core Values', labelAr: 'القيم الجوهرية', icon: Heart, badge: valuesCount },
  { id: 'pillars', labelEn: 'Strategic Pillars', labelAr: 'الركائز الاستراتيجية', icon: Columns, badge: pillarsCount },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: Star }
];
```

---

### Step 3: Stakeholders (`Step3Stakeholders.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 720 lines |
| **Complexity** | High |
| **Migration Effort** | 1 hour |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Lines 185-216 | None |
| Main AI | ✅ `AIActionButton` | Lines 221-228 | **Already using shared!** |
| Tabs | ❌ Raw `<Tabs>` | Lines 232-251 | Replace with `StepTabs` |
| Alerts | ❌ None | - | N/A |

#### Quick Win - Only Tabs Migration Needed
```jsx
const tabConfig = [
  { id: 'list', labelEn: 'List', labelAr: 'القائمة', icon: Users, badge: totalCount },
  { id: 'matrix', labelEn: 'Matrix', labelAr: 'المصفوفة', icon: Grid3X3 },
  { id: 'engagement', labelEn: 'Plan', labelAr: 'الخطة', icon: FileText },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: BarChart3 }
];
```

---

### Step 4: SWOT Analysis (`Step2SWOT.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 667 lines |
| **Complexity** | Medium |
| **Migration Effort** | 1 hour |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Lines 362-373 | None |
| Main AI | ✅ `AIActionButton` | Lines 377-384 | **Already using shared!** |
| Tabs | ❌ Raw `<Tabs>` | Lines 388-406 | Replace with `StepTabs` |

#### Tabs Configuration (4 tabs)
```jsx
const tabConfig = [
  { id: 'matrix', labelEn: 'Matrix', labelAr: 'المصفوفة', icon: LayoutGrid },
  { id: 'list', labelEn: 'List', labelAr: 'القائمة', icon: ListChecks },
  { id: 'strategies', labelEn: 'Strategies', labelAr: 'الاستراتيجيات', icon: Lightbulb },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: BarChart3 }
];
```

---

### Step 5: PESTEL Analysis (`Step4PESTEL.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 831 lines |
| **Complexity** | High |
| **Migration Effort** | 1 hour |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Lines 254-266 | None |
| Main AI | ✅ `AIActionButton` | Lines 269-278 | **Already using shared!** |
| Tabs | ❌ Raw `<Tabs>` | Lines 282-300 | Replace with `StepTabs` |

#### Tabs Configuration (4 tabs)
```jsx
const tabConfig = [
  { id: 'factors', labelEn: 'Factors', labelAr: 'العوامل', icon: ListChecks },
  { id: 'overview', labelEn: 'Overview', labelAr: 'نظرة عامة', icon: PieChart },
  { id: 'impact', labelEn: 'Impact', labelAr: 'التأثير', icon: BarChart3 },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: Target }
];
```

---

### Step 6: Strategic Objectives (`Step3Objectives.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 841 lines |
| **Complexity** | High |
| **Migration Effort** | 2.5 hours |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Lines 392-403 | None |
| Main AI | ❌ Custom with Proposal Modal | Lines 173-210 | Complex - preserve modal flow |
| Tabs | ❌ Raw `<Tabs>` | Present | Replace with `StepTabs` |
| Add One AI | ❌ Custom proposal flow | Lines 173-210 | Keep - unique differentiation scoring |

#### Special Considerations
- Has unique "proposal modal" for single objective AI generation
- Uses differentiation scoring between objectives
- Cannot simply replace with `MainAIGeneratorCard` - need hybrid approach

---

### Step 7: KPIs (`Step5KPIs.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1094 lines |
| **Complexity** | Very High |
| **Migration Effort** | 2 hours |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Present | None |
| Main AI | ❌ No bulk generation visible | - | Could add `MainAIGeneratorCard` |
| Tabs | ❌ No tabs - uses `viewMode` | Line 102 | Consider `StepTabs` or `ViewModeToggle` |
| View Mode | ❌ Custom state | Line 102 | `viewMode` = 'byObjective' | 'byCategory' | 'list' |
| SMART Scoring | ✅ Custom | Lines 39-57 | Keep - complex logic |

#### Special Notes
- Uses collapsible cards with SMART score calculation
- View modes: byObjective, byCategory, list
- Very detailed completeness calculation
- May benefit from tabs instead of view mode buttons

---

### Step 8: Action Plans (`Step6ActionPlans.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1200 lines |
| **Complexity** | Very High |
| **Migration Effort** | 2.5 hours |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Present | None |
| Main AI | ❌ No bulk visible | - | Add if needed |
| Tabs | ❌ No tabs - uses `viewMode` | Line 181 | Consider tabs |
| View Mode | ❌ Custom | Line 181 | 'objectives' | 'types' | 'timeline' modes |
| Alerts | ✅ Custom alerts array | Lines 281-322 | **Migrate to `StepAlerts`** |
| Entity Generation | ✅ Custom panel | Line 24 | Keep - `EntityGenerationPanel` |

#### Custom Alerts to Migrate
```jsx
// CURRENT (lines 281-322)
const alerts = useMemo(() => {
  const items = [];
  const uncoveredObjectives = objectives.length - coveredCount;
  if (uncoveredObjectives > 0) {
    items.push({
      type: 'warning',
      icon: AlertTriangle,
      message: t({ en: `${uncoveredObjectives} objective(s) without action plans`, ar: '...' })
    });
  }
  // ... more alert conditions
  return items;
}, [actionPlans, objectives, portfolioStats, t]);

// REPLACEMENT
<StepAlerts alerts={alerts} />
```

---

### Step 9: Risk Assessment (`Step7Risks.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 869 lines |
| **Complexity** | High |
| **Migration Effort** | 2 hours |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Present | None |
| Main AI | ❌ No generation visible | - | Could add |
| Tabs | ❌ Raw `<Tabs>` | Line 86 | Replace with `StepTabs` |
| Alerts | ✅ Custom alerts | Lines 173-201 | **Migrate to `StepAlerts`** |

#### Alerts to Migrate (Lines 173-201)
```jsx
const alerts = useMemo(() => {
  const warnings = [];
  if (stats.total === 0) {
    warnings.push({ type: 'error', message: t({ en: 'No risks identified...', ar: '...' }) });
  }
  if (!data.risk_appetite) {
    warnings.push({ type: 'warning', message: t({ en: 'Risk appetite not defined', ar: '...' }) });
  }
  // ... more conditions
  return warnings;
}, [stats, data.risk_appetite, t]);
```

#### Tabs Configuration (4 tabs)
```jsx
const tabConfig = [
  { id: 'register', labelEn: 'Register', labelAr: 'السجل', icon: ListChecks },
  { id: 'matrix', labelEn: 'Matrix', labelAr: 'المصفوفة', icon: Grid3X3 },
  { id: 'appetite', labelEn: 'Appetite', labelAr: 'الشهية', icon: Target },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: BarChart3 }
];
```

---

### Step 10: Resources (`Step13Resources.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 932 lines |
| **Complexity** | High |
| **Migration Effort** | 1.5 hours |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Present | None |
| Main AI | ✅ `AIActionButton` | Line 23 import | **Already using shared!** |
| Tabs | ❌ Raw `<Tabs>` | Line 7 | Replace with `StepTabs` |
| Alerts | ✅ Custom alerts | Lines 276-300 | **Migrate to `StepAlerts`** |

---

### Step 11: Governance (`Step15Governance.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1235 lines |
| **Complexity** | Very High |
| **Migration Effort** | 2.5 hours |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Lines 85-103 | None |
| Main AI | ❌ No bulk generation | - | Could add if needed |
| Tabs | ❌ Raw tabs setup | Line 122 | Replace with `StepTabs` |
| View Mode | ❌ Custom `viewMode` state | Line 123 | Could use `ViewModeToggle` |
| Alerts | ✅ Custom alerts | Lines 200-225 | **Migrate to `StepAlerts`** |

#### Complex Tab Structure (5 tabs)
```jsx
const tabConfig = [
  { id: 'committees', labelEn: 'Committees', labelAr: 'اللجان', icon: Building2 },
  { id: 'roles', labelEn: 'Roles', labelAr: 'الأدوار', icon: UserCog },
  { id: 'dashboards', labelEn: 'Dashboards', labelAr: 'لوحات التحكم', icon: LayoutDashboard },
  { id: 'raci', labelEn: 'RACI', labelAr: 'RACI', icon: Grid3X3 },
  { id: 'escalation', labelEn: 'Escalation', labelAr: 'التصعيد', icon: ArrowDown }
];
```

---

### Step 12: Review (`Step18Review.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1076 lines |
| **Complexity** | Very High |
| **Migration Effort** | 2 hours |

#### Current Implementation (Verified)

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 27 import | None |
| Main AI | ❌ Custom `AIStrategicPlanAnalyzer` | Line 28 | Keep - specialized component |
| Tabs | ❌ Uses `activeView` state | Line 96 | Could use `StepTabs` |
| Alerts | ✅ Custom validation errors | Lines 213-226 | Could migrate |
| Export | ✅ PDF/Excel export | Lines 305-500+ | Keep - specialized logic |

#### Special Notes
- Final review step with readiness scoring
- Uses specialized `AIStrategicPlanAnalyzer` component
- Export functionality (PDF, Excel) should remain
- Consider `StepTabs` for summary/details/export views

---

## Phase 3: Migration Priority Matrix

### 🟢 Quick Wins (1-1.5 hours each)

| Step | Why Quick | Changes Required |
|------|-----------|------------------|
| Step3Stakeholders | Already uses `AIActionButton` | Only tabs migration |
| Step2SWOT | Already uses `AIActionButton` | Only tabs migration |
| Step4PESTEL | Already uses `AIActionButton` | Only tabs migration |
| Step2Vision | Simple structure | AI card + tabs |

### 🟡 Standard Effort (2 hours each)

| Step | Complexity Factor | Changes Required |
|------|-------------------|------------------|
| Step1Context | More tabs, custom AI | AI card + tabs |
| Step7Risks | Has alerts + tabs | Tabs + alerts migration |
| Step5KPIs | View mode conversion | Layout restructure |
| Step13Resources | Alerts + tabs | Tabs + alerts migration |

### 🔴 Complex (2.5+ hours each)

| Step | Complexity Factor | Changes Required |
|------|-------------------|------------------|
| Step3Objectives | Custom proposal modal | Preserve modal, add tabs |
| Step6ActionPlans | Multiple view modes + alerts | Major restructure |
| Step15Governance | 5 tabs + alerts | Full migration |
| Step18Review | Export + AI analyzer | Selective migration |

---

## Phase 4: Implementation Patterns

### Pattern A: Simple Migration (Tabs Only)
For steps already using `AIActionButton`:

```jsx
// Step3Stakeholders, Step2SWOT, Step4PESTEL
import { StepTabs, StepTabContent, createTabConfig } from '../shared';

// Replace raw Tabs with StepTabs
const tabs = createTabConfig([
  { id: 'list', labelEn: 'List', labelAr: 'القائمة', icon: Users },
  { id: 'matrix', labelEn: 'Matrix', labelAr: 'المصفوفة', icon: Grid3X3 },
], language);

<StepTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
  <StepTabContent value="list">
    {/* Existing list content */}
  </StepTabContent>
  <StepTabContent value="matrix">
    {/* Existing matrix content */}
  </StepTabContent>
</StepTabs>
```

### Pattern B: AI Card + Tabs Migration

```jsx
// Step1Context, Step2Vision
import { MainAIGeneratorCard, StepTabs, StepTabContent } from '../shared';

// Replace custom AI card
{!isReadOnly && (
  <MainAIGeneratorCard
    variant="card"
    title={{ en: 'AI-Powered Generation', ar: 'الإنشاء بالذكاء الاصطناعي' }}
    description={{ en: 'Generate content based on context', ar: '...' }}
    onGenerate={onGenerateAI}
    isGenerating={isGenerating}
    isReadOnly={isReadOnly}
    disabled={!data.name_en}
  />
)}

// Replace tabs
<StepTabs tabs={tabConfig} activeTab={activeTab} onTabChange={setActiveTab}>
  {/* Tab contents */}
</StepTabs>
```

### Pattern C: Full StepLayout Wrapper

```jsx
// For comprehensive migration
import { StepLayout, StepTabContent } from '../shared';

export default function StepXComplete({ data, onChange, onGenerateAI, isGenerating, isReadOnly }) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('main');

  return (
    <StepLayout
      dashboardConfig={{
        score: completenessScore,
        title: { en: 'Step Title', ar: 'عنوان الخطوة' },
        subtitle: { en: 'Step description', ar: 'وصف الخطوة' },
        stats: [
          { icon: Target, value: 5, label: t({ en: 'Items', ar: 'العناصر' }) },
          // ... more stats
        ]
      }}
      mainAI={{
        enabled: true,
        variant: 'card',
        title: { en: 'Generate Content', ar: 'إنشاء المحتوى' },
        onGenerate: onGenerateAI,
        isGenerating,
        isReadOnly
      }}
      tabs={{
        enabled: true,
        tabs: tabConfig,
        activeTab,
        onTabChange: setActiveTab
      }}
      alerts={validationAlerts}
      isReadOnly={isReadOnly}
    >
      <StepTabContent value="main">{/* Content */}</StepTabContent>
      <StepTabContent value="summary">{/* Summary */}</StepTabContent>
    </StepLayout>
  );
}
```

### Pattern D: Alerts Migration

```jsx
// For steps with custom alerts (Step6ActionPlans, Step7Risks, etc.)
import { StepAlerts } from '../shared';

// Keep existing alerts calculation
const alerts = useMemo(() => {
  const items = [];
  if (condition1) items.push({ type: 'warning', message: '...' });
  if (condition2) items.push({ type: 'error', message: '...' });
  return items;
}, [dependencies]);

// Replace inline Alert rendering with:
<StepAlerts alerts={alerts} maxVisible={3} collapsible />
```

---

## Phase 5: Testing Checklist

### Per-Step Migration Testing

- [ ] Dashboard header renders with correct score and stats
- [ ] AI generation button works (if applicable)
- [ ] All tabs switch correctly
- [ ] Tab badges show correct counts
- [ ] Tab status indicators (complete/incomplete) work
- [ ] Alerts display when conditions are met
- [ ] Alerts collapse/expand if using collapsible mode
- [ ] RTL (Arabic) layout works correctly
- [ ] Read-only mode disables all inputs
- [ ] Data persists after tab switches
- [ ] Loading states show during AI generation
- [ ] Empty states render for zero-item cases
- [ ] Form validation still works

### Rollback Procedure

1. Before migration, keep original step file as `StepX_legacy.jsx`
2. Test migration thoroughly before removing legacy
3. Git tag: `pre-migration-stepX`
4. If issues found, revert and analyze

---

## Appendix: Component API Reference

### StepLayout Props

```typescript
interface StepLayoutProps {
  dashboardConfig?: {
    score: number;
    title: { en: string; ar: string };
    subtitle?: { en: string; ar: string };
    stats?: Array<{
      icon: LucideIcon;
      value: string | number;
      label: string;
      subValue?: string;
      iconColor?: string;
    }>;
  };
  mainAI?: {
    enabled: boolean;
    variant?: 'card' | 'button' | 'inline' | 'compact';
    title?: { en: string; ar: string };
    description?: { en: string; ar: string };
    buttonLabel?: { en: string; ar: string };
    onGenerate: () => void;
    isGenerating?: boolean;
    disabled?: boolean;
  };
  addOneAI?: {
    enabled: boolean;
    type?: string;
    label?: { en: string; ar: string };
    onAction: () => void;
    isLoading?: boolean;
  };
  viewMode?: {
    enabled: boolean;
    mode: string;
    options: Array<{ value: string; labelEn: string; labelAr: string; icon: LucideIcon }>;
    onModeChange: (mode: string) => void;
  };
  tabs?: {
    enabled: boolean;
    tabs: TabConfig[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    variant?: 'default' | 'underline' | 'pills';
  };
  alerts?: Alert[];
  isReadOnly?: boolean;
  children: ReactNode;
}
```

### MainAIGeneratorCard Props

```typescript
interface MainAIGeneratorCardProps {
  variant?: 'card' | 'button' | 'inline' | 'compact';
  title?: { en: string; ar: string };
  description?: { en: string; ar: string };
  buttonLabel?: { en: string; ar: string };
  icon?: LucideIcon;
  onGenerate: () => void;
  isGenerating?: boolean;
  isReadOnly?: boolean;
  disabled?: boolean;
}
```

### StepTabs Props

```typescript
interface StepTabsProps {
  tabs: Array<{
    id: string;
    label?: string;
    labelEn?: string;
    labelAr?: string;
    icon?: LucideIcon;
    badge?: string | number;
    status?: 'complete' | 'incomplete' | 'error';
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'underline' | 'pills';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}
```

### StepAlerts Props

```typescript
interface StepAlertsProps {
  alerts: Array<{
    type: 'info' | 'warning' | 'error' | 'success' | 'tip';
    message: string;
    action?: { label: string; onClick: () => void };
  }>;
  maxVisible?: number;
  collapsible?: boolean;
  className?: string;
}
```

---

## Estimated Total Effort

| Category | Steps Count | Hours Each | Total Hours |
|----------|-------------|------------|-------------|
| Quick Wins | 4 | 1.25 avg | 5 hours |
| Standard | 4 | 2 avg | 8 hours |
| Complex | 4 | 2.5 avg | 10 hours |
| Testing & QA | - | - | 5 hours |
| **TOTAL** | **12** | - | **~28 hours** |

---

## Next Steps

1. **Start with Quick Wins** - Steps already using `AIActionButton`
2. **Validate patterns** - Ensure migrated steps work correctly
3. **Create automated tests** - Component-level testing
4. **Document edge cases** - Any issues discovered during migration
5. **Consider VS Code snippets** - For common patterns

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| Dec 2024 | 2.0 | Complete re-analysis with actual file inspection |
| Dec 2024 | 1.0 | Initial migration plan created |
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

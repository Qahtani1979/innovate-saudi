# Wizard Step Standardization - Complete Migration Guide

> **Last Updated**: December 2024  
> **Status**: Phase 1 Complete - Ready for Migration  
> **Analysis Based On**: Actual file inspection of all 19 step components

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

### Actual File Structure (19 Files Total)

| File | Lines | StepDashboardHeader | AIActionButton | Raw Tabs | Custom Alerts |
|------|-------|---------------------|----------------|----------|---------------|
| Step1Context.jsx | 885 | ✅ | ❌ Custom Card | ✅ 4 tabs | ❌ |
| Step2Vision.jsx | 643 | ✅ | ❌ Custom Card | ✅ 3 tabs | ❌ |
| Step2SWOT.jsx | 667 | ✅ | ✅ (line 17) | ✅ 4 tabs | ❌ |
| Step3Objectives.jsx | 841 | ✅ | ❌ Custom Modal | ✅ 3 tabs | ❌ |
| Step3Stakeholders.jsx | 720 | ✅ | ✅ (line 26) | ✅ 4 tabs | ❌ |
| Step4PESTEL.jsx | 831 | ✅ | ✅ (line 19) | ✅ 4 tabs | ❌ |
| Step4NationalAlignment.jsx | 585 | ✅ | ❌ None | ✅ 3 tabs | ❌ |
| Step5KPIs.jsx | 1094 | ✅ | ✅ (line 19) | ❌ viewMode | ❌ |
| Step6ActionPlans.jsx | 1200 | ✅ | ✅ (line 25) | ✅ | ✅ Custom |
| Step6Scenarios.jsx | 784 | ✅ | ❌ None | ✅ 3 tabs | ❌ |
| Step7Risks.jsx | 869 | ✅ | ✅ (line 24) | ✅ 4 tabs | ✅ Custom |
| Step7Timeline.jsx | 1145 | ✅ | ✅ (line 21) | ✅ 3 tabs | ❌ |
| Step8Dependencies.jsx | 1054 | ✅ | ✅ (line 19) | ✅ 3 tabs | ❌ |
| Step8Review.jsx | 624 | ✅ | ❌ None | ❌ No tabs | ❌ |
| Step13Resources.jsx | 932 | ✅ | ✅ (line 23) | ✅ 4 tabs | ✅ Custom |
| Step15Governance.jsx | 1235 | ✅ | ❌ None | ✅ 5 tabs | ✅ Custom |
| Step16Communication.jsx | 1142 | ✅ | ❌ None | ✅ 4 tabs | ✅ Custom |
| Step17Change.jsx | 1482 | ✅ | ❌ None | ✅ 6 tabs | ✅ Custom |
| Step18Review.jsx | 1076 | ✅ | ✅ AIAnalyzer | ✅ tabs | ❌ |

### Summary Statistics

| Pattern | Already Using Shared | Needs Migration | Total |
|---------|---------------------|-----------------|-------|
| Dashboard Header | 19 (100%) | 0 | ✅ Done |
| AI Generation | 10 (53%) | 9 | 🟡 Partial |
| StepTabs | 0 (0%) | 17 | 🔴 All need migration |
| StepAlerts | 0 (0%) | 6 | 🟡 6 have custom alerts |
| ViewModeToggle | 0 (0%) | 1 | 🟢 Low priority |

---

## Phase 1: Core Components

### ✅ Completed Components

| Component | File | Purpose | Variants |
|-----------|------|---------|----------|
| `MainAIGeneratorCard` | `shared/MainAIGeneratorCard.jsx` | Bulk AI generation | card, button, inline, compact |
| `StepAlerts` | `shared/StepAlerts.jsx` | Validation alerts | info, warning, error, success, tip |
| `StepTabs` | `shared/StepTabs.jsx` | Tab navigation | default, underline, pills |
| `StepLayout` | `shared/StepLayout.jsx` | Master layout wrapper | - |
| `ViewModeToggle` | `shared/ViewModeToggle.jsx` | View mode switching | - |

### Pre-existing Components (Already in Use)

| Component | File | Used By (Count) |
|-----------|------|-----------------|
| `StepDashboardHeader` | `shared/StepDashboardHeader.jsx` | All 19 steps ✅ |
| `AIActionButton` | `shared/AIActionButton.jsx` | 10 steps |
| `QualityMetrics` | `shared/QualityMetrics.jsx` | Most steps |
| `DistributionChart` | `shared/DistributionChart.jsx` | Most steps |
| `RecommendationsCard` | `shared/RecommendationsCard.jsx` | Some steps |

---

## Phase 2: Step-by-Step Gap Analysis

---

### Step 1: Context (`Step1Context.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 885 lines |
| **Complexity** | High |
| **Migration Effort** | 2 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Lines 173-202 | None |
| Main AI | ❌ Custom inline card | Lines 206-225 | Replace with `MainAIGeneratorCard` |
| Tabs | ❌ Raw `<Tabs>` | Lines 228-246 | Replace with `StepTabs` |
| Alerts | ❌ None | - | Add validation alerts |

#### Custom AI Card to Replace (Lines 206-225)
```jsx
// CURRENT
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
        Generate
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

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Lines 173-204 | None |
| Main AI | ❌ Custom inline card | Lines 207-227 | Replace with `MainAIGeneratorCard` |
| Tabs | ❌ Raw `<Tabs>` | Lines 230-246 | Replace with `StepTabs` |

#### Tabs Configuration (3 tabs)
```jsx
const tabConfig = [
  { id: 'values', labelEn: 'Core Values', labelAr: 'القيم الجوهرية', icon: Heart, badge: valuesCount },
  { id: 'pillars', labelEn: 'Strategic Pillars', labelAr: 'الركائز الاستراتيجية', icon: Columns, badge: pillarsCount },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: Star }
];
```

---

### Step 3: SWOT Analysis (`Step2SWOT.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 667 lines |
| **Complexity** | Medium |
| **Migration Effort** | 1 hour |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Present | None |
| Main AI | ✅ `AIActionButton` | Line 17 import | **Already using shared!** |
| Tabs | ❌ Raw `<Tabs>` | Line 7 import | Replace with `StepTabs` |

#### 🟢 Quick Win - Only Tabs Migration Needed

```jsx
const tabConfig = [
  { id: 'matrix', labelEn: 'Matrix', labelAr: 'المصفوفة', icon: LayoutGrid },
  { id: 'list', labelEn: 'List', labelAr: 'القائمة', icon: ListChecks },
  { id: 'strategies', labelEn: 'Strategies', labelAr: 'الاستراتيجيات', icon: Lightbulb },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: BarChart3 }
];
```

---

### Step 4: Strategic Objectives (`Step3Objectives.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 841 lines |
| **Complexity** | High |
| **Migration Effort** | 2 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 21 import | None |
| Main AI | ❌ Custom proposal modal | Lines 35-40 | Preserve modal, consider hybrid |
| Tabs | ❌ Raw `<Tabs>` | Line 11 import | Replace with `StepTabs` |

#### Special Considerations
- Has unique "proposal modal" for single objective AI generation
- Uses differentiation scoring between objectives
- `onGenerateSingleObjective` callback is unique to this step
- Cannot simply replace with `MainAIGeneratorCard` - need hybrid approach

---

### Step 5: Stakeholders (`Step3Stakeholders.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 720 lines |
| **Complexity** | Medium |
| **Migration Effort** | 1 hour |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Lines 22-26 import | None |
| Main AI | ✅ `AIActionButton` | Line 26 import | **Already using shared!** |
| Tabs | ❌ Raw `<Tabs>` | Line 10 import | Replace with `StepTabs` |

#### 🟢 Quick Win - Only Tabs Migration Needed

---

### Step 6: PESTEL Analysis (`Step4PESTEL.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 831 lines |
| **Complexity** | Medium |
| **Migration Effort** | 1 hour |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 19 import | None |
| Main AI | ✅ `AIActionButton` | Line 19 import | **Already using shared!** |
| Tabs | ❌ Raw `<Tabs>` | Line 8 import | Replace with `StepTabs` |

#### 🟢 Quick Win - Only Tabs Migration Needed

---

### Step 7: National Alignment (`Step4NationalAlignment.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 585 lines |
| **Complexity** | Low |
| **Migration Effort** | 1 hour |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 14 import | None |
| Main AI | ❌ None | - | Could add `MainAIGeneratorCard` |
| Tabs | ❌ Raw `<Tabs>` | Line 6 import | Replace with `StepTabs` |

---

### Step 8: KPIs (`Step5KPIs.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1094 lines |
| **Complexity** | Very High |
| **Migration Effort** | 2 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 19 import | None |
| Main AI | ✅ `AIActionButton` | Line 19 import | Already available |
| Tabs | ❌ Uses `viewMode` state | Line 102 | Consider `ViewModeToggle` |
| SMART Scoring | ✅ Custom | Lines 38-57 | Keep - complex logic |

#### Special Notes
- Uses custom `viewMode` state instead of tabs: 'byObjective' | 'byCategory' | 'list'
- Consider migrating to `ViewModeToggle` component instead of `StepTabs`
- SMART score calculation is highly specialized - keep as-is

---

### Step 9: Action Plans (`Step6ActionPlans.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1200 lines |
| **Complexity** | Very High |
| **Migration Effort** | 2.5 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 25 import | None |
| Main AI | ✅ `AIActionButton` | Line 25 import | Already available |
| Tabs | ❌ Raw `<Tabs>` | Line 10 import | Replace with `StepTabs` |
| Alerts | ✅ Custom alerts array | Has custom | **Migrate to `StepAlerts`** |
| Entity Generation | ✅ `EntityGenerationPanel` | Line 24 | Keep - specialized |

---

### Step 10: Scenarios (`Step6Scenarios.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 784 lines |
| **Complexity** | Medium |
| **Migration Effort** | 1.5 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 19 import | None |
| Main AI | ❌ No AI generation | - | Could add `MainAIGeneratorCard` |
| Tabs | ❌ Raw `<Tabs>` | Line 8 import | Replace with `StepTabs` |

---

### Step 11: Risk Assessment (`Step7Risks.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 869 lines |
| **Complexity** | High |
| **Migration Effort** | 2 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 24 import | None |
| Main AI | ✅ `AIActionButton` | Line 24 import | Already available |
| Tabs | ❌ Raw `<Tabs>` | Line 10 import | Replace with `StepTabs` |
| Alerts | ✅ Custom alerts array | Has custom | **Migrate to `StepAlerts`** |

---

### Step 12: Timeline (`Step7Timeline.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1145 lines |
| **Complexity** | Very High |
| **Migration Effort** | 2 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 21 import | None |
| Main AI | ✅ `AIActionButton` | Line 21 import | Already available |
| Tabs | ❌ Raw `<Tabs>` | Line 10 import | Replace with `StepTabs` |

---

### Step 13: Dependencies (`Step8Dependencies.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1054 lines |
| **Complexity** | High |
| **Migration Effort** | 1.5 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 19 import | None |
| Main AI | ✅ `AIActionButton` | Line 19 import | Already available |
| Tabs | ❌ Raw `<Tabs>` | Line 10 import | Replace with `StepTabs` |

---

### Step 14: Mid-Review (`Step8Review.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 624 lines |
| **Complexity** | Medium |
| **Migration Effort** | 1 hour |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 19 import | None |
| Main AI | ❌ None | - | No AI needed (review step) |
| Tabs | ❌ No tabs | - | N/A |
| Export | ✅ PDF/Excel | Lines 58+ | Keep - specialized |

---

### Step 15: Resources (`Step13Resources.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 932 lines |
| **Complexity** | High |
| **Migration Effort** | 1.5 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 23 import | None |
| Main AI | ✅ `AIActionButton` | Line 23 import | Already available |
| Tabs | ❌ Raw `<Tabs>` | Line 7 import | Replace with `StepTabs` |
| Alerts | ✅ Custom alerts | Has custom | **Migrate to `StepAlerts`** |

---

### Step 16: Governance (`Step15Governance.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1235 lines |
| **Complexity** | Very High |
| **Migration Effort** | 2.5 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 22 import | None |
| Main AI | ❌ None | - | Could add `MainAIGeneratorCard` |
| Tabs | ❌ Raw `<Tabs>` | Line 9 import | Replace with `StepTabs` |
| Alerts | ✅ Custom alerts | Has custom | **Migrate to `StepAlerts`** |

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

### Step 17: Communication (`Step16Communication.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1142 lines |
| **Complexity** | Very High |
| **Migration Effort** | 2 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 24 import | None |
| Main AI | ❌ None | - | Could add `MainAIGeneratorCard` |
| Tabs | ❌ Raw `<Tabs>` | Line 9 import | Replace with `StepTabs` |
| Alerts | ✅ Custom alerts | Has custom | **Migrate to `StepAlerts`** |

---

### Step 18: Change Management (`Step17Change.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1482 lines (largest!) |
| **Complexity** | Very High |
| **Migration Effort** | 2.5 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 23 import | None |
| Main AI | ❌ None | - | Could add `MainAIGeneratorCard` |
| Tabs | ❌ Raw `<Tabs>` | Line 9 import | Replace with `StepTabs` |
| Alerts | ✅ Custom alerts | Has custom | **Migrate to `StepAlerts`** |

#### Complex Tab Structure (6 tabs)
- Impact Assessment
- Readiness
- Training
- Resistance
- Champions
- Summary

---

### Step 19: Final Review (`Step18Review.jsx`)

| Metric | Value |
|--------|-------|
| **File Size** | 1076 lines |
| **Complexity** | Very High |
| **Migration Effort** | 2 hours |

#### Current Implementation

| Component | Status | Location | Gap |
|-----------|--------|----------|-----|
| Dashboard | ✅ `StepDashboardHeader` | Line 27 import | None |
| Main AI | ✅ `AIStrategicPlanAnalyzer` | Line 28 | **Keep - specialized AI** |
| Tabs | ❌ Raw `<Tabs>` | Line 8 import | Replace with `StepTabs` |
| Export | ✅ PDF/Excel | Present | Keep - specialized |

---

## Phase 3: Migration Priority Matrix

### 🟢 Quick Wins (< 1.5 hours each)

| Step | Already Has | Migration Needed |
|------|-------------|-----------------|
| Step2SWOT | `AIActionButton` | Tabs only |
| Step3Stakeholders | `AIActionButton` | Tabs only |
| Step4PESTEL | `AIActionButton` | Tabs only |
| Step4NationalAlignment | Dashboard | Tabs only |

### 🟡 Standard Effort (1.5-2 hours each)

| Step | Migration Needed |
|------|-----------------|
| Step1Context | AI Card + Tabs |
| Step2Vision | AI Card + Tabs |
| Step6Scenarios | AI Card + Tabs |
| Step7Timeline | Tabs |
| Step8Dependencies | Tabs |
| Step8Review | None |

### 🔴 Complex (2+ hours each)

| Step | Complexity Factor |
|------|-------------------|
| Step3Objectives | Custom proposal modal |
| Step5KPIs | ViewMode conversion |
| Step6ActionPlans | Alerts + Tabs |
| Step7Risks | Alerts + Tabs |
| Step13Resources | Alerts + Tabs |
| Step15Governance | 5 tabs + Alerts |
| Step16Communication | 4 tabs + Alerts |
| Step17Change | 6 tabs + Alerts (largest file) |
| Step18Review | Specialized AI + Tabs |

---

## Phase 4: Implementation Patterns

### Pattern A: Simple Migration (Tabs Only)

For steps already using `AIActionButton`:

```jsx
// BEFORE
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// AFTER
import { StepTabs, StepTabContent, createTabConfig } from '../shared';

// Tab definition
const TABS = createTabConfig([
  { id: 'matrix', labelEn: 'Matrix', labelAr: 'المصفوفة', icon: LayoutGrid },
  { id: 'list', labelEn: 'List', labelAr: 'القائمة', icon: ListChecks },
]);

// Usage
<StepTabs
  tabs={TABS}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="default"
>
  <StepTabContent value="matrix">...</StepTabContent>
  <StepTabContent value="list">...</StepTabContent>
</StepTabs>
```

### Pattern B: AI Card Migration

For steps with custom inline AI cards:

```jsx
// BEFORE
<Card className="border-primary/20">
  <CardContent className="py-4">
    <div className="flex items-center justify-between">
      <div>
        <h4><Sparkles /> Title</h4>
        <p>Description</p>
      </div>
      <Button onClick={onGenerateAI}>Generate</Button>
    </div>
  </CardContent>
</Card>

// AFTER
import { MainAIGeneratorCard } from '../shared';

<MainAIGeneratorCard
  variant="card"
  title={{ en: 'Title', ar: 'العنوان' }}
  description={{ en: 'Description', ar: 'الوصف' }}
  onGenerate={onGenerateAI}
  isGenerating={isGenerating}
  isReadOnly={isReadOnly}
  disabled={!requiredField}
/>
```

### Pattern C: Alerts Migration

For steps with custom alerts arrays:

```jsx
// BEFORE
const alerts = useMemo(() => {
  const items = [];
  if (someCondition) {
    items.push({
      type: 'warning',
      message: t({ en: 'Warning message', ar: '...' })
    });
  }
  return items;
}, [deps]);

// Custom rendering

// AFTER
import { StepAlerts } from '../shared';

const alerts = useMemo(() => {
  return [
    someCondition && {
      type: 'warning',
      title: { en: 'Warning', ar: 'تحذير' },
      message: { en: 'Warning message', ar: '...' }
    }
  ].filter(Boolean);
}, [deps]);

<StepAlerts alerts={alerts} maxVisible={3} />
```

---

## Phase 5: Testing Checklist

### For Each Migrated Step

- [ ] Dashboard header renders correctly with score
- [ ] AI generation button works (if present)
- [ ] Tab navigation works with correct content
- [ ] Badge counts update correctly
- [ ] RTL layout works (Arabic mode)
- [ ] Read-only mode disables inputs
- [ ] All existing functionality preserved
- [ ] No console errors

### Regression Testing

- [ ] Navigate between all wizard steps
- [ ] Save and load wizard data
- [ ] AI generation produces expected results
- [ ] Export functionality works (review steps)

---

## Appendix: Component API Reference

### StepLayout Props

```typescript
interface StepLayoutProps {
  // Dashboard Header
  dashboardConfig?: {
    score: number;
    title: { en: string; ar: string };
    subtitle?: { en: string; ar: string };
    stats?: Array<{
      icon: LucideIcon;
      value: string | number;
      label: string;
      subValue?: string;
    }>;
  };

  // Main AI Generator
  mainAI?: {
    enabled: boolean;
    variant?: 'card' | 'button' | 'inline' | 'compact';
    title?: { en: string; ar: string };
    description?: { en: string; ar: string };
    onGenerate: () => void;
    isGenerating?: boolean;
    disabled?: boolean;
  };

  // Add One AI Button
  addOneAI?: {
    enabled: boolean;
    variant?: 'suggest' | 'generate';
    onGenerate: () => void;
    isGenerating?: boolean;
  };

  // View Mode Toggle
  viewMode?: {
    enabled: boolean;
    mode: string;
    onModeChange: (mode: string) => void;
    options?: string[];
  };

  // Tabs
  tabs?: {
    enabled: boolean;
    items: TabConfig[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    variant?: 'default' | 'underline' | 'pills';
  };

  // Alerts
  alerts?: AlertConfig[];

  // Common
  isReadOnly?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

### Estimated Total Effort

| Category | Steps | Hours Each | Total Hours |
|----------|-------|------------|-------------|
| Quick Wins | 4 | 1 | 4 |
| Standard | 6 | 1.5 | 9 |
| Complex | 9 | 2.5 | 22.5 |
| **Total** | **19** | - | **~35 hours** |

---

## Recommended Migration Order

1. **Week 1**: Quick wins (SWOT, Stakeholders, PESTEL, NationalAlignment)
2. **Week 2**: Standard (Context, Vision, Scenarios, Timeline, Dependencies)
3. **Week 3**: Complex Part 1 (KPIs, ActionPlans, Risks, Resources)
4. **Week 4**: Complex Part 2 (Governance, Communication, Change, Reviews)

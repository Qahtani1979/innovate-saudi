# Wizard Step Standardization - Complete Migration Guide

> **Last Updated**: December 17, 2024  
> **Status**: Phase 1.2 Complete - AI Prompts Extracted  
> **Analysis Based On**: Full code inspection of all 19 step components

---

## Recent Updates

### ✅ AI Prompts Extracted to Separate Files (Dec 17, 2024)

All AI prompts have been moved from inline definitions in `StrategyWizardWrapper.jsx` to modular files:
- **Location**: `src/components/strategy/wizard/prompts/`
- **Files**: 19 prompt files (step1Context.js through step18Review.js)
- **Special**: `step9ObjectivesSingle.js` for "AI Add One" functionality
- **Index**: Central exports with `STEP_PROMPT_MAP` for quick lookup

**Migration Status**: Prompts extracted → Next: Update StrategyWizardWrapper.jsx to import from files

### ✅ Component Redesigns Completed (Dec 17, 2024)

#### MainAIGeneratorCard - Now Matches Step 9 Design
The `MainAIGeneratorCard` component has been updated to match the clean Step 3 Objectives (Step 9) design:

**Visual Changes:**
- Clean gradient styling: `border-primary/30 bg-primary/5`
- Title and description positioned on left
- Action buttons aligned on right
- Removed complex icon decorations

**New Props Added:**
- `onGenerateSingle` - Callback for "AI Add One" button
- `isGeneratingSingle` - Loading state for single generation
- `showSingleButton` - Toggle visibility of "AI Add One" button
- `singleButtonLabel` - Custom label for single button `{ en, ar }`

**Usage Example:**
```jsx
<MainAIGeneratorCard
  title={{ en: 'AI-Powered Objectives', ar: 'الأهداف بالذكاء الاصطناعي' }}
  description={{ en: 'Generate sector-specific objectives based on your context', ar: '...' }}
  onGenerate={handleGenerateAll}
  onGenerateSingle={handleGenerateOne}
  isGenerating={isGenerating}
  isGeneratingSingle={isGeneratingSingle}
  showSingleButton={true}
  isReadOnly={isReadOnly}
/>
```

#### StepDashboardHeader - Now Matches Step 18 Design
The `StepDashboardHeader` component has been updated to match the comprehensive Step 18 Review dashboard design:

**Visual Changes:**
- Large circular score indicator with percentage inside colored circle
- Status label (Excellent, Good, Adequate, Needs Work, Critical)
- 7-column responsive grid layout
- Stat cards with centered icons
- Optional progress bar metrics section

**New Props Added:**
- `metrics` - Array of metric objects for progress bars `[{ label, value }]`
- Enhanced `subtitle` - Now supports `{ completed, total }` object format

**Score Thresholds:**
| Score Range | Status | Color |
|-------------|--------|-------|
| 90-100% | Excellent | Green |
| 75-89% | Good | Blue |
| 60-74% | Adequate | Yellow |
| 40-59% | Needs Work | Orange |
| 0-39% | Critical | Red |

**Usage Example:**
```jsx
<StepDashboardHeader
  score={88}
  title={{ en: 'Readiness Score', ar: 'درجة الجاهزية' }}
  subtitle={{ completed: 15, total: 17 }}
  stats={[
    { icon: Target, value: 31, label: t({ en: 'Objectives', ar: 'الأهداف' }), iconColor: 'text-primary' },
    { icon: Activity, value: 20, label: t({ en: 'KPIs', ar: 'المؤشرات' }), iconColor: 'text-blue-500' },
    { icon: Briefcase, value: 16, label: t({ en: 'Actions', ar: 'الإجراءات' }), iconColor: 'text-purple-500' },
    { icon: AlertTriangle, value: 6, label: t({ en: 'Risks', ar: 'المخاطر' }), iconColor: 'text-amber-500' },
    { icon: Users, value: 13, label: t({ en: 'Stakeholders', ar: 'الأطراف' }), iconColor: 'text-teal-500' },
  ]}
  metrics={[
    { label: t({ en: 'KPI Coverage', ar: 'تغطية المؤشرات' }), value: 65 },
    { label: t({ en: 'Action Coverage', ar: 'تغطية الإجراءات' }), value: 52 },
    { label: t({ en: 'Risk Mitigation', ar: 'تخفيف المخاطر' }), value: 0 },
    { label: t({ en: 'Engagement', ar: 'المشاركة' }), value: 0 },
    { label: t({ en: 'Bilingual', ar: 'ثنائي اللغة' }), value: 100 },
  ]}
  language={language}
/>
```

---

## AI Prompt Locations

### ✅ AI Prompts Extracted to Separate Files (COMPLETED Dec 17, 2024)

All AI prompts have been extracted from inline definitions to separate files in `src/components/strategy/wizard/prompts/`.

#### Prompt Files Structure

| File | Step | Description |
|------|------|-------------|
| `step1Context.js` | Step 1 | Context & Discovery prompt + schema |
| `step2Vision.js` | Step 2 | Vision & Values prompt + schema |
| `step3Stakeholders.js` | Step 3 | Stakeholder Analysis prompt + schema |
| `step4Pestel.js` | Step 4 | PESTEL Analysis prompt + schema |
| `step5Swot.js` | Step 5 | SWOT Analysis prompt + schema |
| `step6Scenarios.js` | Step 6 | Strategic Scenarios prompt + schema |
| `step7Risks.js` | Step 7 | Risk Assessment prompt + schema |
| `step8Dependencies.js` | Step 8 | Dependencies Mapping prompt + schema |
| `step9Objectives.js` | Step 9 | Strategic Objectives prompt + schema |
| `step9ObjectivesSingle.js` | Step 9 | **"AI Add One"** single objective prompt + schema |
| `step10National.js` | Step 10 | National Alignment prompt + schema |
| `step11Kpis.js` | Step 11 | KPIs Definition prompt + schema |
| `step12Actions.js` | Step 12 | Action Plans prompt + schema |
| `step13Resources.js` | Step 13 | Resource Allocation prompt + schema |
| `step14Timeline.js` | Step 14 | Implementation Timeline prompt + schema |
| `step15Governance.js` | Step 15 | Governance Structure prompt + schema |
| `step16Communication.js` | Step 16 | Communication Plan prompt + schema |
| `step17Change.js` | Step 17 | Change Management prompt + schema |
| `step18Review.js` | Step 18 | Review (no prompts - uses AIStrategicPlanAnalyzer) |
| `index.js` | All | Central exports + STEP_PROMPT_MAP |

#### Usage Example

```jsx
import { 
  getStep1Prompt, 
  step1Schema,
  generateSingleObjectivePrompt,
  SINGLE_OBJECTIVE_SCHEMA,
  STEP_PROMPT_MAP 
} from './prompts';

// Get prompt for context step
const contextPrompt = getStep1Prompt(context);

// Get single objective prompt for "AI Add One"
const singlePrompt = generateSingleObjectivePrompt({
  context,
  wizardData,
  existingObjectives,
  taxonomySectorCodes
});
```

#### Migration Status

| Task | Status | Notes |
|------|--------|-------|
| Extract Steps 1-8 prompts | ✅ Complete | All prompts + schemas |
| Extract Steps 9-17 prompts | ✅ Complete | All prompts + schemas |
| Extract Step 9 Single prompt | ✅ Complete | "AI Add One" functionality |
| Create Step 18 documentation | ✅ Complete | No prompts (review step) |
| Update index.js exports | ✅ Complete | All exports + STEP_PROMPT_MAP |
| Update StrategyWizardWrapper.jsx | 🔴 Pending | Import prompts from files |

#### Next Steps

1. **Update StrategyWizardWrapper.jsx** to import prompts from `./prompts` instead of inline definitions
2. **Remove inline prompts** (lines 461-2900+) after import is working
3. **Test all AI generation** to ensure prompts work correctly

---

## Dashboard Fix Tasks (Post StepDashboardHeader Redesign)

### 🔴 All 19 Steps Need Dashboard Updates

After the StepDashboardHeader redesign to match Step 18 style, all steps need updates to:
1. Add the new `metrics` prop (optional but recommended)
2. Update `subtitle` to use `{ completed, total }` format where applicable
3. Ensure 5 stat cards maximum for proper grid layout

| # | Step File | Dashboard Line | Current Stats | Needs Metrics | Priority |
|---|-----------|----------------|---------------|---------------|----------|
| 1 | Step1Context.jsx | L173 | 4 stats | ✅ Yes | Medium |
| 2 | Step2Vision.jsx | L173 | 4 stats | ✅ Yes | Medium |
| 3 | Step2SWOT.jsx | L362 | 4 stats | ✅ Yes | Low |
| 4 | Step3Objectives.jsx | L393 | 4 stats | ✅ Yes | High |
| 5 | Step3Stakeholders.jsx | L~220 | 4 stats | ✅ Yes | Medium |
| 6 | Step4PESTEL.jsx | L255 | 4 stats | ✅ Yes | Low |
| 7 | Step4NationalAlignment.jsx | L189 | 4 stats | ✅ Yes | Medium |
| 8 | Step5KPIs.jsx | L619 | 4 stats | ✅ Yes | High |
| 9 | Step6ActionPlans.jsx | L773 | 4 stats | ✅ Yes | High |
| 10 | Step6Scenarios.jsx | L~470 | 4 stats | ✅ Yes | Low |
| 11 | Step7Risks.jsx | L~610 | 4 stats | ✅ Yes | High |
| 12 | Step7Timeline.jsx | L~495 | 4 stats | ✅ Yes | Medium |
| 13 | Step8Dependencies.jsx | L~275 | 4 stats | ✅ Yes | Low |
| 14 | Step8Review.jsx | L~350 | 4 stats | ✅ Yes | Medium |
| 15 | Step13Resources.jsx | L~600 | 4 stats | ✅ Yes | Medium |
| 16 | Step15Governance.jsx | L~420 | 4 stats | ✅ Yes | Medium |
| 17 | Step16Communication.jsx | L~940 | 4 stats | ✅ Yes | Low |
| 18 | Step17Change.jsx | L~1170 | 4 stats | ✅ Yes | Low |
| 19 | Step18Review.jsx | L568 | 5 stats | ✅ Already has metrics | Reference |

### Dashboard Update Pattern

```jsx
// BEFORE (Current - missing metrics)
<StepDashboardHeader
  score={completenessScore}
  title={t({ en: 'Section Title', ar: 'عنوان القسم' })}
  subtitle={`${count} items`}
  language={language}
  stats={[
    { icon: Icon1, value: 10, label: t({ en: 'Label 1', ar: '...' }) },
    { icon: Icon2, value: 20, label: t({ en: 'Label 2', ar: '...' }) },
    // ... up to 5 stats
  ]}
/>

// AFTER (Updated - with metrics)
<StepDashboardHeader
  score={completenessScore}
  title={{ en: 'Section Title', ar: 'عنوان القسم' }}
  subtitle={{ completed: completedItems, total: totalItems }}
  language={language}
  stats={[
    { icon: Icon1, value: 10, label: t({ en: 'Label 1', ar: '...' }), iconColor: 'text-primary' },
    { icon: Icon2, value: 20, label: t({ en: 'Label 2', ar: '...' }), iconColor: 'text-blue-500' },
    // ... up to 5 stats
  ]}
  metrics={[
    { label: t({ en: 'Metric 1', ar: '...' }), value: percentage1 },
    { label: t({ en: 'Metric 2', ar: '...' }), value: percentage2 },
    // ... up to 5 metrics
  ]}
/>
```

### Step-Specific Metrics Recommendations

| Step | Suggested Metrics |
|------|-------------------|
| Step1Context | Bilingual %, Sector Coverage %, Stakeholder Coverage % |
| Step2Vision | Values Complete %, Pillars Defined %, Bilingual % |
| Step3Objectives | By Priority %, Sector Coverage %, KPI Linked % |
| Step5KPIs | Objective Coverage %, Target Set %, Baseline Set % |
| Step6ActionPlans | Objective Coverage %, Timeline Set %, Budget Allocated % |
| Step7Risks | Mitigated %, High Risk %, Contingency Plans % |
| Step18Review | KPI Coverage %, Action Coverage %, Risk Mitigation %, Engagement %, Bilingual % |

**Estimated Effort**: 30 minutes per step (total ~10 hours for all 19 steps)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [AI Prompt Locations](#ai-prompt-locations)
3. [Dashboard Fix Tasks](#dashboard-fix-tasks-post-stepdashboardheader-redesign)
4. [Full Step Assessment](#full-step-assessment)
5. [Migration Priority Matrix](#migration-priority-matrix)
6. [Implementation Patterns](#implementation-patterns)
7. [Testing Checklist](#testing-checklist)

---

## Executive Summary

### Complete File Analysis (19 Files)

| # | File | Lines | Dashboard | AI Pattern | Tabs Line | Tab Count | Alert Import |
|---|------|-------|-----------|------------|-----------|-----------|--------------|
| 1 | Step1Context.jsx | 885 | ✅ L19 | Custom Card L206-224 | L228 | 4 | ❌ |
| 2 | Step2Vision.jsx | 643 | ✅ L18 | Custom Card L207-226 | L230 | 3 | ❌ |
| 3 | Step2SWOT.jsx | 667 | ✅ L17 | AIActionButton L17 | L388 | 4 | ❌ |
| 4 | Step3Objectives.jsx | 841 | ✅ L21 | Custom Modal | L433 | 4 | ❌ |
| 5 | Step3Stakeholders.jsx | 720 | ✅ L21-27 | AIActionButton L26 | L232 | 4 | ❌ |
| 6 | Step4PESTEL.jsx | 831 | ✅ L19 | AIActionButton L19 | L282 | 4 | ❌ |
| 7 | Step4NationalAlignment.jsx | 585 | ✅ L14 | Custom Button L203-219 | L232 | 4 | ❌ |
| 8 | Step5KPIs.jsx | 1094 | ✅ L19 | AIActionButton L19 | L670 | 4 | ✅ L11 |
| 9 | Step6ActionPlans.jsx | 1200 | ✅ L25 | AIActionButton L25 | L810 | 4 | ✅ L14 |
| 10 | Step6Scenarios.jsx | 784 | ✅ L19 | Custom Button L462-474 | L478 | 4 | ❌ |
| 11 | Step7Risks.jsx | 869 | ✅ L24 | AIActionButton L24 | L616 | 4 | ✅ L13 |
| 12 | Step7Timeline.jsx | 1145 | ✅ L21 | AIActionButton L21 | L501 | 4 | ❌ |
| 13 | Step8Dependencies.jsx | 1054 | ✅ L19 | AIActionButton L19 | L283 | **5** | ❌ |
| 14 | Step8Review.jsx | 624 | ✅ L19 | None (review step) | ❌ None | 0 | ✅ L5 |
| 15 | Step13Resources.jsx | 932 | ✅ L23 | AIActionButton L23 | L615 | 4 | ✅ L11 |
| 16 | Step15Governance.jsx | 1235 | ✅ L22 | Custom Button L423 | L577 | **5** | ✅ L12 |
| 17 | Step16Communication.jsx | 1142 | ✅ L24 | None | L950 | **5** | ✅ L12 |
| 18 | Step17Change.jsx | 1482 | ✅ L23 | None | L1177 | **6** | ✅ L13 |
| 19 | Step18Review.jsx | 1076 | ✅ L27 | AIAnalyzer L28 | Has tabs | varies | ✅ L5 |

### Summary Statistics

| Component | Status | Using Shared | Needs Migration | Notes |
|-----------|--------|-------------|-----------------|-------|
| **StepDashboardHeader** | ✅ Redesigned | 19 (100%) | 0 | Now matches Step 18 design with metrics |
| **MainAIGeneratorCard** | ✅ Redesigned | 0 (0%) | 2 | Now matches Step 9 design, ready for use |
| **AIActionButton** | ✅ Complete | 10 (53%) | 0 | Already using shared component |
| **StepTabs** | 🔴 Pending | 0 (0%) | 17 | All tabs need migration |
| **StepAlerts** | 🟡 Pending | 0 (0%) | 9 | 9 files have Alert imports |
| **ViewModeToggle** | 🟡 Pending | 0 (0%) | 2 | Step5KPIs, Step7Timeline use viewMode |

### Files with Alert Imports (9 files need StepAlerts migration)

| File | Alert Import Line | Current Usage |
|------|-------------------|---------------|
| Step5KPIs.jsx | L11 | `Alert, AlertDescription` |
| Step6ActionPlans.jsx | L14 | `Alert, AlertDescription` |
| Step7Risks.jsx | L13 | `Alert, AlertDescription` |
| Step8Review.jsx | L5 | `Alert, AlertDescription` |
| Step13Resources.jsx | L11 | `Alert, AlertDescription` |
| Step15Governance.jsx | L12 | `Alert, AlertDescription` |
| Step16Communication.jsx | L12 | `Alert, AlertDescription` |
| Step17Change.jsx | L13 | `Alert, AlertDescription, AlertTitle` |
| Step18Review.jsx | L5 | `Alert, AlertDescription, AlertTitle` |

---

## Full Step Assessment

### Step 1: Context (`Step1Context.jsx` - 885 lines)

**Status**: Needs MainAIGeneratorCard + StepTabs migration

#### Current Implementation
```jsx
// Line 10: Tabs import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lines 18-23: Dashboard import
import { StepDashboardHeader, DistributionChart, QualityMetrics, RecommendationsCard } from '../shared';

// Lines 206-224: Custom AI Card (REPLACE with MainAIGeneratorCard)
{!isReadOnly && (
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
          {isGenerating ? <Loader2 className="..." /> : <Sparkles className="..." />}
          {t({ en: 'Generate', ar: 'إنشاء' })}
        </Button>
      </div>
    </CardContent>
  </Card>
)}

// Lines 228-246: Raw Tabs (REPLACE with StepTabs)
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="identity">Identity</TabsTrigger>
    <TabsTrigger value="scope">Scope</TabsTrigger>
    <TabsTrigger value="discovery">Discovery</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ✅ Replace Lines 206-224 with `MainAIGeneratorCard`
2. ✅ Replace Lines 228-246 with `StepTabs`
3. ❌ No StepAlerts needed (no Alert import)

**Effort**: 1.5 hours

---

### Step 2: Vision & Values (`Step2Vision.jsx` - 643 lines)

**Status**: Needs MainAIGeneratorCard + StepTabs migration

#### Current Implementation
```jsx
// Lines 18-22: Dashboard import
import { StepDashboardHeader, QualityMetrics, RecommendationsCard } from '../shared';

// Lines 207-226: Custom AI Card (REPLACE)
{!isReadOnly && (
  <Card className="border-primary/20">
    <CardContent className="py-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t({ en: 'AI-Powered Generation', ar: '...' })}
          </h4>
          ...
        </div>
        <Button onClick={onGenerateAI} disabled={isGenerating || !data.name_en}>...</Button>
      </div>
    </CardContent>
  </Card>
)}

// Lines 230-246: Raw Tabs (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="values">Core Values</TabsTrigger>
    <TabsTrigger value="pillars">Strategic Pillars</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ✅ Replace Lines 207-226 with `MainAIGeneratorCard`
2. ✅ Replace Lines 230-246 with `StepTabs`
3. ❌ No StepAlerts needed

**Effort**: 1 hour

---

### Step 3: SWOT Analysis (`Step2SWOT.jsx` - 667 lines) 🟢 QUICK WIN

**Status**: Only needs StepTabs migration - already using AIActionButton!

#### Current Implementation
```jsx
// Line 17: Already imports AIActionButton ✅
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, StatsGrid, AIActionButton } from '../shared';

// Lines 378-385: AIActionButton already in use ✅
<AIActionButton
  label={t({ en: 'Generate SWOT', ar: 'إنشاء SWOT' })}
  onAction={onGenerateAI}
  isLoading={isGenerating}
/>

// Lines 388-406: Raw Tabs (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4 mb-4">
    <TabsTrigger value="matrix">Matrix</TabsTrigger>
    <TabsTrigger value="list">List</TabsTrigger>
    <TabsTrigger value="strategies">Strategies</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ AIActionButton already using shared component
2. ✅ Replace Lines 388-406 with `StepTabs`
3. ❌ No StepAlerts needed

**Effort**: 30 minutes

---

### Step 4: Strategic Objectives (`Step3Objectives.jsx` - 841 lines)

**Status**: Only needs StepTabs migration - has special modal (keep as-is)

#### Current Implementation
```jsx
// Line 21: Dashboard import
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

// AI: Uses custom proposal modal for AI-generated objective review
// Lines 35-40: showProposalModal, proposedObjective state
// This is SPECIALIZED - cannot replace with MainAIGeneratorCard

// Lines 433-452: Raw Tabs (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="list">List</TabsTrigger>
    <TabsTrigger value="sectors">By Sector</TabsTrigger>
    <TabsTrigger value="priority">By Priority</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ Keep custom modal - specialized for objective proposal review
2. ✅ Replace Lines 433-452 with `StepTabs`
3. ❌ No StepAlerts needed

**Effort**: 45 minutes

---

### Step 5: Stakeholders (`Step3Stakeholders.jsx` - 720 lines) 🟢 QUICK WIN

**Status**: Only needs StepTabs migration - already using AIActionButton!

#### Current Implementation
```jsx
// Lines 21-27: Already imports AIActionButton ✅
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';

// Lines 220-228: AIActionButton already in use ✅
<AIActionButton
  label={t({ en: 'Suggest Stakeholders', ar: 'اقتراح أصحاب المصلحة' })}
  onAction={onGenerateAI}
  isLoading={isGenerating}
  description={t({ en: 'Auto-identify stakeholders based on your plan context', ar: '...' })}
/>

// Lines 232-251: Raw Tabs (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="list">List</TabsTrigger>
    <TabsTrigger value="matrix">Matrix</TabsTrigger>
    <TabsTrigger value="engagement">Plan</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ AIActionButton already using shared component
2. ✅ Replace Lines 232-251 with `StepTabs`
3. ❌ No StepAlerts needed

**Effort**: 30 minutes

---

### Step 6: PESTEL Analysis (`Step4PESTEL.jsx` - 831 lines) 🟢 QUICK WIN

**Status**: Only needs StepTabs migration - already using AIActionButton!

#### Current Implementation
```jsx
// Line 19: Already imports AIActionButton ✅
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';

// Lines 270-278: AIActionButton in use ✅
<AIActionButton
  label={t({ en: 'Analyze Factors', ar: 'تحليل العوامل' })}
  onAction={onGenerateAI}
  isLoading={isGenerating}
  variant="outline"
/>

// Lines 282-300: Raw Tabs (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4 mb-4">
    <TabsTrigger value="factors">Factors</TabsTrigger>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="impact">Impact</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ AIActionButton already using shared component
2. ✅ Replace Lines 282-300 with `StepTabs`
3. ❌ No StepAlerts needed

**Effort**: 30 minutes

---

### Step 7: National Alignment (`Step4NationalAlignment.jsx` - 585 lines)

**Status**: Needs StepTabs migration + optional AI migration

#### Current Implementation
```jsx
// Line 14: Dashboard import (no AIActionButton)
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

// Lines 203-219: Custom AI Button (optional migration)
<Card className="border-primary/30 bg-primary/5">
  <CardContent className="pt-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h4 className="font-semibold">{t({ en: 'AI-Powered Alignment', ar: '...' })}</h4>
        <p className="text-sm text-muted-foreground">...</p>
      </div>
      <Button onClick={onGenerateAI} disabled={isGenerating || objectives.length === 0}>
        {isGenerating ? <Loader2 /> : <Sparkles />}
        {t({ en: 'Suggest Alignments', ar: '...' })}
      </Button>
    </div>
  </CardContent>
</Card>

// Lines 232-250: Raw Tabs (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="matrix">Matrix</TabsTrigger>
    <TabsTrigger value="objectives">By Objective</TabsTrigger>
    <TabsTrigger value="programs">By Program</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. 🟡 Optional: Replace custom AI card with `MainAIGeneratorCard` variant="compact"
2. ✅ Replace Lines 232-250 with `StepTabs`
3. ❌ No StepAlerts needed

**Effort**: 45 minutes

---

### Step 8: KPIs (`Step5KPIs.jsx` - 1094 lines) ⚠️ SPECIAL

**Status**: Needs StepTabs + StepAlerts migration

#### Current Implementation
```jsx
// Line 11: Alert import ⚠️
import { Alert, AlertDescription } from "@/components/ui/alert";

// Line 19: Dashboard + AIActionButton imports ✅
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';

// Lines 670-688: ViewMode Tabs (REPLACE)
<Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
  <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
    <TabsTrigger value="byObjective">By Objective</TabsTrigger>
    <TabsTrigger value="byCategory">By Category</TabsTrigger>
    <TabsTrigger value="matrix">Matrix</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ AIActionButton already using shared component
2. ✅ Replace Lines 670-688 with `StepTabs`
3. ✅ Replace Alert usage with `StepAlerts` (L11)
4. 🟡 Consider using `ViewModeToggle` instead if viewMode pattern preferred

**Effort**: 1.5 hours

---

### Step 9: Action Plans (`Step6ActionPlans.jsx` - 1200 lines)

**Status**: Needs StepTabs + StepAlerts migration

#### Current Implementation
```jsx
// Line 14: Alert import ⚠️
import { Alert, AlertDescription } from "@/components/ui/alert";

// Line 25: Dashboard + AIActionButton imports ✅
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';

// Lines 810-828: ViewMode Tabs (REPLACE)
<Tabs value={viewMode} onValueChange={setViewMode}>
  <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
    <TabsTrigger value="objectives">By Objective</TabsTrigger>
    <TabsTrigger value="types">By Type</TabsTrigger>
    <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ AIActionButton already using shared component
2. ✅ Replace Lines 810-828 with `StepTabs`
3. ✅ Replace Alert usage with `StepAlerts` (L14)

**Effort**: 1.5 hours

---

### Step 10: Scenarios (`Step6Scenarios.jsx` - 784 lines)

**Status**: Needs StepTabs migration + optional AI migration

#### Current Implementation
```jsx
// Line 19: Dashboard import (no AIActionButton)
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

// Lines 462-474: Custom AI Button (optional migration)
<Button variant="outline" onClick={onGenerateAI} disabled={isGenerating}>
  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
  {isGenerating ? t({ en: 'Generating...', ar: '...' }) : t({ en: 'Generate Scenarios', ar: '...' })}
</Button>

// Lines 478-496: Raw Tabs (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4 mb-4">
    <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
    <TabsTrigger value="comparison">Compare</TabsTrigger>
    <TabsTrigger value="probability">Probability</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. 🟡 Optional: Add AIActionButton import and use it
2. ✅ Replace Lines 478-496 with `StepTabs`
3. ❌ No StepAlerts needed

**Effort**: 45 minutes

---

### Step 11: Risk Assessment (`Step7Risks.jsx` - 869 lines)

**Status**: Needs StepTabs + StepAlerts migration

#### Current Implementation
```jsx
// Line 13: Alert import ⚠️
import { Alert, AlertDescription } from "@/components/ui/alert";

// Line 24: Dashboard + AIActionButton imports ✅
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';

// Lines 616-634: Raw Tabs (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4 mb-4">
    <TabsTrigger value="register">Register</TabsTrigger>
    <TabsTrigger value="matrix">Matrix</TabsTrigger>
    <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ AIActionButton already using shared component
2. ✅ Replace Lines 616-634 with `StepTabs`
3. ✅ Replace Alert usage with `StepAlerts` (L13)

**Effort**: 1.5 hours

---

### Step 12: Timeline (`Step7Timeline.jsx` - 1145 lines)

**Status**: Needs StepTabs migration

#### Current Implementation
```jsx
// Line 21: Dashboard + AIActionButton imports ✅
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';

// Lines 501-519: ViewMode Tabs (REPLACE)
<Tabs value={viewMode} onValueChange={setViewMode}>
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="phases">Phases</TabsTrigger>
    <TabsTrigger value="milestones">Milestones</TabsTrigger>
    <TabsTrigger value="gantt">Gantt View</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ AIActionButton already using shared component
2. ✅ Replace Lines 501-519 with `StepTabs`
3. ❌ No StepAlerts needed

**Effort**: 1 hour

---

### Step 13: Dependencies (`Step8Dependencies.jsx` - 1054 lines)

**Status**: Needs StepTabs migration (5 tabs!)

#### Current Implementation
```jsx
// Line 19: Dashboard + AIActionButton imports ✅
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';

// Lines 283-308: Raw Tabs with 5 columns (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-5">
    <TabsTrigger value="dependencies">Deps</TabsTrigger>
    <TabsTrigger value="constraints">Const.</TabsTrigger>
    <TabsTrigger value="assumptions">Assump.</TabsTrigger>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ AIActionButton already using shared component
2. ✅ Replace Lines 283-308 with `StepTabs` (note: 5 tabs)
3. ❌ No StepAlerts needed

**Effort**: 1 hour

---

### Step 14: Mid-Review (`Step8Review.jsx` - 624 lines) ⏭️ SKIP TABS

**Status**: Needs StepAlerts migration only - NO TABS

#### Current Implementation
```jsx
// Line 5: Alert import ⚠️
import { Alert, AlertDescription } from "@/components/ui/alert";

// Line 19: Dashboard import (no AIActionButton - not needed for review)
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

// Lines 361-371: Alert usage (REPLACE with StepAlerts)
{errors.length > 0 && (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      <ul className="list-disc ml-4">
        {errors.map((err, i) => (<li key={i}>{err}</li>))}
      </ul>
    </AlertDescription>
  </Alert>
)}

// NO TABS in this file - review step uses card grid layout
```

#### Migration Tasks
1. ❌ No tabs - this is a review step with card grid
2. ✅ Replace Alert usage with `StepAlerts` (L5)
3. ❌ No AI needed for review step

**Effort**: 30 minutes

---

### Step 15: Resources (`Step13Resources.jsx` - 932 lines)

**Status**: Needs StepTabs + StepAlerts migration

#### Current Implementation
```jsx
// Line 11: Alert import ⚠️
import { Alert, AlertDescription } from "@/components/ui/alert";

// Line 23: Dashboard + AIActionButton imports ✅
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';

// Lines 603-611: Alert usage (REPLACE)
{alerts.length > 0 && (
  <div className="space-y-2">
    {alerts.map((alert, idx) => (
      <Alert key={idx} variant={alert.type === 'error' ? 'destructive' : 'default'}>
        {alert.type === 'error' ? <AlertCircle /> : <AlertTriangle />}
        <AlertDescription>{alert.message}</AlertDescription>
      </Alert>
    ))}
  </div>
)}

// Lines 615-633: Raw Tabs (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4 mb-4">
    <TabsTrigger value="categories">By Category</TabsTrigger>
    <TabsTrigger value="timeline">Timeline</TabsTrigger>
    <TabsTrigger value="matrix">Matrix</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ AIActionButton already using shared component
2. ✅ Replace Lines 615-633 with `StepTabs`
3. ✅ Replace Alert usage (L603-611) with `StepAlerts`

**Effort**: 1.5 hours

---

### Step 16: Governance (`Step15Governance.jsx` - 1235 lines) ⚠️ COMPLEX

**Status**: Needs StepTabs + StepAlerts + optional AI migration

#### Current Implementation
```jsx
// Line 12: Alert import ⚠️
import { Alert, AlertDescription } from "@/components/ui/alert";

// Line 22: Dashboard import (no AIActionButton)
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

// Lines 423-427: Custom AI Button (optional migration)
<Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
  {isGenerating ? t({ en: 'Generating...', ar: '...' }) : t({ en: 'Generate', ar: 'إنشاء' })}
</Button>

// Lines 431-439: Alert usage (REPLACE)
{alerts.length > 0 && (
  <div className="space-y-2">
    {alerts.map((alert, idx) => (
      <Alert key={idx} variant={alert.type === 'error' ? 'destructive' : 'default'}>...</Alert>
    ))}
  </div>
)}

// Lines 442-456: ViewMode buttons (cards | structure | summary)
// This is a CUSTOM viewMode using Button toggles, not tabs

// Lines 577-604: Nested Tabs inside 'cards' viewMode (5 tabs!) (REPLACE)
{viewMode === 'cards' && (
  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    <TabsList className="grid w-full grid-cols-5 mb-4">
      <TabsTrigger value="committees">Committees</TabsTrigger>
      <TabsTrigger value="roles">Roles</TabsTrigger>
      <TabsTrigger value="escalation">Escalation</TabsTrigger>
      <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
      <TabsTrigger value="raci">RACI</TabsTrigger>
    </TabsList>
```

#### Special Notes
- Has dual navigation: ViewMode buttons (L442-456) + Tabs inside 'cards' (L577-604)
- ViewMode buttons could be replaced with `ViewModeToggle`
- Tabs are nested inside viewMode='cards' condition

#### Migration Tasks
1. 🟡 Optional: Add AIActionButton import and replace custom button
2. 🟡 Consider using `ViewModeToggle` for viewMode buttons
3. ✅ Replace Lines 577-604 with `StepTabs` (note: 5 tabs, nested)
4. ✅ Replace Alert usage (L431-439) with `StepAlerts`

**Effort**: 2 hours

---

### Step 17: Communication (`Step16Communication.jsx` - 1142 lines)

**Status**: Needs StepTabs + StepAlerts migration

#### Current Implementation
```jsx
// Line 12: Alert import ⚠️
import { Alert, AlertDescription } from "@/components/ui/alert";

// Line 24: Dashboard import (no AIActionButton - none needed)
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

// Lines 950-976: Raw Tabs with 5 columns (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
  <TabsList className="grid w-full grid-cols-5">
    <TabsTrigger value="audiences">Audiences</TabsTrigger>
    <TabsTrigger value="messages">Messages</TabsTrigger>
    <TabsTrigger value="internal">Internal</TabsTrigger>
    <TabsTrigger value="external">External</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
</Tabs>
```

#### Migration Tasks
1. ❌ No AI button needed for this step
2. ✅ Replace Lines 950-976 with `StepTabs` (note: 5 tabs)
3. ✅ Replace Alert usage with `StepAlerts` (L12)

**Effort**: 1.5 hours

---

### Step 18: Change Management (`Step17Change.jsx` - 1482 lines) ⚠️ LARGEST FILE

**Status**: Needs StepTabs + StepAlerts migration

#### Current Implementation
```jsx
// Line 13: Alert import with AlertTitle ⚠️
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Line 23: Dashboard import (no AIActionButton - none needed)
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, StatsGrid } from '../shared';

// Lines 1177-1207: Raw Tabs with 6 columns (REPLACE)
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid grid-cols-6 w-full">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="impacts">Impacts</TabsTrigger>
    <TabsTrigger value="resistance">Resist.</TabsTrigger>
    <TabsTrigger value="training">Training</TabsTrigger>
    <TabsTrigger value="activities">Activities</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

#### Migration Tasks
1. ❌ No AI button needed for this step
2. ✅ Replace Lines 1177-1207 with `StepTabs` (note: 6 tabs!)
3. ✅ Replace Alert usage with `StepAlerts` (L13, includes AlertTitle)

**Effort**: 2 hours

---

### Step 19: Final Review (`Step18Review.jsx` - 1076 lines) ⚠️ SPECIAL

**Status**: Needs StepAlerts migration - has specialized AIAnalyzer

#### Current Implementation
```jsx
// Line 5: Alert import with AlertTitle ⚠️
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Line 27: Dashboard import
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

// Line 28: Uses specialized AIStrategicPlanAnalyzer (KEEP)
import AIStrategicPlanAnalyzer from '../AIStrategicPlanAnalyzer';

// Has tabs but they're part of AIAnalyzer component rendering
```

#### Migration Tasks
1. ❌ Keep AIStrategicPlanAnalyzer - specialized component
2. 🟡 Review tab structure inside AIAnalyzer if needed
3. ✅ Replace Alert usage with `StepAlerts` (L5, includes AlertTitle)

**Effort**: 1.5 hours

---

## Migration Priority Matrix

### 🟢 Quick Wins (Tabs Only - 30 min each)
1. **Step2SWOT** - Already has AIActionButton
2. **Step3Stakeholders** - Already has AIActionButton  
3. **Step4PESTEL** - Already has AIActionButton

### 🟡 Standard Migrations (1-1.5 hours each)
4. **Step3Objectives** - Tabs only (keep modal)
5. **Step4NationalAlignment** - Tabs + optional AI
6. **Step6Scenarios** - Tabs + optional AI
7. **Step7Timeline** - Tabs only
8. **Step8Dependencies** - Tabs only (5 tabs)
9. **Step8Review** - Alerts only (no tabs)

### 🔴 Full Migrations (1.5-2 hours each)
10. **Step1Context** - MainAI + Tabs
11. **Step2Vision** - MainAI + Tabs
12. **Step5KPIs** - Tabs + Alerts
13. **Step6ActionPlans** - Tabs + Alerts
14. **Step7Risks** - Tabs + Alerts
15. **Step13Resources** - Tabs + Alerts
16. **Step16Communication** - Tabs + Alerts (5 tabs)

### ⚠️ Complex Migrations (2+ hours each)
17. **Step15Governance** - ViewMode + Tabs + Alerts (nested)
18. **Step17Change** - Tabs + Alerts (6 tabs, largest file)
19. **Step18Review** - Alerts + special AIAnalyzer

---

## Estimated Total Effort

| Category | Steps | Est. Hours |
|----------|-------|------------|
| Quick Wins (Tabs only) | 3 | 1.5 |
| Standard Migrations | 6 | 7.5 |
| Full Migration | 6 | 9 |
| Complex | 4 | 8 |
| **Dashboard Fixes** | **19** | **~10** |
| **AI Prompt Extraction** | **1** | **~4** |
| **Total** | **19 steps** | **~40 hours** |

### Breakdown by Task Type

| Task | Files Affected | Hours Each | Total |
|------|----------------|------------|-------|
| StepTabs migration | 17 | 0.5-2 | ~16 |
| StepAlerts migration | 9 | 0.5 | ~4.5 |
| MainAIGeneratorCard | 2 | 1 | ~2 |
| Dashboard metrics update | 19 | 0.5 | ~10 |
| ViewModeToggle | 2 | 0.5 | ~1 |
| AI Prompt extraction | 1 | 4 | ~4 |

---

## Implementation Patterns

### Pattern 1: StepTabs Migration
```jsx
// BEFORE
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    ...
  </TabsList>
  <TabsContent value="tab1">...</TabsContent>
</Tabs>

// AFTER
import { StepTabs, StepTabContent } from '../shared';

<StepTabs
  tabs={[
    { id: 'tab1', label: { en: 'Tab 1', ar: 'تبويب 1' }, icon: Icon1 },
    ...
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
>
  <StepTabContent value="tab1">...</StepTabContent>
</StepTabs>
```

### Pattern 2: StepAlerts Migration
```jsx
// BEFORE
import { Alert, AlertDescription } from "@/components/ui/alert";

{alerts.length > 0 && (
  <div className="space-y-2">
    {alerts.map((alert, idx) => (
      <Alert key={idx} variant={alert.type === 'error' ? 'destructive' : 'default'}>
        <AlertDescription>{alert.message}</AlertDescription>
      </Alert>
    ))}
  </div>
)}

// AFTER
import { StepAlerts } from '../shared';

<StepAlerts alerts={alerts} maxVisible={3} collapsible={true} />
```

### Pattern 3: MainAIGeneratorCard Migration (Step 9 Style)
```jsx
// BEFORE (Custom Card Implementation)
{!isReadOnly && (
  <Card className="border-primary/20">
    <CardContent className="py-4">
      <div className="flex items-center justify-between">
        <div>
          <h4><Sparkles /> AI-Powered Generation</h4>
          <p>Generate based on context...</p>
        </div>
        <Button onClick={onGenerateAI} disabled={isGenerating}>
          {isGenerating ? <Loader2 /> : <Sparkles />} Generate
        </Button>
      </div>
    </CardContent>
  </Card>
)}

// AFTER (Using MainAIGeneratorCard - Step 9 Design)
import { MainAIGeneratorCard } from '../shared';

// Basic usage (Generate All only)
<MainAIGeneratorCard
  title={{ en: 'AI-Powered Generation', ar: 'التوليد بالذكاء الاصطناعي' }}
  description={{ en: 'Generate content based on your strategic context', ar: '...' }}
  onGenerate={onGenerateAI}
  isGenerating={isGenerating}
  isReadOnly={isReadOnly}
/>

// With "AI Add One" button (like Step3Objectives)
<MainAIGeneratorCard
  title={{ en: 'AI-Powered Objectives', ar: 'الأهداف بالذكاء الاصطناعي' }}
  description={{ en: 'Generate sector-specific objectives based on your context', ar: '...' }}
  onGenerate={handleGenerateAll}
  onGenerateSingle={handleGenerateSingle}
  isGenerating={isGenerating}
  isGeneratingSingle={isGeneratingSingle}
  showSingleButton={true}
  isReadOnly={isReadOnly}
/>
```

**MainAIGeneratorCard Variants:**
- `card` (default) - Full card with title/description left, buttons right
- `button` - Compact button only
- `inline` - Inline with other controls  
- `compact` - Smaller card variant

### Pattern 4: StepDashboardHeader Migration (Step 18 Style)
```jsx
// BEFORE (Basic Dashboard)
<StepDashboardHeader
  score={completenessScore}
  stats={[...]}
  title="Section Progress"
  subtitle="Track your progress"
  language={language}
/>

// AFTER (Full Step 18 Style with Metrics)
<StepDashboardHeader
  score={completenessScore}
  title={{ en: 'Readiness Score', ar: 'درجة الجاهزية' }}
  subtitle={{ completed: completedSections, total: totalSections }}
  stats={[
    { icon: Target, value: objectives.length, label: t({ en: 'Objectives', ar: 'الأهداف' }), iconColor: 'text-primary' },
    { icon: Activity, value: kpis.length, label: t({ en: 'KPIs', ar: 'المؤشرات' }), iconColor: 'text-blue-500' },
    { icon: Briefcase, value: actions.length, label: t({ en: 'Actions', ar: 'الإجراءات' }), iconColor: 'text-purple-500' },
    { icon: AlertTriangle, value: risks.length, label: t({ en: 'Risks', ar: 'المخاطر' }), iconColor: 'text-amber-500' },
    { icon: Users, value: stakeholders.length, label: t({ en: 'Stakeholders', ar: 'الأطراف' }), iconColor: 'text-teal-500' },
  ]}
  metrics={[
    { label: t({ en: 'KPI Coverage', ar: 'تغطية المؤشرات' }), value: kpiCoverage },
    { label: t({ en: 'Action Coverage', ar: 'تغطية الإجراءات' }), value: actionCoverage },
    { label: t({ en: 'Risk Mitigation', ar: 'تخفيف المخاطر' }), value: riskMitigation },
    { label: t({ en: 'Engagement', ar: 'المشاركة' }), value: stakeholderEngagement },
    { label: t({ en: 'Bilingual', ar: 'ثنائي اللغة' }), value: bilingualCoverage },
  ]}
  language={language}
/>
```

**StepDashboardHeader Props:**
| Prop | Type | Description |
|------|------|-------------|
| `score` | number | Completion score (0-100) |
| `stats` | array | Stat cards `[{ icon, value, label, iconColor, subValue }]` |
| `metrics` | array | Progress bars `[{ label, value }]` (optional) |
| `title` | string \| object | Score section title |
| `subtitle` | string \| object | `{ completed, total }` for sections count |
| `language` | string | Current language ('en' \| 'ar') |

---

## Testing Checklist

For each migrated step, verify:

- [ ] Dashboard header displays correctly
- [ ] AI generation works (if applicable)
- [ ] Tab navigation works
- [ ] Tab content renders correctly
- [ ] Alerts display and dismiss properly
- [ ] RTL layout works
- [ ] Responsive design works
- [ ] No console errors
- [ ] All existing functionality preserved

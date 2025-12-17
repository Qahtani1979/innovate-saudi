# Wizard Step Standardization - Complete Migration Guide

> **Last Updated**: December 2024  
> **Status**: Phase 1 Complete - Ready for Migration  
> **Analysis Based On**: Verified file inspection of all 19 step components

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

### Verified File Structure (19 Files Total)

| File | Lines | Dashboard | AI Component | Tab System | Tab Count | Alert |
|------|-------|-----------|--------------|------------|-----------|-------|
| Step1Context.jsx | 885 | ✅ L19 | ❌ Custom Card L206 | ✅ Raw Tabs L229 | 4 cols | ❌ |
| Step2Vision.jsx | 643 | ✅ L19 | ❌ Custom Card L207 | ✅ Raw Tabs L231 | 3 cols | ❌ |
| Step2SWOT.jsx | 667 | ✅ L17 | ✅ AIActionButton L17 | ✅ Raw Tabs L389 | 4 cols | ❌ |
| Step3Objectives.jsx | 841 | ✅ L21 | ❌ Custom Modal L35 | ✅ Raw Tabs | 3 cols | ❌ |
| Step3Stakeholders.jsx | 720 | ✅ L22 | ✅ AIActionButton L26 | ✅ Raw Tabs L233 | 4 cols | ❌ |
| Step4PESTEL.jsx | 831 | ✅ L19 | ✅ AIActionButton L19 | ✅ Raw Tabs L283 | 4 cols | ❌ |
| Step4NationalAlignment.jsx | 585 | ✅ L14 | ❌ None | ✅ Raw Tabs | 3 cols | ❌ |
| Step5KPIs.jsx | 1094 | ✅ L19 | ✅ AIActionButton L19 | ✅ ViewMode Tabs L671 | 3 modes | ✅ L11 |
| Step6ActionPlans.jsx | 1200 | ✅ L25 | ✅ AIActionButton L25 | ✅ Raw Tabs L809 | 4 cols | ✅ L14 |
| Step6Scenarios.jsx | 784 | ✅ L19 | ❌ None | ✅ Raw Tabs L479 | 4 cols | ❌ |
| Step7Risks.jsx | 869 | ✅ L24 | ✅ AIActionButton L24 | ✅ Raw Tabs | 4 cols | ✅ L13 |
| Step7Timeline.jsx | 1145 | ✅ L21 | ✅ AIActionButton L21 | ✅ ViewMode Tabs L502 | 4 cols | ❌ |
| Step8Dependencies.jsx | 1054 | ✅ L19 | ✅ AIActionButton L19 | ✅ Raw Tabs L284 | **5 cols** | ❌ |
| Step8Review.jsx | 624 | ✅ L19 | ❌ None | ❌ No Tabs | - | ✅ L5 |
| Step13Resources.jsx | 932 | ✅ L23 | ✅ AIActionButton L23 | ✅ Raw Tabs L616 | 4 cols | ✅ L11 |
| Step15Governance.jsx | 1235 | ✅ L22 | ❌ Custom Button L423 | ✅ Nested Tabs L578 | **5 cols** | ✅ L12 |
| Step16Communication.jsx | 1142 | ✅ L24 | ❌ None | ✅ Raw Tabs L951 | **5 cols** | ✅ L12 |
| Step17Change.jsx | 1482 | ✅ L23 | ❌ None | ✅ Raw Tabs L1178 | **6 cols** | ✅ L13 |
| Step18Review.jsx | 1076 | ✅ L27 | ❌ AIAnalyzer L28 | ✅ Has Tabs | varies | ✅ L5 |

### Summary Statistics

| Pattern | Already Using Shared | Needs Migration | Notes |
|---------|---------------------|-----------------|-------|
| StepDashboardHeader | 19 (100%) | 0 | ✅ Complete |
| AIActionButton | 10 (53%) | 2 custom cards, 1 modal, 6 none | 🟡 Partial |
| StepTabs | 0 (0%) | 17 files | 🔴 All need migration |
| StepAlerts | 0 (0%) | 8 files with Alert imports | 🟡 8 have custom alerts |
| MainAIGeneratorCard | 0 (0%) | 2 have custom cards | 🔴 Step1, Step2 |

### Quick Reference: What Each Step Needs

| Step | File | StepTabs | MainAI | StepAlerts | Priority |
|------|------|----------|--------|------------|----------|
| 1 | Step1Context | ✅ 4 tabs | ✅ Custom→MainAI | ❌ | Medium |
| 2 | Step2Vision | ✅ 3 tabs | ✅ Custom→MainAI | ❌ | Medium |
| 3 | Step2SWOT | ✅ 4 tabs | ❌ Has AIActionBtn | ❌ | 🟢 Quick Win |
| 4 | Step3Objectives | ✅ 3 tabs | ❌ Keep modal | ❌ | Complex |
| 5 | Step3Stakeholders | ✅ 4 tabs | ❌ Has AIActionBtn | ❌ | 🟢 Quick Win |
| 6 | Step4PESTEL | ✅ 4 tabs | ❌ Has AIActionBtn | ❌ | 🟢 Quick Win |
| 7 | Step4NationalAlignment | ✅ 3 tabs | ❌ Optional | ❌ | Easy |
| 8 | Step5KPIs | ⚠️ ViewMode | ❌ Has AIActionBtn | ✅ Migrate | Special |
| 9 | Step6ActionPlans | ✅ 4 tabs | ❌ Has AIActionBtn | ✅ Migrate | Standard |
| 10 | Step6Scenarios | ✅ 4 tabs | ❌ Optional | ❌ | Easy |
| 11 | Step7Risks | ✅ 4 tabs | ❌ Has AIActionBtn | ✅ Migrate | Standard |
| 12 | Step7Timeline | ⚠️ ViewMode | ❌ Has AIActionBtn | ❌ | Standard |
| 13 | Step8Dependencies | ✅ **5 tabs** | ❌ Has AIActionBtn | ❌ | Standard |
| 14 | Step8Review | ❌ No tabs | ❌ None needed | ✅ Migrate | Skip |
| 15 | Step13Resources | ✅ 4 tabs | ❌ Has AIActionBtn | ✅ Migrate | Standard |
| 16 | Step15Governance | ✅ **5 tabs** | ❌ Has custom btn | ✅ Migrate | Complex |
| 17 | Step16Communication | ✅ **5 tabs** | ❌ None | ✅ Migrate | Complex |
| 18 | Step17Change | ✅ **6 tabs** | ❌ None | ✅ Migrate | Complex |
| 19 | Step18Review | ⚠️ Has tabs | ❌ AIAnalyzer | ✅ Migrate | Special |

---

## Phase 1: Core Components

### ✅ Completed Components

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| `MainAIGeneratorCard` | `shared/MainAIGeneratorCard.jsx` | Bulk AI generation | ✅ Ready |
| `StepAlerts` | `shared/StepAlerts.jsx` | Validation alerts | ✅ Ready |
| `StepTabs` | `shared/StepTabs.jsx` | Tab navigation | ✅ Ready |
| `StepLayout` | `shared/StepLayout.jsx` | Master layout wrapper | ✅ Ready |
| `ViewModeToggle` | `shared/ViewModeToggle.jsx` | View mode switching | ✅ Ready |

### Pre-existing Components (In Use)

| Component | Import Location | Used By |
|-----------|-----------------|---------|
| `StepDashboardHeader` | `shared/StepDashboardHeader.jsx` | All 19 steps ✅ |
| `AIActionButton` | `shared/AIActionButton.jsx` | 10 steps |
| `QualityMetrics` | `shared/QualityMetrics.jsx` | Most steps |
| `DistributionChart` | `shared/DistributionChart.jsx` | Most steps |
| `RecommendationsCard` | `shared/RecommendationsCard.jsx` | Some steps |

---

## Phase 2: Step-by-Step Gap Analysis

---

### Step 1: Context (`Step1Context.jsx` - 885 lines)

**Complexity**: High | **Effort**: 2 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 19 import, Lines 173-202 render
- **AI Card**: Custom Card - **Lines 206-225** (needs MainAIGeneratorCard)
- **Tabs**: Raw Tabs - **Line 229** (`grid-cols-4`)
- **Alerts**: None

#### Tab Structure (4 tabs at Line 229)
```jsx
<TabsList className="grid w-full grid-cols-4">
  <TabsTrigger value="identity">Identity</TabsTrigger>
  <TabsTrigger value="scope">Scope</TabsTrigger>
  <TabsTrigger value="discovery">Discovery</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
</TabsList>
```

#### Migration Tasks
1. Replace Lines 206-225 with `MainAIGeneratorCard`
2. Replace Lines 228-246 with `StepTabs`

---

### Step 2: Vision & Values (`Step2Vision.jsx` - 643 lines)

**Complexity**: Medium | **Effort**: 1.5 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 19 import, Lines 173-204 render
- **AI Card**: Custom Card - **Lines 207-227** (needs MainAIGeneratorCard)
- **Tabs**: Raw Tabs - **Line 231** (`grid-cols-3`)
- **Alerts**: None

#### Tab Structure (3 tabs at Line 231)
```jsx
<TabsList className="grid w-full grid-cols-3">
  <TabsTrigger value="values">Core Values</TabsTrigger>
  <TabsTrigger value="pillars">Pillars</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
</TabsList>
```

---

### Step 3: SWOT Analysis (`Step2SWOT.jsx` - 667 lines) 🟢 QUICK WIN

**Complexity**: Low | **Effort**: 30 minutes

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 17 import
- **AI**: `AIActionButton` - **Line 17** ✅ Already using shared!
- **Tabs**: Raw Tabs - **Line 389** (`grid-cols-4`)
- **Alerts**: None

#### Tab Structure (4 tabs at Line 389)
```jsx
<TabsList className="grid w-full grid-cols-4 mb-4">
  <TabsTrigger value="matrix">Matrix</TabsTrigger>
  <TabsTrigger value="list">List</TabsTrigger>
  <TabsTrigger value="strategies">Strategies</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
</TabsList>
```

#### 🟢 Only Tabs Migration Needed

---

### Step 4: Strategic Objectives (`Step3Objectives.jsx` - 841 lines)

**Complexity**: High | **Effort**: 2 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 21 import
- **AI**: Custom proposal modal - Lines 35-40 (keep - specialized)
- **Tabs**: Raw Tabs - `grid-cols-3`
- **Alerts**: None

#### Special Considerations
- Has unique `onGenerateSingleObjective` callback
- Uses proposal modal for AI-generated objective review
- **Cannot replace with MainAIGeneratorCard** - keep modal

---

### Step 5: Stakeholders (`Step3Stakeholders.jsx` - 720 lines) 🟢 QUICK WIN

**Complexity**: Low | **Effort**: 30 minutes

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 22 import
- **AI**: `AIActionButton` - **Line 26** ✅ Already using shared!
- **Tabs**: Raw Tabs - **Line 233** (`grid-cols-4`)
- **Alerts**: None

#### Tab Structure (4 tabs at Line 233)
```jsx
<TabsList className="grid w-full grid-cols-4">
  <TabsTrigger value="list">List</TabsTrigger>
  <TabsTrigger value="matrix">Matrix</TabsTrigger>
  <TabsTrigger value="engagement">Engagement</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
</TabsList>
```

#### 🟢 Only Tabs Migration Needed

---

### Step 6: PESTEL Analysis (`Step4PESTEL.jsx` - 831 lines) 🟢 QUICK WIN

**Complexity**: Low | **Effort**: 30 minutes

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 19 import
- **AI**: `AIActionButton` - **Line 19** ✅ Already using shared!
- **Tabs**: Raw Tabs - **Line 283** (`grid-cols-4`)
- **Alerts**: None

#### Tab Structure (4 tabs at Line 283)
```jsx
<TabsList className="grid w-full grid-cols-4 mb-4">
  <TabsTrigger value="factors">Factors</TabsTrigger>
  <TabsTrigger value="timeline">Timeline</TabsTrigger>
  <TabsTrigger value="impact">Impact</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
</TabsList>
```

#### 🟢 Only Tabs Migration Needed

---

### Step 7: National Alignment (`Step4NationalAlignment.jsx` - 585 lines)

**Complexity**: Low | **Effort**: 45 minutes

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 14 import
- **AI**: None
- **Tabs**: Raw Tabs - `grid-cols-3`
- **Alerts**: None

---

### Step 8: KPIs (`Step5KPIs.jsx` - 1094 lines) ⚠️ SPECIAL

**Complexity**: Very High | **Effort**: 2 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 19 import
- **AI**: `AIActionButton` - Line 19
- **Tabs**: **ViewMode Tabs** - **Line 671** (byObjective, byCategory, list)
- **Alerts**: Alert import - **Line 11** (needs StepAlerts)

#### ViewMode Structure (Line 671)
```jsx
<Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
  <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
    <TabsTrigger value="byObjective">By Objective</TabsTrigger>
    <TabsTrigger value="byCategory">By Category</TabsTrigger>
    <TabsTrigger value="list">List View</TabsTrigger>
  </TabsList>
```

#### Migration Notes
- Consider using `ViewModeToggle` component instead of StepTabs
- Has complex SMART scoring - keep custom logic

---

### Step 9: Action Plans (`Step6ActionPlans.jsx` - 1200 lines)

**Complexity**: Very High | **Effort**: 2 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 25 import
- **AI**: `AIActionButton` - Line 25
- **Tabs**: Raw Tabs - **Line 809** (`grid-cols-4`)
- **Alerts**: Alert import - **Line 14** (needs StepAlerts)

---

### Step 10: Scenarios (`Step6Scenarios.jsx` - 784 lines)

**Complexity**: Medium | **Effort**: 1 hour

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 19 import
- **AI**: None
- **Tabs**: Raw Tabs - **Line 479** (`grid-cols-4`)
- **Alerts**: None

#### Tab Structure (4 tabs at Line 479)
```jsx
<TabsList className="grid w-full grid-cols-4 mb-4">
  <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
  <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
  <TabsTrigger value="analysis">Analysis</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
</TabsList>
```

---

### Step 11: Risk Assessment (`Step7Risks.jsx` - 869 lines)

**Complexity**: High | **Effort**: 1.5 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 24 import
- **AI**: `AIActionButton` - Line 24
- **Tabs**: Raw Tabs - `grid-cols-4`
- **Alerts**: Alert import - **Line 13** (needs StepAlerts)

---

### Step 12: Timeline (`Step7Timeline.jsx` - 1145 lines)

**Complexity**: Very High | **Effort**: 1.5 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 21 import
- **AI**: `AIActionButton` - Line 21
- **Tabs**: **ViewMode Tabs** - **Line 502** (`grid-cols-4`)
- **Alerts**: None

#### ViewMode Structure (Line 502)
```jsx
<Tabs value={viewMode} onValueChange={setViewMode}>
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="phases">Phases</TabsTrigger>
    <TabsTrigger value="milestones">Milestones</TabsTrigger>
    <TabsTrigger value="gantt">Gantt</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
```

---

### Step 13: Dependencies (`Step8Dependencies.jsx` - 1054 lines)

**Complexity**: High | **Effort**: 1.5 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 19 import
- **AI**: `AIActionButton` - Line 19
- **Tabs**: Raw Tabs - **Line 284** (`grid-cols-5`) ⚠️ 5 tabs!
- **Alerts**: None

#### Tab Structure (5 tabs at Line 284)
```jsx
<TabsList className="grid w-full grid-cols-5">
  <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
  <TabsTrigger value="constraints">Constraints</TabsTrigger>
  <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
  <TabsTrigger value="analysis">Analysis</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
</TabsList>
```

---

### Step 14: Mid-Review (`Step8Review.jsx` - 624 lines) ⏭️ SKIP

**Complexity**: Medium | **Effort**: Skip for now

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 19 import
- **AI**: None needed (review step)
- **Tabs**: **None** - No tabs in this step
- **Alerts**: Alert import - **Line 5**

---

### Step 15: Resources (`Step13Resources.jsx` - 932 lines)

**Complexity**: High | **Effort**: 1.5 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 23 import
- **AI**: `AIActionButton` - Line 23
- **Tabs**: Raw Tabs - **Line 616** (`grid-cols-4`)
- **Alerts**: Alert import - **Line 11** (needs StepAlerts)

#### Tab Structure (4 tabs at Line 616)
```jsx
<TabsList className="grid w-full grid-cols-4 mb-4">
  <TabsTrigger value="categories">Categories</TabsTrigger>
  <TabsTrigger value="allocation">Allocation</TabsTrigger>
  <TabsTrigger value="gaps">Gaps</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
</TabsList>
```

---

### Step 16: Governance (`Step15Governance.jsx` - 1235 lines)

**Complexity**: Very High | **Effort**: 2 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 22 import
- **AI**: Custom Button - **Line 423** (simple generate button)
- **Tabs**: **Nested Tabs** - **Line 578** inside viewMode='cards' (`grid-cols-5`)
- **Alerts**: Alert import - **Line 12** + custom alerts useMemo **Line 201**

#### Special Structure
This step has dual navigation:
1. **ViewMode buttons** (Lines 443-456): cards | structure | summary
2. **Tabs inside 'cards' viewMode** (Line 578): 5 tabs

#### Tab Structure (5 tabs at Line 578)
```jsx
<TabsList className="grid w-full grid-cols-5 mb-4">
  <TabsTrigger value="committees">Committees</TabsTrigger>
  <TabsTrigger value="roles">Roles</TabsTrigger>
  <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
  <TabsTrigger value="raci">RACI</TabsTrigger>
  <TabsTrigger value="escalation">Escalation</TabsTrigger>
</TabsList>
```

---

### Step 17: Communication (`Step16Communication.jsx` - 1142 lines)

**Complexity**: Very High | **Effort**: 2 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 24 import
- **AI**: None
- **Tabs**: Raw Tabs - **Line 951** (`grid-cols-5`)
- **Alerts**: Alert import - **Line 12**

#### Tab Structure (5 tabs at Line 951)
```jsx
<TabsList className="grid w-full grid-cols-5">
  <TabsTrigger value="audiences">Audiences</TabsTrigger>
  <TabsTrigger value="channels">Channels</TabsTrigger>
  <TabsTrigger value="messages">Messages</TabsTrigger>
  <TabsTrigger value="calendar">Calendar</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
</TabsList>
```

---

### Step 18: Change Management (`Step17Change.jsx` - 1482 lines)

**Complexity**: Very High (Largest file!) | **Effort**: 2.5 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 23 import
- **AI**: None
- **Tabs**: Raw Tabs - **Line 1178** (`grid-cols-6`) ⚠️ 6 tabs!
- **Alerts**: Alert import - **Line 13**

#### Tab Structure (6 tabs at Line 1178)
```jsx
<TabsList className="grid grid-cols-6 w-full">
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="impacts">Impacts</TabsTrigger>
  <TabsTrigger value="adkar">ADKAR</TabsTrigger>
  <TabsTrigger value="training">Training</TabsTrigger>
  <TabsTrigger value="resistance">Resistance</TabsTrigger>
  <TabsTrigger value="summary">Summary</TabsTrigger>
</TabsList>
```

---

### Step 19: Final Review (`Step18Review.jsx` - 1076 lines) ⚠️ SPECIAL

**Complexity**: High | **Effort**: 2 hours

#### Verified Locations
- **Dashboard**: `StepDashboardHeader` - Line 27 import
- **AI**: `AIStrategicPlanAnalyzer` - **Line 28** (custom component - keep!)
- **Tabs**: Has tabs (structure varies)
- **Alerts**: Alert import - **Line 5**

---

## Phase 3: Migration Priority Matrix

### 🟢 Quick Wins (3 steps - ~1.5 hours total)
Steps that only need tabs migration (already have AIActionButton):

| Step | File | Tab Line | Tab Count |
|------|------|----------|-----------|
| Step2SWOT | Step2SWOT.jsx | L389 | 4 |
| Step3Stakeholders | Step3Stakeholders.jsx | L233 | 4 |
| Step4PESTEL | Step4PESTEL.jsx | L283 | 4 |

### 🟡 Standard (9 steps - ~13 hours total)
Steps needing tabs + optional alerts:

| Step | File | Tab Line | Tab Count | Has Alert |
|------|------|----------|-----------|-----------|
| Step4NationalAlignment | L? | 3 | ❌ |
| Step6ActionPlans | L809 | 4 | ✅ |
| Step6Scenarios | L479 | 4 | ❌ |
| Step7Risks | L? | 4 | ✅ |
| Step7Timeline | L502 | 4 (viewMode) | ❌ |
| Step8Dependencies | L284 | **5** | ❌ |
| Step13Resources | L616 | 4 | ✅ |

### 🔴 Complex (6 steps - ~11 hours total)
Steps needing MainAIGeneratorCard and/or many tabs:

| Step | File | AI Change | Tab Count | Has Alert |
|------|------|-----------|-----------|-----------|
| Step1Context | Custom → MainAI | 4 | ❌ |
| Step2Vision | Custom → MainAI | 3 | ❌ |
| Step3Objectives | Keep modal | 3 | ❌ |
| Step15Governance | Custom btn | **5** (nested) | ✅ |
| Step16Communication | None | **5** | ✅ |
| Step17Change | None | **6** | ✅ |

### ⏭️ Skip/Special (2 steps)

| Step | File | Reason |
|------|------|--------|
| Step8Review | No tabs, review-only step |
| Step18Review | Custom AIAnalyzer, specialized |
| Step5KPIs | Uses ViewMode, not StepTabs |

---

## Phase 4: Implementation Patterns

### Pattern A: Tabs-Only Migration (Quick Wins)

```jsx
// BEFORE (Raw Tabs)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="matrix">Matrix</TabsTrigger>
    // ...
  </TabsList>
  <TabsContent value="matrix">...</TabsContent>
</Tabs>

// AFTER (StepTabs)
import { StepTabs, StepTabContent, createTabConfig } from '../shared';

const TAB_DEFINITIONS = [
  { id: 'matrix', labelEn: 'Matrix', labelAr: 'المصفوفة', icon: LayoutGrid },
  // ...
];

const tabs = createTabConfig(TAB_DEFINITIONS, language);

<StepTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="underline"
>
  <StepTabContent tabId="matrix">...</StepTabContent>
</StepTabs>
```

### Pattern B: MainAIGeneratorCard Migration

```jsx
// BEFORE (Custom Card - Step1, Step2)
{!isReadOnly && (
  <Card className="border-primary/20">
    <CardContent className="py-4">
      <div className="flex items-center justify-between">
        <div>
          <h4>AI-Powered Generation</h4>
          <p>Description...</p>
        </div>
        <Button onClick={onGenerateAI} disabled={isGenerating}>
          Generate
        </Button>
      </div>
    </CardContent>
  </Card>
)}

// AFTER (MainAIGeneratorCard)
import { MainAIGeneratorCard } from '../shared';

<MainAIGeneratorCard
  variant="card"
  title={{ en: 'AI-Powered Context Generation', ar: 'إنشاء السياق بالذكاء الاصطناعي' }}
  description={{ en: 'Fill in basic details and let AI suggest...', ar: '...' }}
  onGenerate={onGenerateAI}
  isGenerating={isGenerating}
  disabled={!data.name_en}
  isReadOnly={isReadOnly}
/>
```

### Pattern C: StepAlerts Migration

```jsx
// BEFORE (useMemo alerts + Raw Alert)
import { Alert, AlertDescription } from "@/components/ui/alert";

const alerts = useMemo(() => {
  const warnings = [];
  if (stats.totalCommittees === 0) {
    warnings.push({ type: 'error', message: t({ en: 'No governance committees', ar: '...' }) });
  }
  return warnings;
}, [stats, t]);

{alerts.map((alert, idx) => (
  <Alert key={idx} variant={alert.type === 'error' ? 'destructive' : 'default'}>
    <AlertDescription>{alert.message}</AlertDescription>
  </Alert>
))}

// AFTER (StepAlerts)
import { StepAlerts, generateStepAlerts } from '../shared';

const alerts = generateStepAlerts({
  errors: stats.totalCommittees === 0 ? [{ 
    title: { en: 'Missing Committees', ar: '...' },
    message: { en: 'No governance committees defined', ar: '...' }
  }] : [],
  warnings: [],
}, language);

<StepAlerts alerts={alerts} language={language} />
```

---

## Phase 5: Testing Checklist

### Per-Step Verification

- [ ] **Visual parity**: UI looks the same or better
- [ ] **Functionality**: All interactions work identically
- [ ] **Responsiveness**: Mobile/tablet views intact
- [ ] **RTL support**: Arabic layout correct
- [ ] **Accessibility**: Tab order and focus management
- [ ] **Performance**: No added re-renders

### Regression Tests

- [ ] Tab switching works
- [ ] AI generation triggers correctly
- [ ] Form state preserved on tab change
- [ ] Alerts display with correct severity
- [ ] Read-only mode hides edit controls

---

## Appendix: Component API Reference

### StepTabs

```typescript
interface StepTabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'underline' | 'pills';
  size?: 'sm' | 'default' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

interface TabConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
  status?: 'complete' | 'warning' | 'error';
}
```

### MainAIGeneratorCard

```typescript
interface MainAIGeneratorCardProps {
  variant?: 'card' | 'button' | 'inline' | 'compact';
  title: BilingualText;
  description?: BilingualText;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  isReadOnly?: boolean;
  className?: string;
}
```

### StepAlerts

```typescript
interface StepAlertsProps {
  alerts: StepAlert[];
  language?: 'en' | 'ar';
  maxVisible?: number;
  className?: string;
}

interface StepAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'tip';
  title: BilingualText;
  message: BilingualText;
}
```

---

## Estimated Total Effort

| Category | Steps | Hours |
|----------|-------|-------|
| Quick Wins | 3 | 1.5 |
| Standard | 9 | 13 |
| Complex | 6 | 11 |
| Special/Skip | 2 | 1 |
| **Total** | **19** | **~27 hours** |

---

*Document generated from verified file inspection on December 2024*

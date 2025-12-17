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

| File | Lines | Dashboard Header | AIActionButton | Raw Tabs Import | Alert Import |
|------|-------|------------------|----------------|-----------------|--------------|
| Step1Context.jsx | 885 | ✅ Line 19 | ❌ Custom Card | ✅ Line 10 | ❌ None |
| Step2Vision.jsx | 643 | ✅ Line 19 | ❌ Custom Card | ✅ Line 9 | ❌ None |
| Step2SWOT.jsx | 667 | ✅ Line 17 | ✅ Line 17 | ✅ Line 7 | ❌ None |
| Step3Objectives.jsx | 841 | ✅ Line 21 | ❌ Custom Modal | ✅ Line 11 | ❌ None |
| Step3Stakeholders.jsx | 720 | ✅ Line 22 | ✅ Line 26 | ✅ Line 10 | ❌ None |
| Step4PESTEL.jsx | 831 | ✅ Line 19 | ✅ Line 19 | ✅ Line 8 | ❌ None |
| Step4NationalAlignment.jsx | 585 | ✅ Line 14 | ❌ None | ✅ Line 6 | ❌ None |
| Step5KPIs.jsx | 1094 | ✅ Line 19 | ✅ Line 19 | ✅ Line 8 | ✅ Line 11 |
| Step6ActionPlans.jsx | 1200 | ✅ Line 25 | ✅ Line 25 | ✅ Line 10 | ✅ Line 14 |
| Step6Scenarios.jsx | 784 | ✅ Line 19 | ❌ None | ✅ Line 8 | ❌ None |
| Step7Risks.jsx | 869 | ✅ Line 24 | ✅ Line 24 | ✅ Line 10 | ✅ Line 13 |
| Step7Timeline.jsx | 1145 | ✅ Line 21 | ✅ Line 21 | ✅ Line 10 | ❌ None |
| Step8Dependencies.jsx | 1054 | ✅ Line 19 | ✅ Line 19 | ✅ Line 10 | ❌ None |
| Step8Review.jsx | 624 | ✅ Line 19 | ❌ None | ❌ None | ✅ Line 5 |
| Step13Resources.jsx | 932 | ✅ Line 23 | ✅ Line 23 | ✅ Line 7 | ✅ Line 11 |
| Step15Governance.jsx | 1235 | ✅ Line 22 | ❌ None | ✅ Line 9 | ✅ Line 12 |
| Step16Communication.jsx | 1142 | ✅ Line 24 | ❌ None | ✅ Line 9 | ✅ Line 12 |
| Step17Change.jsx | 1482 | ✅ Line 23 | ❌ None | ✅ Line 9 | ✅ Line 13 |
| Step18Review.jsx | 1076 | ✅ Line 27 | ❌ AIAnalyzer L28 | ✅ Line 8 | ✅ Line 5 |

### Summary Statistics

| Pattern | Already Using Shared | Needs Migration | Notes |
|---------|---------------------|-----------------|-------|
| StepDashboardHeader | 19 (100%) | 0 | ✅ Complete |
| AIActionButton | 10 (53%) | 7 custom, 2 none | 🟡 Partial |
| StepTabs | 0 (0%) | 17 | 🔴 All need migration |
| StepAlerts | 0 (0%) | 8 have Alert imports | 🟡 8 have custom alerts |
| MainAIGeneratorCard | 0 (0%) | 2 have custom cards | 🔴 Step1, Step2 |

### Quick Reference: What Each Step Needs

| Step | Needs StepTabs | Needs MainAIGeneratorCard | Needs StepAlerts | Priority |
|------|----------------|---------------------------|------------------|----------|
| Step1Context | ✅ Yes (4 tabs) | ✅ Yes (custom card L206-225) | ❌ No | Medium |
| Step2Vision | ✅ Yes (3 tabs) | ✅ Yes (custom card L207-226) | ❌ No | Medium |
| Step2SWOT | ✅ Yes (4 tabs) | ❌ No (has AIActionButton) | ❌ No | 🟢 Quick Win |
| Step3Objectives | ✅ Yes (3 tabs) | ❌ Keep modal | ❌ No | Complex |
| Step3Stakeholders | ✅ Yes (4 tabs) | ❌ No (has AIActionButton) | ❌ No | 🟢 Quick Win |
| Step4PESTEL | ✅ Yes (4 tabs) | ❌ No (has AIActionButton) | ❌ No | 🟢 Quick Win |
| Step4NationalAlignment | ✅ Yes (3 tabs) | ❌ Optional | ❌ No | Easy |
| Step5KPIs | ❌ Uses viewMode | ❌ No (has AIActionButton) | ✅ Has Alert | Special |
| Step6ActionPlans | ✅ Yes | ❌ No (has AIActionButton) | ✅ Has Alert | Standard |
| Step6Scenarios | ✅ Yes (3 tabs) | ❌ Optional | ❌ No | Easy |
| Step7Risks | ✅ Yes (4 tabs) | ❌ No (has AIActionButton) | ✅ Has Alert | Standard |
| Step7Timeline | ✅ Yes (3 tabs) | ❌ No (has AIActionButton) | ❌ No | Standard |
| Step8Dependencies | ✅ Yes (3 tabs) | ❌ No (has AIActionButton) | ❌ No | Standard |
| Step8Review | ❌ No tabs | ❌ None needed | ✅ Has Alert | Skip |
| Step13Resources | ✅ Yes (4 tabs) | ❌ No (has AIActionButton) | ✅ Has Alert | Standard |
| Step15Governance | ✅ Yes (5 tabs) | ❌ Optional | ✅ Has Alert | Complex |
| Step16Communication | ✅ Yes (4 tabs) | ❌ Optional | ✅ Has Alert | Complex |
| Step17Change | ✅ Yes (6 tabs) | ❌ Optional | ✅ Has Alert | Complex |
| Step18Review | ✅ Yes | ❌ AIAnalyzer custom | ✅ Has Alert | Special |

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

#### Current Imports (Lines 1-25)
```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Line 10
import { StepDashboardHeader, DistributionChart, QualityMetrics, RecommendationsCard } from '../shared'; // Line 18-23
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Lines 173-202 | None |
| Main AI | ❌ Custom inline card | **Lines 206-225** | Replace with MainAIGeneratorCard |
| Tabs | ❌ Raw `<Tabs>` | **Lines 228-246** | Replace with StepTabs |
| Alerts | ❌ None | - | Optional |

#### Custom AI Card to Replace (Lines 206-225)
```jsx
// CURRENT CODE
{!isReadOnly && (
  <Card className="border-primary/20">
    <CardContent className="py-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t({ en: 'AI-Powered Context Generation', ar: 'إنشاء السياق بالذكاء الاصطناعي' })}
          </h4>
          <p className="text-sm text-muted-foreground">
            {t({ en: 'Fill in basic details and let AI suggest vision, mission, and themes', ar: '...' })}
          </p>
        </div>
        <Button onClick={onGenerateAI} disabled={isGenerating || !data.name_en}>
          {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'Generate', ar: 'إنشاء' })}
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

#### Tabs to Migrate (Lines 228-246)
```jsx
// CURRENT - 4 tabs
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="identity">Identity</TabsTrigger>
    <TabsTrigger value="scope">Scope</TabsTrigger>
    <TabsTrigger value="discovery">Discovery</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
  // ... TabsContent
</Tabs>

// MIGRATION CONFIG
const tabConfig = [
  { id: 'identity', labelEn: 'Identity', labelAr: 'الهوية', icon: Target },
  { id: 'scope', labelEn: 'Scope', labelAr: 'النطاق', icon: MapPin },
  { id: 'discovery', labelEn: 'Discovery', labelAr: 'الاستكشاف', icon: Lightbulb },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: CheckCircle2 }
];
```

---

### Step 2: Vision & Values (`Step2Vision.jsx` - 643 lines)

**Complexity**: Medium | **Effort**: 1.5 hours

#### Current Imports (Lines 1-22)
```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Line 9
import { StepDashboardHeader, QualityMetrics, RecommendationsCard } from '../shared'; // Lines 18-22
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Lines 173-204 | None |
| Main AI | ❌ Custom inline card | **Lines 207-227** | Replace with MainAIGeneratorCard |
| Tabs | ❌ Raw `<Tabs>` | **Line 230+** | Replace with StepTabs |

#### Tabs Configuration (3 tabs)
```jsx
const tabConfig = [
  { id: 'values', labelEn: 'Core Values', labelAr: 'القيم الجوهرية', icon: Heart },
  { id: 'pillars', labelEn: 'Strategic Pillars', labelAr: 'الركائز الاستراتيجية', icon: Columns },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: Star }
];
```

---

### Step 3: SWOT Analysis (`Step2SWOT.jsx` - 667 lines) 🟢 QUICK WIN

**Complexity**: Low | **Effort**: 30 minutes

#### Current Imports (Line 17)
```jsx
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, StatsGrid, AIActionButton } from '../shared';
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Present | None |
| Main AI | ✅ AIActionButton | Line 17 | **None - Already using shared!** |
| Tabs | ❌ Raw `<Tabs>` | Line 7 | Replace with StepTabs |

#### 🟢 Only Tabs Migration Needed
```jsx
const tabConfig = [
  { id: 'matrix', labelEn: 'Matrix', labelAr: 'المصفوفة', icon: LayoutGrid },
  { id: 'list', labelEn: 'List', labelAr: 'القائمة', icon: ListChecks },
  { id: 'strategies', labelEn: 'Strategies', labelAr: 'الاستراتيجيات', icon: Lightbulb },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: BarChart3 }
];
```

---

### Step 4: Strategic Objectives (`Step3Objectives.jsx` - 841 lines)

**Complexity**: High | **Effort**: 2 hours

#### Current Imports (Line 21)
```jsx
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';
// Note: NO AIActionButton import - uses custom proposal modal
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 21 | None |
| Main AI | ❌ Custom proposal modal | Lines 35-40 | **Keep - specialized for single objective generation** |
| Tabs | ❌ Raw `<Tabs>` | Line 11 | Replace with StepTabs |

#### Special Considerations
- Uses unique `onGenerateSingleObjective` callback
- Has proposal modal for reviewing AI-generated objectives
- Cannot simply replace with MainAIGeneratorCard - hybrid approach needed

---

### Step 5: Stakeholders (`Step3Stakeholders.jsx` - 720 lines) 🟢 QUICK WIN

**Complexity**: Low | **Effort**: 30 minutes

#### Current Imports (Lines 21-27)
```jsx
import { 
  StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton 
} from '../shared';
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 22 | None |
| Main AI | ✅ AIActionButton | Line 26 | **None - Already using shared!** |
| Tabs | ❌ Raw `<Tabs>` | Line 10 | Replace with StepTabs |

#### 🟢 Only Tabs Migration Needed

---

### Step 6: PESTEL Analysis (`Step4PESTEL.jsx` - 831 lines) 🟢 QUICK WIN

**Complexity**: Low | **Effort**: 30 minutes

#### Current Imports (Line 19)
```jsx
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 19 | None |
| Main AI | ✅ AIActionButton | Line 19 | **None - Already using shared!** |
| Tabs | ❌ Raw `<Tabs>` | Line 8 | Replace with StepTabs |

#### 🟢 Only Tabs Migration Needed

---

### Step 7: National Alignment (`Step4NationalAlignment.jsx` - 585 lines)

**Complexity**: Low | **Effort**: 45 minutes

#### Current Imports (Line 14)
```jsx
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';
// Note: NO AIActionButton import
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 14 | None |
| Main AI | ❌ None | - | **Optional** - could add MainAIGeneratorCard |
| Tabs | ❌ Raw `<Tabs>` | Line 6 | Replace with StepTabs |

---

### Step 8: KPIs (`Step5KPIs.jsx` - 1094 lines) ⚠️ SPECIAL CASE

**Complexity**: Very High | **Effort**: 2 hours

#### Current Imports (Lines 11, 19)
```jsx
import { Alert, AlertDescription } from "@/components/ui/alert"; // Line 11
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared'; // Line 19
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 19 | None |
| Main AI | ✅ AIActionButton | Line 19 | None |
| Tabs | ❌ Uses `viewMode` state | ~Line 102 | Consider ViewModeToggle instead |
| Alerts | ✅ Alert import | Line 11 | Migrate to StepAlerts |

#### Special Notes
- Uses custom `viewMode` state: 'byObjective' | 'byCategory' | 'list'
- Consider `ViewModeToggle` instead of `StepTabs`
- SMART score calculation is highly specialized - keep as-is

---

### Step 9: Action Plans (`Step6ActionPlans.jsx` - 1200 lines)

**Complexity**: Very High | **Effort**: 2 hours

#### Current Imports (Lines 14, 25)
```jsx
import { Alert, AlertDescription } from "@/components/ui/alert"; // Line 14
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared'; // Line 25
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 25 | None |
| Main AI | ✅ AIActionButton | Line 25 | None |
| Tabs | ❌ Raw `<Tabs>` | Line 10 | Replace with StepTabs |
| Alerts | ✅ Alert import | Line 14 | Migrate to StepAlerts |

---

### Step 10: Scenarios (`Step6Scenarios.jsx` - 784 lines)

**Complexity**: Medium | **Effort**: 1 hour

#### Current Imports (Line 19)
```jsx
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';
// Note: NO AIActionButton import
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 19 | None |
| Main AI | ❌ None | - | **Optional** - could add MainAIGeneratorCard |
| Tabs | ❌ Raw `<Tabs>` | Line 8 | Replace with StepTabs |

---

### Step 11: Risk Assessment (`Step7Risks.jsx` - 869 lines)

**Complexity**: High | **Effort**: 1.5 hours

#### Current Imports (Lines 13, 24)
```jsx
import { Alert, AlertDescription } from "@/components/ui/alert"; // Line 13
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared'; // Line 24
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 24 | None |
| Main AI | ✅ AIActionButton | Line 24 | None |
| Tabs | ❌ Raw `<Tabs>` | Line 10 | Replace with StepTabs |
| Alerts | ✅ Alert import | Line 13 | Migrate to StepAlerts |

---

### Step 12: Timeline (`Step7Timeline.jsx` - 1145 lines)

**Complexity**: Very High | **Effort**: 1.5 hours

#### Current Imports (Line 21)
```jsx
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 21 | None |
| Main AI | ✅ AIActionButton | Line 21 | None |
| Tabs | ❌ Raw `<Tabs>` | Line 10 | Replace with StepTabs |

---

### Step 13: Dependencies (`Step8Dependencies.jsx` - 1054 lines)

**Complexity**: High | **Effort**: 1.5 hours

#### Current Imports (Line 19)
```jsx
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared';
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 19 | None |
| Main AI | ✅ AIActionButton | Line 19 | None |
| Tabs | ❌ Raw `<Tabs>` | Line 10 | Replace with StepTabs |

---

### Step 14: Mid-Review (`Step8Review.jsx` - 624 lines) ⏭️ SKIP

**Complexity**: Medium | **Effort**: Skip for now

#### Current Imports (Lines 5, 19)
```jsx
import { Alert, AlertDescription } from "@/components/ui/alert"; // Line 5
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared'; // Line 19
// Note: NO Tabs import, NO AIActionButton
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 19 | None |
| Main AI | ❌ None | - | Not needed (review step) |
| Tabs | ❌ None | - | N/A - no tabs in this step |
| Alerts | ✅ Alert import | Line 5 | Migrate to StepAlerts |

---

### Step 15: Resources (`Step13Resources.jsx` - 932 lines)

**Complexity**: High | **Effort**: 1.5 hours

#### Current Imports (Lines 11, 23)
```jsx
import { Alert, AlertDescription } from "@/components/ui/alert"; // Line 11
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, AIActionButton } from '../shared'; // Line 23
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 23 | None |
| Main AI | ✅ AIActionButton | Line 23 | None |
| Tabs | ❌ Raw `<Tabs>` | Line 7 | Replace with StepTabs |
| Alerts | ✅ Alert import | Line 11 | Migrate to StepAlerts |

---

### Step 16: Governance (`Step15Governance.jsx` - 1235 lines)

**Complexity**: Very High | **Effort**: 2 hours

#### Current Imports (Lines 12, 22)
```jsx
import { Alert, AlertDescription } from "@/components/ui/alert"; // Line 12
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared'; // Line 22
// Note: NO AIActionButton import
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 22 | None |
| Main AI | ❌ None | - | **Optional** - could add MainAIGeneratorCard |
| Tabs | ❌ Raw `<Tabs>` | Line 9 | Replace with StepTabs (5 tabs!) |
| Alerts | ✅ Alert import | Line 12 | Migrate to StepAlerts |

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

### Step 17: Communication (`Step16Communication.jsx` - 1142 lines)

**Complexity**: Very High | **Effort**: 2 hours

#### Current Imports (Lines 12, 24)
```jsx
import { Alert, AlertDescription } from "@/components/ui/alert"; // Line 12
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared'; // Line 24
// Note: NO AIActionButton import
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 24 | None |
| Main AI | ❌ None | - | **Optional** - could add MainAIGeneratorCard |
| Tabs | ❌ Raw `<Tabs>` | Line 9 | Replace with StepTabs |
| Alerts | ✅ Alert import | Line 12 | Migrate to StepAlerts |

---

### Step 18: Change Management (`Step17Change.jsx` - 1482 lines)

**Complexity**: Very High (Largest file!) | **Effort**: 2.5 hours

#### Current Imports (Lines 13, 23)
```jsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Line 13
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, StatsGrid } from '../shared'; // Line 23
// Note: NO AIActionButton import
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 23 | None |
| Main AI | ❌ None | - | **Optional** - could add MainAIGeneratorCard |
| Tabs | ❌ Raw `<Tabs>` | Line 9 | Replace with StepTabs (6 tabs!) |
| Alerts | ✅ Alert import | Line 13 | Migrate to StepAlerts |

#### Complex Tab Structure (6 tabs)
```jsx
const tabConfig = [
  { id: 'assessment', labelEn: 'Assessment', labelAr: 'التقييم', icon: Eye },
  { id: 'stakeholders', labelEn: 'Stakeholders', labelAr: 'أصحاب المصلحة', icon: Users },
  { id: 'adkar', labelEn: 'ADKAR', labelAr: 'ADKAR', icon: GitBranch },
  { id: 'training', labelEn: 'Training', labelAr: 'التدريب', icon: GraduationCap },
  { id: 'adoption', labelEn: 'Adoption', labelAr: 'التبني', icon: TrendingUp },
  { id: 'summary', labelEn: 'Summary', labelAr: 'ملخص', icon: BarChart3 }
];
```

---

### Step 19: Final Review (`Step18Review.jsx` - 1076 lines) ⚠️ SPECIAL CASE

**Complexity**: High | **Effort**: 2 hours

#### Current Imports (Lines 5, 8, 27-28)
```jsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Line 5
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Line 8
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared'; // Line 27
import AIStrategicPlanAnalyzer from '../AIStrategicPlanAnalyzer'; // Line 28 - Custom component!
```

#### Gaps Identified

| Component | Current | Location | Migration Required |
|-----------|---------|----------|-------------------|
| Dashboard | ✅ StepDashboardHeader | Line 27 | None |
| Main AI | ❌ AIStrategicPlanAnalyzer | Line 28 | **Keep - specialized analyzer** |
| Tabs | ❌ Raw `<Tabs>` | Line 8 | Replace with StepTabs |
| Alerts | ✅ Alert import | Line 5 | Migrate to StepAlerts |

---

## Phase 3: Migration Priority Matrix

### 🟢 Quick Wins (3 steps - ~1.5 hours total)
Steps that only need tabs migration (already have AIActionButton):

| Step | File | Current AI | Tabs to Add |
|------|------|------------|-------------|
| Step2SWOT | Step2SWOT.jsx | ✅ AIActionButton | 4 tabs |
| Step3Stakeholders | Step3Stakeholders.jsx | ✅ AIActionButton | 4 tabs |
| Step4PESTEL | Step4PESTEL.jsx | ✅ AIActionButton | 4 tabs |

### 🟡 Standard (8 steps - ~12 hours total)
Steps needing tabs + optional alerts:

| Step | File | Tabs | Alerts |
|------|------|------|--------|
| Step4NationalAlignment | Step4NationalAlignment.jsx | 3 tabs | ❌ |
| Step6ActionPlans | Step6ActionPlans.jsx | Standard | ✅ |
| Step6Scenarios | Step6Scenarios.jsx | 3 tabs | ❌ |
| Step7Risks | Step7Risks.jsx | 4 tabs | ✅ |
| Step7Timeline | Step7Timeline.jsx | 3 tabs | ❌ |
| Step8Dependencies | Step8Dependencies.jsx | 3 tabs | ❌ |
| Step13Resources | Step13Resources.jsx | 4 tabs | ✅ |

### 🔴 Complex (6 steps - ~12 hours total)
Steps needing MainAIGeneratorCard and/or many tabs:

| Step | File | AI Migration | Tab Count | Alerts |
|------|------|--------------|-----------|--------|
| Step1Context | Step1Context.jsx | Custom → MainAI | 4 | ❌ |
| Step2Vision | Step2Vision.jsx | Custom → MainAI | 3 | ❌ |
| Step3Objectives | Step3Objectives.jsx | Keep Modal | 3 | ❌ |
| Step15Governance | Step15Governance.jsx | Optional | 5 | ✅ |
| Step16Communication | Step16Communication.jsx | Optional | 4 | ✅ |
| Step17Change | Step17Change.jsx | Optional | 6 | ✅ |

### ⏭️ Skip/Special (2 steps)

| Step | File | Reason |
|------|------|--------|
| Step5KPIs | Step5KPIs.jsx | Uses viewMode, not tabs |
| Step8Review | Step8Review.jsx | No tabs needed |
| Step18Review | Step18Review.jsx | Custom AIStrategicPlanAnalyzer |

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
// BEFORE (Custom Card)
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
// BEFORE (Raw Alert)
import { Alert, AlertDescription } from "@/components/ui/alert";

{alerts.map(alert => (
  <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
    <AlertDescription>{alert.message}</AlertDescription>
  </Alert>
))}

// AFTER (StepAlerts)
import { StepAlerts, generateStepAlerts } from '../shared';

const alerts = generateStepAlerts(validationChecks, language);

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
| Standard | 8 | 12 |
| Complex | 6 | 12 |
| Special/Skip | 2 | 2 |
| **Total** | **19** | **~28 hours** |

---

*Document generated from verified file inspection on December 2024*

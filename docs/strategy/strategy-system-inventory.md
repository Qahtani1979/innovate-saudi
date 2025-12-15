# Strategy System Inventory

> **Version:** 5.0  
> **Last Updated:** 2025-12-15  
> **Total Assets:** 180+ files (40+ pages, 75+ components, 35 hooks + 3 contexts)  
> **Parent System:** Strategic Planning & Execution Framework  
> **Hub Page:** `/strategy-hub`

---

## 🔗 Navigation

| ⬆️ Parent | ➡️ Next |
|-----------|---------|
| [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Challenges →](../challenges/challenges-system-inventory.md) |

---

## Overview

The Strategy System is the core strategic planning and execution framework spanning all 8 phases of the strategic methodology. This document provides a complete inventory of all pages, components, hooks, and their relationships.

---

## 📄 Strategy Hub - Central Command Center

### Purpose
The Strategy Hub (`/strategy-hub`) serves as the **central command center** for the entire strategic planning lifecycle. It provides:
- Quick access to all 8 phases of strategic methodology
- Real-time visibility into plan progress and health
- Tools for planning, execution, monitoring, and recalibration
- AI-powered strategic insights and recommendations

### Hub Tab Structure (8 Tabs)

| Tab | Purpose | Tools/Features | Phase Coverage |
|-----|---------|----------------|----------------|
| **Workflow** | Strategic lifecycle management | Phase progress, Plan list, Coverage widget, Pending actions | All Phases |
| **Templates** | Template library & coverage | Template Library, Coverage Analysis (MoMAH taxonomy) | Phase 2 |
| **Cascade** | Entity generation | 8 generators (Challenges, Pilots, Policies, R&D, Partnerships, Events, Living Labs, Campaigns) | Phase 3 |
| **Monitoring** | Performance tracking | Cockpit, Drill-down, Alignment, Timeline, Feedback, Adjustment + Demand Dashboard, Action Plans, National Alignment | Phase 6 |
| **Governance** | Approval & control | Signoff Tracker, Version Control, Committee Review, Ownership | Phase 4 |
| **Communication** | Stakeholder comms | Planner, Stories, Notifications, Analytics, Public Dashboard, Public View | Phase 5 |
| **Pre-Planning** | Analysis & inputs | Environmental Scan, SWOT, Stakeholder, Risk, Baseline, Inputs | Phase 1 |
| **AI** | Intelligent assistance | Narrative Generator, Gap Recommender, What-If Simulator, Bottleneck Detector | All Phases |

### Recommended Future Enhancements

| New Tab | Purpose | Components |
|---------|---------|------------|
| **Evaluation** | Phase 7 tools | Evaluation Panel, Case Study Generator, Lessons Learned, Impact Assessment, ROI Calculator |
| **Recalibration** | Phase 8 tools | Feedback Analysis, Adjustment Matrix, Mid-Cycle Pivot, Baseline Recalibrator, Next Cycle Initializer |
| **Creation** | Phase 2 creation tools | Sector Strategy Builder, Strategy Wizard access |

---

## 📄 Pages (40+)

### Core Strategy Pages

| Page | File | Route | Permission | Hub Access |
|------|------|-------|------------|------------|
| **Strategy Hub** | `StrategyHub.jsx` | `/strategy-hub` | `strategy_view` | ✅ Direct (Root) |
| Strategy Cockpit | `StrategyCockpit.jsx` | `/strategy-cockpit` | `strategy_view` | ✅ Monitoring Tab |
| Strategy Drill-Down | `StrategyDrillDown.jsx` | `/strategy-drill-down` | `strategy_view` | ✅ Workflow Tab |
| Strategy Alignment | `StrategyAlignment.jsx` | `/strategy-alignment` | `strategy_view` | ✅ Monitoring Tab |
| Strategy Review | `StrategyReviewPage.jsx` | `/strategy-review-page` | `strategy_manage` | ✅ Monitoring Tab |
| Strategy Governance | `StrategyGovernancePage.jsx` | `/strategy-governance-page` | `strategy_manage` | ✅ Governance Tab |
| Strategy Demand Dashboard | `StrategyDemandDashboardPage.jsx` | `/strategy-demand-dashboard` | `strategy_manage` | ✅ Monitoring Tab |
| Strategic Plan Builder | `StrategicPlanBuilder.jsx` | `/strategic-plan-builder` | `strategy_manage` | ✅ Header Button |
| Strategic Execution Dashboard | `StrategicExecutionDashboard.jsx` | `/strategic-execution-dashboard` | `strategy_view` | ❌ Not in Hub |
| Strategic Planning Progress | `StrategicPlanningProgress.jsx` | `/strategic-planning-progress` | `strategy_view` | ❌ Not in Hub |
| Sector Strategy | `SectorStrategyPage.jsx` | `/sector-strategy-page` | `strategy_manage` | ❌ Not in Hub |

### Pre-Planning Pages (Phase 1)

| Page | File | Route | Permission | Hub Access |
|------|------|-------|------------|------------|
| Environmental Scan | `EnvironmentalScanPage.jsx` | `/environmental-scan-page` | `strategy_manage` | ✅ Pre-Planning Tab |
| SWOT Analysis | `SWOTAnalysisPage.jsx` | `/swot-analysis-page` | `strategy_manage` | ✅ Pre-Planning Tab |
| Stakeholder Analysis | `StakeholderAnalysisPage.jsx` | `/stakeholder-analysis-page` | `strategy_manage` | ✅ Pre-Planning Tab |
| Risk Assessment | `RiskAssessmentPage.jsx` | `/risk-assessment-page` | `strategy_manage` | ✅ Pre-Planning Tab |
| Baseline Data | `BaselineDataPage.jsx` | `/baseline-data-page` | `strategy_manage` | ✅ Pre-Planning Tab |
| Strategy Input | `StrategyInputPage.jsx` | `/strategy-input-page` | `strategy_manage` | ✅ Pre-Planning Tab |

### Strategy Creation Pages (Phase 2)

| Page | File | Route | Permission | Hub Access |
|------|------|-------|------------|------------|
| Strategy Timeline | `StrategyTimelinePage.jsx` | `/strategy-timeline-page` | `strategy_manage` | ✅ Monitoring Tab |
| Strategy Ownership | `StrategyOwnershipPage.jsx` | `/strategy-ownership-page` | `strategy_manage` | ✅ Governance Tab |
| Strategy Templates | `StrategyTemplatesPage.jsx` | `/strategy-templates-page` | `strategy_view` | ✅ Templates Tab |
| National Strategy Linker | `NationalStrategyLinkerPage.jsx` | `/national-strategy-linker-page` | `strategy_manage` | ✅ Monitoring Tab |
| Action Plan | `ActionPlanPage.jsx` | `/action-plan-page` | `strategy_manage` | ✅ Monitoring Tab |

### Cascade Generator Pages (Phase 3)

| Page | File | Route | Permission | Hub Access |
|------|------|-------|------------|------------|
| Challenge Generator | `StrategyChallengeGeneratorPage.jsx` | `/strategy-challenge-generator-page` | `strategy_cascade` | ✅ Cascade Tab |
| Pilot Generator | `StrategyPilotGeneratorPage.jsx` | `/strategy-pilot-generator-page` | `strategy_cascade` | ✅ Cascade Tab |
| Policy Generator | `StrategyPolicyGeneratorPage.jsx` | `/strategy-policy-generator-page` | `strategy_cascade` | ✅ Cascade Tab |
| R&D Call Generator | `StrategyRDCallGeneratorPage.jsx` | `/strategy-rd-call-generator-page` | `strategy_cascade` | ✅ Cascade Tab |
| Partnership Generator | `StrategyPartnershipGeneratorPage.jsx` | `/strategy-partnership-generator-page` | `strategy_cascade` | ✅ Cascade Tab |
| Event Generator | `StrategyEventGeneratorPage.jsx` | `/strategy-event-generator-page` | `strategy_cascade` | ✅ Cascade Tab |
| Living Lab Generator | `StrategyLivingLabGeneratorPage.jsx` | `/strategy-living-lab-generator-page` | `strategy_cascade` | ✅ Cascade Tab |
| Campaign Generator | `StrategyCampaignGeneratorPage.jsx` | `/strategy-campaign-generator-page` | `strategy_cascade` | ✅ Cascade Tab |

### Communication Pages (Phase 5)

| Page | File | Route | Permission | Hub Access |
|------|------|-------|------------|------------|
| Communication Hub | `strategy/StrategyCommunicationPage.jsx` | `/strategy-communication-page` | `strategy_view` | ✅ Communication Tab |
| Public Dashboard | `strategy/PublicStrategyDashboardPage.jsx` | `/public-strategy-dashboard-page` | `strategy_view` | ✅ Communication Tab |
| Public View | `strategy/StrategyPublicViewPage.jsx` | `/strategy-public-view-page` | `strategy_view` | ✅ Communication Tab |

### Monitoring & Evaluation Pages (Phase 6-7)

| Page | File | Route | Permission | Hub Access |
|------|------|-------|------------|------------|
| What-If Simulator | `WhatIfSimulatorPage.jsx` | `/what-if-simulator-page` | `strategy_view` | ✅ AI Tab (inline) |
| Gap Analysis Tool | `GapAnalysisTool.jsx` | `/gap-analysis-tool` | `strategy_manage` | ❌ Not in Hub |
| Budget Allocation | `BudgetAllocationTool.jsx` | `/budget-allocation-tool` | `strategy_manage` | ❌ Not in Hub |
| Strategic KPI Tracker | `StrategicKPITracker.jsx` | `/strategic-kpi-tracker` | `strategy_view` | ❌ Not in Hub |

---

## 🔄 Strategy Hub Tab Coverage Matrix

| Tab | Tools Displayed | Pages Linked | Status |
|-----|-----------------|--------------|--------|
| **Workflow** | Phase lifecycle, Strategic Plans list, Coverage, Pending Actions | `/strategy-drill-down`, `/strategy-alignment`, `/strategy-governance-page` | ✅ Complete |
| **Templates** | Template Library, Coverage Analysis | `/strategy-templates-page`, `/strategic-plan-builder` | ✅ Complete |
| **Cascade** | 8 Generators | All generator pages | ✅ Complete |
| **Monitoring** | Cockpit, Drill-down, Alignment, Timeline, Feedback, Adjustment + Demand Tools | 9 pages | ✅ Complete |
| **Governance** | Signoff, Version Control, Committee, Ownership | `/strategy-governance-page`, `/strategy-ownership-page` | ✅ Complete |
| **Communication** | Planner, Stories, Notifications, Analytics, Public Dashboard, Public View | `/strategy-communication-page`, `/public-strategy-dashboard-page`, `/strategy-public-view-page` | ✅ Complete |
| **Pre-Planning** | 6 Pre-planning tools | 6 pages | ✅ Complete |
| **AI** | Narrative, Gap, What-If, Bottleneck | Inline components | ✅ Complete |

---

## 📊 Pages NOT Accessible from Hub

The following strategy-related pages are NOT directly linked in the Strategy Hub:

| Page | Route | Recommended Hub Location |
|------|-------|-------------------------|
| Strategic Execution Dashboard | `/strategic-execution-dashboard` | Monitoring Tab |
| Strategic Planning Progress | `/strategic-planning-progress` | Monitoring Tab |
| Sector Strategy | `/sector-strategy-page` | Creation Tab (new) |
| What-If Simulator Page | `/what-if-simulator-page` | Monitoring Tab (already has inline AI) |
| Gap Analysis Tool | `/gap-analysis-tool` | Monitoring Tab |
| Budget Allocation Tool | `/budget-allocation-tool` | Governance Tab |
| Strategic KPI Tracker | `/strategic-kpi-tracker` | Monitoring Tab |
| Strategy Feedback Dashboard | `/strategy-feedback-dashboard` | Monitoring Tab (already listed) |

---

## 🧩 Components (75+)

### Root Strategy Components (18)
**Location:** `src/components/strategy/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `ActivePlanBanner.jsx` | Active plan selector banner | All strategy pages |
| `AutomatedMIICalculator.jsx` | MII score calculator | Strategy cockpit |
| `BottleneckDetector.jsx` | AI pipeline bottleneck detection | Strategy cockpit, Hub AI Tab |
| `CollaborationMapper.jsx` | R&D collaboration partner finder | Strategy cockpit |
| `GeographicCoordinationWidget.jsx` | Municipality coordination | Strategy cockpit |
| `HistoricalComparison.jsx` | Year-over-year trends | Strategy cockpit |
| `PartnershipNetwork.jsx` | Partnership network analysis | Strategy cockpit |
| `ResourceAllocationView.jsx` | Resource distribution | Strategy cockpit |
| `SectorGapAnalysisWidget.jsx` | Sector coverage gaps | Strategy cockpit |
| `StrategicAlignmentWidget.jsx` | Display linked plans | Multiple pages |
| `StrategicCoverageWidget.jsx` | Coverage metrics | Strategy cockpit |
| `StrategicGapProgramRecommender.jsx` | Program gap recommendations | Strategy hub |
| `StrategicNarrativeGenerator.jsx` | AI narrative generation | Strategy cockpit, Hub AI Tab |
| `StrategicPlanSelector.jsx` | Multi-select plan picker | All pages |
| `StrategicPlanWorkflowTab.jsx` | Workflow visualization | Strategy hub |
| `StrategyChallengeRouter.jsx` | Challenge track routing | Challenge pages |
| `StrategyToProgramGenerator.jsx` | Generate programs | Strategy hub |
| `WhatIfSimulator.jsx` | Budget scenario simulator | What-if page, Hub AI Tab |

### Cascade Components (8)
**Location:** `src/components/strategy/cascade/`

| Component | Generator Page | Description |
|-----------|----------------|-------------|
| `StrategyChallengeGenerator.jsx` | StrategyChallengeGeneratorPage | Generate challenges |
| `StrategyToCampaignGenerator.jsx` | StrategyCampaignGeneratorPage | Generate campaigns |
| `StrategyToEventGenerator.jsx` | StrategyEventGeneratorPage | Generate events |
| `StrategyToLivingLabGenerator.jsx` | StrategyLivingLabGeneratorPage | Generate living labs |
| `StrategyToPartnershipGenerator.jsx` | StrategyPartnershipGeneratorPage | Generate partnerships |
| `StrategyToPilotGenerator.jsx` | StrategyPilotGeneratorPage | Generate pilots |
| `StrategyToPolicyGenerator.jsx` | StrategyPolicyGeneratorPage | Generate policies |
| `StrategyToRDCallGenerator.jsx` | StrategyRDCallGeneratorPage | Generate R&D calls |

### Creation Components (9)
**Location:** `src/components/strategy/creation/`

| Component | Description |
|-----------|-------------|
| `ActionPlanBuilder.jsx` | Build action plans |
| `NationalStrategyLinker.jsx` | Link national strategies |
| `SectorStrategyBuilder.jsx` | Sector strategies |
| `StrategyObjectiveGenerator.jsx` | AI objective generation |
| `StrategyOwnershipAssigner.jsx` | Assign owners |
| `StrategyPillarGenerator.jsx` | Generate pillars |
| `StrategyTemplateLibrary.jsx` | Template library with coverage analysis |
| `StrategyTimelinePlanner.jsx` | Timeline planning |

### Templates Components (1)
**Location:** `src/components/strategy/templates/`

| Component | Description |
|-----------|-------------|
| `TemplateCoverageAnalysis.jsx` | Analyze template coverage against MoMAH taxonomy with AI recommendations |

### Governance Components (4)
**Location:** `src/components/strategy/governance/`

| Component | Description |
|-----------|-------------|
| `GovernanceMetricsDashboard.jsx` | Governance KPIs |
| `StakeholderSignoffTracker.jsx` | Track approvals |
| `StrategyCommitteeReview.jsx` | Committee decisions |
| `StrategyVersionControl.jsx` | Version history |

### Preplanning Components (6)
**Location:** `src/components/strategy/preplanning/`

| Component | Description |
|-----------|-------------|
| `BaselineDataCollector.jsx` | Baseline metrics |
| `EnvironmentalScanWidget.jsx` | PESTLE scanning |
| `RiskAssessmentBuilder.jsx` | Risk assessments |
| `SWOTAnalysisBuilder.jsx` | SWOT analysis |
| `StakeholderAnalysisWidget.jsx` | Stakeholder mapping |
| `StrategyInputCollector.jsx` | Strategy inputs |

### Communication Components (6)
**Location:** `src/components/strategy/communication/`

| Component | Description |
|-----------|-------------|
| `CommunicationAnalyticsDashboard.jsx` | Communication metrics |
| `ImpactStoryGenerator.jsx` | Generate stories |
| `PublicStrategyDashboard.jsx` | Public dashboard |
| `StakeholderNotificationManager.jsx` | Notifications |
| `StrategyCommunicationPlanner.jsx` | Plan communications |
| `StrategyPublicView.jsx` | Public view |

### Demand Components (5)
**Location:** `src/components/strategy/demand/`

| Component | Description |
|-----------|-------------|
| `AutomationControls.jsx` | Automation settings |
| `DemandDashboard.jsx` | Demand dashboard |
| `QueueReviewPanel.jsx` | Queue review |
| `RejectionFeedbackAnalysis.jsx` | Rejection analysis |
| `BatchGenerationControls.jsx` | Batch generation |

### Evaluation Components (3)
**Location:** `src/components/strategy/evaluation/`

| Component | Description |
|-----------|-------------|
| `CaseStudyGenerator.jsx` | Generate case studies |
| `LessonsLearnedCapture.jsx` | Capture lessons |
| `StrategyEvaluationPanel.jsx` | Expert evaluation |

### Recalibration Components (6)
**Location:** `src/components/strategy/recalibration/`

| Component | Description |
|-----------|-------------|
| `AdjustmentDecisionMatrix.jsx` | Decision matrix |
| `BaselineRecalibrator.jsx` | Recalibrate baselines |
| `FeedbackAnalysisEngine.jsx` | Analyze feedback |
| `MidCyclePivotManager.jsx` | Mid-cycle pivots |
| `NextCycleInitializer.jsx` | Next cycle init |
| `PhaseModificationExecutor.jsx` | Phase modifications |

### Review Components (3)
**Location:** `src/components/strategy/review/`

| Component | Description |
|-----------|-------------|
| `StrategyAdjustmentWizard.jsx` | Adjustment wizard |
| `StrategyImpactAssessment.jsx` | Impact assessment |
| `StrategyReprioritizer.jsx` | Reprioritize objectives |

### Monitoring Components (1)
**Location:** `src/components/strategy/monitoring/`

| Component | Description |
|-----------|-------------|
| `StrategyAlignmentScoreCard.jsx` | Alignment scorecard |

---

## 🪝 Hooks (35)

### Core Hooks (3)
**Location:** `src/hooks/`

| Hook | Description |
|------|-------------|
| `useStrategicKPI.js` | KPI management |
| `useStrategicCascadeValidation.js` | Cascade validation |
| `useStrategyAlignment.js` | Alignment calculation |

### Phase-Specific Hooks (32)
**Location:** `src/hooks/strategy/`

#### Phase 1: Pre-Planning (6)
| Hook | Description |
|------|-------------|
| `useEnvironmentalFactors.js` | PESTLE factors |
| `useRiskAssessment.js` | Risk management |
| `useStakeholderAnalysis.js` | Stakeholder analysis |
| `useStrategyBaselines.js` | Baseline data |
| `useStrategyInputs.js` | Strategy inputs |
| `useSwotAnalysis.js` | SWOT management |

#### Phase 2: Strategy Creation (7)
| Hook | Description |
|------|-------------|
| `useActionPlans.js` | Action plan CRUD |
| `useNationalAlignments.js` | National alignments |
| `useSectorStrategies.js` | Sector strategies |
| `useStrategyContext.js` | Strategic context |
| `useStrategyMilestones.js` | Milestones |
| `useStrategyOwnership.js` | Ownership |
| `useStrategyTemplates.js` | Templates |

#### Phase 3: Demand-Driven (5)
| Hook | Description |
|------|-------------|
| `useDemandQueue.js` | Queue management |
| `useGapAnalysis.js` | Gap analysis |
| `useQueueAutoPopulation.js` | Auto-population |
| `useQueueNotifications.js` | Queue notifications |
| `useBatchGeneration.js` | Batch generation |

#### Phase 4: Governance (7)
| Hook | Description |
|------|-------------|
| `useCommitteeAI.js` | AI committee assist |
| `useCommitteeDecisions.js` | Decision tracking |
| `useSignoffAI.js` | AI signoff assist |
| `useStrategySignoffs.js` | Signoff management |
| `useStrategyVersions.js` | Version control |
| `useVersionAI.js` | AI version compare |
| `useWorkflowAI.js` | AI workflow |

#### Phase 5: Communication (4)
| Hook | Description |
|------|-------------|
| `useCommunicationAI.js` | AI communication |
| `useCommunicationNotifications.js` | Notifications |
| `useCommunicationPlans.js` | Communication plans |
| `useImpactStories.js` | Impact stories |

#### Phase 7: Evaluation (1)
| Hook | Description |
|------|-------------|
| `useStrategyEvaluation.js` | Evaluation scoring |

#### Phase 8: Recalibration (1)
| Hook | Description |
|------|-------------|
| `useStrategyRecalibration.js` | Recalibration ops |

---

## 🔗 Contexts (3)

| Context | Location | Description |
|---------|----------|-------------|
| `StrategicPlanContext.jsx` | `src/contexts/` | Global active plan state |
| `index.js` | `src/hooks/strategy/` | Hook exports barrel |

---

## 📊 Coverage by Phase

| Phase | Pages | Components | Hooks | Hub Coverage | Status |
|-------|-------|------------|-------|--------------|--------|
| 1. Pre-Planning | 6 | 6 | 6 | ✅ Full Tab | ✅ Complete |
| 2. Creation | 5 | 9 | 7 | ⚠️ Partial (Sector missing) | ⚠️ 90% |
| 3. Cascade | 8 | 8 | 5 | ✅ Full Tab | ✅ Complete |
| 4. Governance | 2 | 4 | 7 | ✅ Full Tab | ✅ Complete |
| 5. Communication | 3 | 6 | 4 | ✅ Full Tab | ✅ Complete |
| 6. Monitoring | 6 | 2 | 3 | ⚠️ Some pages missing | ⚠️ 85% |
| 7. Evaluation | 1 | 3 | 1 | ⚠️ Not in Hub | ⚠️ 70% |
| 8. Recalibration | 1 | 6 | 1 | ⚠️ Not in Hub | ⚠️ 80% |

---

## 🔐 RBAC Permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `strategy_view` | View strategies | All roles |
| `strategy_manage` | Create/edit strategies | Admin, Strategy Officer, GDISB Lead |
| `strategy_cascade` | Generate from strategy | Admin, Strategy Officer, GDISB Lead |
| `strategy_approve` | Approve strategies | Admin, Executive Leadership |

---

## 📁 Edge Functions

| Function | Location | Description |
|----------|----------|-------------|
| `strategy-scheduled-analysis` | `supabase/functions/` | Scheduled gap analysis automation |
| `strategy-gap-analysis` | `supabase/functions/` | Coverage gap analysis |
| `strategy-demand-queue-generator` | `supabase/functions/` | AI queue generation |
| `strategy-quality-assessor` | `supabase/functions/` | AI quality validation |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `strategic_plans` | Core strategic plan data |
| `swot_analyses` | SWOT analysis records |
| `environmental_factors` | PESTLE factors |
| `stakeholder_analyses` | Stakeholder mapping |
| `strategy_risks` | Risk assessments |
| `strategy_baselines` | Baseline metrics |
| `strategy_inputs` | Strategy inputs |
| `action_plans` | Action plans |
| `action_items` | Action plan items |
| `demand_queue` | Generation queue |
| `generation_history` | Generation tracking |
| `coverage_snapshots` | Coverage trends |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Challenges | Receives generated challenges from cascade |
| Pilots | Receives generated pilots from cascade |
| R&D | Receives R&D calls from cascade |
| Programs | Receives programs from cascade |
| Partnerships | Receives partnership matches |
| Living Labs | Receives living lab concepts |
| Budget | Receives allocations |
| MII | Feeds into MII calculations |

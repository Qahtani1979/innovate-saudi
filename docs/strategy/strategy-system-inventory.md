# Strategy System Inventory

> **Version:** 3.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 156 files (35 pages, 65 components, 33 hooks + 3 contexts)  
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

## 📄 Pages (35)

### Core Strategy Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Strategy Hub** | `StrategyHub.jsx` | `/strategy-hub` | `strategy_view` | Self (Root) |
| Strategy Cockpit | `StrategyCockpit.jsx` | `/strategy-cockpit` | `strategy_view` | Strategy Hub |
| Strategy Drill-Down | `StrategyDrillDown.jsx` | `/strategy-drill-down` | `strategy_view` | Strategy Hub |
| Strategy Alignment | `StrategyAlignment.jsx` | `/strategy-alignment` | `strategy_view` | Strategy Hub |
| Strategy Review | `StrategyReviewPage.jsx` | `/strategy-review-page` | `strategy_manage` | Strategy Hub |
| Strategy Governance | `StrategyGovernancePage.jsx` | `/strategy-governance-page` | `strategy_manage` | Strategy Hub |
| Strategy Demand Dashboard | `StrategyDemandDashboardPage.jsx` | `/strategy-demand-dashboard` | `strategy_manage` | Strategy Hub |
| Strategic Plan Builder | `StrategicPlanBuilder.jsx` | `/strategic-plan-builder` | `strategy_manage` | Strategy Hub |
| Strategic Execution Dashboard | `StrategicExecutionDashboard.jsx` | `/strategic-execution-dashboard` | `strategy_view` | Strategy Hub |
| Strategic Planning Progress | `StrategicPlanningProgress.jsx` | `/strategic-planning-progress` | `strategy_view` | Strategy Hub |

### Pre-Planning Pages (Phase 1)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Environmental Scan | `EnvironmentalScanPage.jsx` | `/environmental-scan-page` | `strategy_manage` | Strategy Hub |
| SWOT Analysis | `SWOTAnalysisPage.jsx` | `/swot-analysis-page` | `strategy_manage` | Strategy Hub |
| Stakeholder Analysis | `StakeholderAnalysisPage.jsx` | `/stakeholder-analysis-page` | `strategy_manage` | Strategy Hub |
| Risk Assessment | `RiskAssessmentPage.jsx` | `/risk-assessment-page` | `strategy_manage` | Strategy Hub |
| Baseline Data | `BaselineDataPage.jsx` | `/baseline-data-page` | `strategy_manage` | Strategy Hub |
| Strategy Input | `StrategyInputPage.jsx` | `/strategy-input-page` | `strategy_manage` | Strategy Hub |

### Strategy Creation Pages (Phase 2)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Strategy Timeline | `StrategyTimelinePage.jsx` | `/strategy-timeline-page` | `strategy_manage` | Strategy Hub |
| Strategy Ownership | `StrategyOwnershipPage.jsx` | `/strategy-ownership-page` | `strategy_manage` | Strategy Hub |
| Strategy Templates | `StrategyTemplatesPage.jsx` | `/strategy-templates-page` | `strategy_view` | Strategy Hub |
| National Strategy Linker | `NationalStrategyLinkerPage.jsx` | `/national-strategy-linker-page` | `strategy_manage` | Strategy Hub |
| Action Plan | `ActionPlanPage.jsx` | `/action-plan-page` | `strategy_manage` | Strategy Hub |

### Cascade Generator Pages (Phase 3)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Policy Generator | `StrategyPolicyGeneratorPage.jsx` | `/strategy-policy-generator-page` | `strategy_cascade` | Strategy Hub |
| Challenge Generator | `StrategyChallengeGeneratorPage.jsx` | `/strategy-challenge-generator-page` | `strategy_cascade` | Strategy Hub |
| R&D Call Generator | `StrategyRDCallGeneratorPage.jsx` | `/strategy-rd-call-generator-page` | `strategy_cascade` | Strategy Hub |
| Pilot Generator | `StrategyPilotGeneratorPage.jsx` | `/strategy-pilot-generator-page` | `strategy_cascade` | Strategy Hub |
| Partnership Generator | `StrategyPartnershipGeneratorPage.jsx` | `/strategy-partnership-generator-page` | `strategy_cascade` | Strategy Hub |
| Event Generator | `StrategyEventGeneratorPage.jsx` | `/strategy-event-generator-page` | `strategy_cascade` | Strategy Hub |
| Living Lab Generator | `StrategyLivingLabGeneratorPage.jsx` | `/strategy-living-lab-generator-page` | `strategy_cascade` | Strategy Hub |
| Campaign Generator | `StrategyCampaignGeneratorPage.jsx` | `/strategy-campaign-generator-page` | `strategy_cascade` | Strategy Hub |

### Communication Pages (Phase 5)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Communication Hub | `strategy/StrategyCommunicationPage.jsx` | `/strategy-communication-page` | `strategy_view` | Strategy Hub |
| Public Dashboard | `strategy/PublicStrategyDashboardPage.jsx` | `/public-strategy-dashboard-page` | `strategy_view` | Strategy Hub |
| Public View | `strategy/StrategyPublicViewPage.jsx` | `/strategy-public-view-page` | `strategy_view` | Strategy Hub |

### Related Executive Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| What-If Simulator | `WhatIfSimulatorPage.jsx` | `/what-if-simulator-page` | `strategy_view` | Strategy Hub |
| Gap Analysis Tool | `GapAnalysisTool.jsx` | `/gap-analysis-tool` | `strategy_manage` | Strategy Hub |
| Budget Allocation | `BudgetAllocationTool.jsx` | `/budget-allocation-tool` | `strategy_manage` | Strategy Hub |
| Strategic KPI Tracker | `StrategicKPITracker.jsx` | `/strategic-kpi-tracker` | `strategy_view` | Strategy Hub |

---

## 🧩 Components (65)

### Root Strategy Components (18)
**Location:** `src/components/strategy/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `ActivePlanBanner.jsx` | Active plan selector banner | All strategy pages |
| `AutomatedMIICalculator.jsx` | MII score calculator | Strategy cockpit |
| `BottleneckDetector.jsx` | AI pipeline bottleneck detection | Strategy cockpit |
| `CollaborationMapper.jsx` | R&D collaboration partner finder | Strategy cockpit |
| `GeographicCoordinationWidget.jsx` | Municipality coordination | Strategy cockpit |
| `HistoricalComparison.jsx` | Year-over-year trends | Strategy cockpit |
| `PartnershipNetwork.jsx` | Partnership network analysis | Strategy cockpit |
| `ResourceAllocationView.jsx` | Resource distribution | Strategy cockpit |
| `SectorGapAnalysisWidget.jsx` | Sector coverage gaps | Strategy cockpit |
| `StrategicAlignmentWidget.jsx` | Display linked plans | Multiple pages |
| `StrategicCoverageWidget.jsx` | Coverage metrics | Strategy cockpit |
| `StrategicGapProgramRecommender.jsx` | Program gap recommendations | Strategy hub |
| `StrategicNarrativeGenerator.jsx` | AI narrative generation | Strategy cockpit |
| `StrategicPlanSelector.jsx` | Multi-select plan picker | All pages |
| `StrategicPlanWorkflowTab.jsx` | Workflow visualization | Strategy hub |
| `StrategyChallengeRouter.jsx` | Challenge track routing | Challenge pages |
| `StrategyToProgramGenerator.jsx` | Generate programs | Strategy hub |
| `WhatIfSimulator.jsx` | Budget scenario simulator | What-if page |

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

### Creation Components (8)
**Location:** `src/components/strategy/creation/`

| Component | Description |
|-----------|-------------|
| `ActionPlanBuilder.jsx` | Build action plans |
| `NationalStrategyLinker.jsx` | Link national strategies |
| `SectorStrategyBuilder.jsx` | Sector strategies |
| `StrategyObjectiveGenerator.jsx` | AI objective generation |
| `StrategyOwnershipAssigner.jsx` | Assign owners |
| `StrategyPillarGenerator.jsx` | Generate pillars |
| `StrategyTemplateLibrary.jsx` | Template library |
| `StrategyTimelinePlanner.jsx` | Timeline planning |

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

## 🪝 Hooks (33)

### Core Hooks (3)
**Location:** `src/hooks/`

| Hook | Description |
|------|-------------|
| `useStrategicKPI.js` | KPI management |
| `useStrategicCascadeValidation.js` | Cascade validation |
| `useStrategyAlignment.js` | Alignment calculation |

### Phase-Specific Hooks (30)
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

#### Phase 3: Demand-Driven (4)
| Hook | Description |
|------|-------------|
| `useDemandQueue.js` | Queue management |
| `useGapAnalysis.js` | Gap analysis |
| `useQueueAutoPopulation.js` | Auto-population |
| `useQueueNotifications.js` | Queue notifications |

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

| Phase | Pages | Components | Hooks | Status |
|-------|-------|------------|-------|--------|
| 1. Pre-Planning | 6 | 6 | 6 | ✅ Complete |
| 2. Creation | 5 | 8 | 7 | ✅ Complete |
| 3. Cascade | 8 | 8 | 4 | ✅ Complete |
| 4. Governance | 2 | 4 | 7 | ✅ Complete |
| 5. Communication | 3 | 6 | 4 | ✅ Complete |
| 6. Monitoring | 2 | 1 | 0 | ⚠️ Basic |
| 7. Evaluation | 0 | 3 | 1 | ⚠️ Basic |
| 8. Recalibration | 1 | 6 | 1 | ✅ Complete |

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

# Strategy System Inventory

> **Version:** 1.5  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 123 files (21 pages, 55 components, 30 hooks + 2 context files + 15 registered routes)

---

## Overview

The Strategy System is the core strategic planning and execution framework that spans all 8 phases of the strategic methodology. This document provides a complete inventory of all pages, components, and hooks that comprise the system.

**All pages are now registered in `pages.config.js` and accessible from the Strategy Hub.**

---

## 🌐 Global Active Plan Context

All strategy pages use a shared global context for maintaining the active strategic plan selection:

| File | Description |
|------|-------------|
| `src/contexts/StrategicPlanContext.jsx` | Global context with localStorage persistence |
| `src/components/strategy/ActivePlanBanner.jsx` | Reusable banner component showing active plan selector |

### Usage Pattern
- All strategy pages import `useActivePlan` from the context
- Pages render `ActivePlanBanner` for consistent UI
- `activePlanId` and `activePlan` are passed to child components
- Hooks accept `strategicPlanId` parameter for database filtering
- All hooks use correct database column names (validated 2025-12-14)

### Database Schema Notes
- `swot_analyses`: Uses individual records per item with `quadrant` field (strengths/weaknesses/opportunities/threats)
- `stakeholder_analyses`: Uses `stakeholder_name_en`/`stakeholder_name_ar` columns
- `strategy_risks`: Uses `category` (not `risk_category`), `owner_email` (not `owner`)
- `strategy_baselines`: Uses `source` (not `data_source`)
- No soft delete (`is_deleted`) columns in strategy tables - use hard delete

---

## 🔐 RBAC Configuration

### Roles with Strategy Access

| Role | Permission | Access Level |
|------|------------|--------------|
| **Admin** | `*` (all) | Full access to all strategy features |
| **Strategy Officer** | `strategy_manage`, `strategy_view`, `strategy_cascade`, `strategy_approve` | Full strategy management |
| **GDISB Strategy Lead** | `strategy_manage`, `strategy_cascade` | Full strategy management |
| **Executive Leadership** | `strategy_view` | View-only access |
| **Deputyship Director/Manager/Analyst** | `strategy_view` | View-only access |
| **Municipality Admin/Manager/Director** | `strategy_view` | View-only access |
| **Program Director/Manager** | `strategy_view` | View-only access |

### Permission Codes

| Permission | Description | Used By |
|------------|-------------|---------|
| `strategy_manage` | Create/edit strategic plans, ownership, governance | Core strategy pages |
| `strategy_view` | View strategies and dashboards | Hub, Templates, Public pages |
| `strategy_cascade` | Generate entities from strategy (pilots, challenges, etc.) | Generator pages |
| `strategy_approve` | Approve strategic plans and changes | Governance page |

---

## 📄 Pages (21)

### Core Strategy Pages

| Page | File | Route | Hub Tab | Permission | Description |
|------|------|-------|---------|------------|-------------|
| **Strategy Hub** | `StrategyHub.jsx` | `/strategy-hub` | Self | `strategy_view` | **Central command center** - 6 tabs |
| Strategy Cockpit | `StrategyCockpit.jsx` | `/strategy-cockpit` | Header | `strategy_view` | Main strategic dashboard |
| Strategy Drill-Down | `StrategyDrillDown.jsx` | `/strategy-drill-down` | Workflow | `strategy_view` | Detailed plan analysis |
| Strategy Alignment | `StrategyAlignment.jsx` | `/strategy-alignment` | Workflow/AI | `strategy_view` | Cross-entity alignment |
| Strategy Review | `StrategyReviewPage.jsx` | `/strategy-review-page` | Pre-Planning | `strategy_manage` | Adjustment and reprioritization |
| Strategy Governance | `StrategyGovernancePage.jsx` | `/strategy-governance-page` | Governance | `strategy_manage` | Approvals, versioning |

### Strategy Creation Pages

| Page | File | Route | Hub Tab | Permission | Description |
|------|------|-------|---------|------------|-------------|
| Strategy Ownership | `StrategyOwnershipPage.jsx` | `/strategy-ownership-page` | Governance | `strategy_manage` | Assign ownership |
| Strategy Templates | `StrategyTemplatesPage.jsx` | `/strategy-templates-page` | Cascade | `strategy_view` | Template library |
| National Strategy Linker | `NationalStrategyLinkerPage.jsx` | `/national-strategy-linker-page` | Cascade | `strategy_manage` | Link to national strategies |
| Baseline Data | `BaselineDataPage.jsx` | `/baseline-data-page` | Pre-Planning | `strategy_manage` | Collect baseline data |
| Action Plan | `ActionPlanPage.jsx` | `/action-plan-page` | Cascade | `strategy_manage` | Build action plans |

### Strategy Cascade Generator Pages

| Page | File | Route | Hub Tab | Permission | Description |
|------|------|-------|---------|------------|-------------|
| Campaign Generator | `StrategyCampaignGeneratorPage.jsx` | `/strategy-campaign-generator-page` | Cascade | `strategy_cascade` | Generate campaigns |
| Policy Generator | `StrategyPolicyGeneratorPage.jsx` | `/strategy-policy-generator-page` | Cascade | `strategy_cascade` | Generate policies |
| Challenge Generator | `StrategyChallengeGeneratorPage.jsx` | `/strategy-challenge-generator-page` | Cascade | `strategy_cascade` | Generate challenges |
| R&D Call Generator | `StrategyRDCallGeneratorPage.jsx` | `/strategy-rd-call-generator-page` | Cascade | `strategy_cascade` | Generate R&D calls |
| Pilot Generator | `StrategyPilotGeneratorPage.jsx` | `/strategy-pilot-generator-page` | Cascade | `strategy_cascade` | Generate pilots |
| Partnership Generator | `StrategyPartnershipGeneratorPage.jsx` | `/strategy-partnership-generator-page` | Cascade | `strategy_cascade` | Find partners |
| Event Generator | `StrategyEventGeneratorPage.jsx` | `/strategy-event-generator-page` | Cascade | `strategy_cascade` | Generate events |
| Living Lab Generator | `StrategyLivingLabGeneratorPage.jsx` | `/strategy-living-lab-generator-page` | Cascade | `strategy_cascade` | Generate living labs |

### Strategy Communication Pages

| Page | File | Route | Hub Tab | Permission | Description |
|------|------|-------|---------|------------|-------------|
| Communication Hub | `StrategyCommunicationPage.jsx` | `/strategy-communication-page` | Communication | `strategy_view` | Full communication management |
| Public Dashboard | `PublicStrategyDashboardPage.jsx` | `/public-strategy-dashboard-page` | Communication | `strategy_view` | Public-facing dashboard |
| Public View | `StrategyPublicViewPage.jsx` | `/strategy-public-view-page` | Communication | `strategy_view` | Share strategy externally |

---

## 🧩 Components (55)

### Root Strategy Components (17)
**Location:** `src/components/strategy/`

| Component | Description |
|-----------|-------------|
| `AutomatedMIICalculator.jsx` | Calculate Municipal Innovation Index scores |
| `BottleneckDetector.jsx` | AI-powered pipeline bottleneck detection |
| `CollaborationMapper.jsx` | Find R&D collaboration partners |
| `GeographicCoordinationWidget.jsx` | Municipality coordination display |
| `HistoricalComparison.jsx` | Year-over-year trend visualization |
| `PartnershipNetwork.jsx` | Partnership network analysis |
| `ResourceAllocationView.jsx` | Resource distribution visualization |
| `SectorGapAnalysisWidget.jsx` | Sector coverage gap analysis |
| `StrategicAlignmentWidget.jsx` | Display linked strategic plans |
| `StrategicCoverageWidget.jsx` | Strategic coverage metrics |
| `StrategicGapProgramRecommender.jsx` | Recommend programs for gaps |
| `StrategicNarrativeGenerator.jsx` | AI narrative generation |
| `StrategicPlanSelector.jsx` | Multi-select strategic plan picker |
| `StrategicPlanWorkflowTab.jsx` | Workflow stage visualization |
| `StrategyChallengeRouter.jsx` | Route challenges to tracks |
| `StrategyToProgramGenerator.jsx` | Generate programs from strategy |
| `WhatIfSimulator.jsx` | Budget scenario simulator |

### Cascade Components (8)
**Location:** `src/components/strategy/cascade/`

| Component | Description |
|-----------|-------------|
| `StrategyChallengeGenerator.jsx` | Generate challenges from strategic objectives |
| `StrategyToCampaignGenerator.jsx` | Generate awareness campaigns |
| `StrategyToEventGenerator.jsx` | Generate strategic events |
| `StrategyToLivingLabGenerator.jsx` | Generate living lab concepts |
| `StrategyToPartnershipGenerator.jsx` | Find strategic partnership matches |
| `StrategyToPilotGenerator.jsx` | Generate pilot project designs |
| `StrategyToPolicyGenerator.jsx` | Generate policy documents |
| `StrategyToRDCallGenerator.jsx` | Generate R&D call proposals |

### Creation Components (8)
**Location:** `src/components/strategy/creation/`

| Component | Description |
|-----------|-------------|
| `ActionPlanBuilder.jsx` | Build action plans with items |
| `NationalStrategyLinker.jsx` | Link to national strategies |
| `SectorStrategyBuilder.jsx` | Build sector-specific strategies |
| `StrategyObjectiveGenerator.jsx` | AI objective generation |
| `StrategyOwnershipAssigner.jsx` | Assign owners to elements |
| `StrategyPillarGenerator.jsx` | Generate strategic pillars |
| `StrategyTemplateLibrary.jsx` | Browse/apply strategy templates |
| `StrategyTimelinePlanner.jsx` | Plan strategic timelines |

### Governance Components (4)
**Location:** `src/components/strategy/governance/`

| Component | Description |
|-----------|-------------|
| `GovernanceMetricsDashboard.jsx` | Governance KPI dashboard |
| `StakeholderSignoffTracker.jsx` | Track stakeholder approvals |
| `StrategyCommitteeReview.jsx` | Committee decision management |
| `StrategyVersionControl.jsx` | Strategy version history |

### Monitoring Components (1)
**Location:** `src/components/strategy/monitoring/`

| Component | Description |
|-----------|-------------|
| `StrategyAlignmentScoreCard.jsx` | Alignment score with gaps/recommendations |

### Preplanning Components (6)
**Location:** `src/components/strategy/preplanning/`

| Component | Description |
|-----------|-------------|
| `BaselineDataCollector.jsx` | Collect baseline metrics |
| `EnvironmentalScanWidget.jsx` | PESTLE environmental scanning |
| `RiskAssessmentBuilder.jsx` | Build risk assessments |
| `SWOTAnalysisBuilder.jsx` | SWOT analysis builder |
| `StakeholderAnalysisWidget.jsx` | Stakeholder mapping |
| `StrategyInputCollector.jsx` | Collect strategy inputs |

### Evaluation Components (3)
**Location:** `src/components/strategy/evaluation/`

| Component | Description |
|-----------|-------------|
| `CaseStudyGenerator.jsx` | Generate case studies from outcomes |
| `LessonsLearnedCapture.jsx` | Capture lessons learned |
| `StrategyEvaluationPanel.jsx` | Expert evaluation panel |

### Recalibration Components (6)
**Location:** `src/components/strategy/recalibration/`

| Component | Description |
|-----------|-------------|
| `AdjustmentDecisionMatrix.jsx` | Decision matrix for adjustments |
| `BaselineRecalibrator.jsx` | Recalibrate baselines |
| `FeedbackAnalysisEngine.jsx` | Analyze stakeholder feedback |
| `MidCyclePivotManager.jsx` | Manage mid-cycle pivots |
| `NextCycleInitializer.jsx` | Initialize next strategy cycle |
| `PhaseModificationExecutor.jsx` | Execute phase modifications |

### Review Components (3)
**Location:** `src/components/strategy/review/`

| Component | Description |
|-----------|-------------|
| `StrategyAdjustmentWizard.jsx` | Guided strategy adjustment |
| `StrategyImpactAssessment.jsx` | Assess strategy impact |
| `StrategyReprioritizer.jsx` | Reprioritize objectives |

### Communication Components (6)
**Location:** `src/components/strategy/communication/`

| Component | Description |
|-----------|-------------|
| `CommunicationAnalyticsDashboard.jsx` | Communication metrics |
| `ImpactStoryGenerator.jsx` | Generate impact stories |
| `PublicStrategyDashboard.jsx` | Public-facing dashboard |
| `StakeholderNotificationManager.jsx` | Manage notifications |
| `StrategyCommunicationPlanner.jsx` | Plan communications |
| `StrategyPublicView.jsx` | Public strategy view |

---

## 🪝 Hooks (30)

### Core Strategy Hooks (3)
**Location:** `src/hooks/`

| Hook | Description |
|------|-------------|
| `useStrategicKPI.js` | Strategic KPI management and contribution tracking |
| `useStrategicCascadeValidation.js` | Validate strategy cascade integrity |
| `useStrategyAlignment.js` | Calculate entity alignment scores |

### Phase-Specific Strategy Hooks (27)
**Location:** `src/hooks/strategy/`

#### Phase 1: Pre-Planning
| Hook | Description |
|------|-------------|
| `useEnvironmentalFactors.js` | PESTLE environmental factors |
| `useRiskAssessment.js` | Risk assessment management |
| `useStakeholderAnalysis.js` | Stakeholder analysis |
| `useStrategyBaselines.js` | Baseline data management |
| `useStrategyInputs.js` | Strategy input collection |
| `useSwotAnalysis.js` | SWOT analysis management |

#### Phase 2: Strategy Creation
| Hook | Description |
|------|-------------|
| `useActionPlans.js` | Action plan CRUD operations |
| `useNationalAlignments.js` | National strategy alignments |
| `useSectorStrategies.js` | Sector strategy management |
| `useStrategyContext.js` | Aggregate strategic context |
| `useStrategyMilestones.js` | Milestone management |
| `useStrategyOwnership.js` | Ownership assignments |
| `useStrategyTemplates.js` | Template management |

#### Phase 4: Governance
| Hook | Description |
|------|-------------|
| `useCommitteeAI.js` | AI-assisted committee decisions |
| `useCommitteeDecisions.js` | Committee decision tracking |
| `useSignoffAI.js` | AI-assisted signoff analysis |
| `useStrategySignoffs.js` | Stakeholder signoff management |
| `useStrategyVersions.js` | Version control management |
| `useVersionAI.js` | AI-assisted version comparison |
| `useWorkflowAI.js` | AI-assisted workflow optimization |

#### Phase 5: Communication
| Hook | Description |
|------|-------------|
| `useCommunicationAI.js` | AI-powered communication |
| `useCommunicationNotifications.js` | Notification management |
| `useCommunicationPlans.js` | Communication plan CRUD |
| `useImpactStories.js` | Impact story management |

#### Phase 7: Evaluation
| Hook | Description |
|------|-------------|
| `useStrategyEvaluation.js` | Strategy evaluation and scoring |

#### Phase 8: Recalibration
| Hook | Description |
|------|-------------|
| `useStrategyRecalibration.js` | Strategy recalibration operations |

---

## 📊 Summary by Phase

| Phase | Components | Hooks | Pages |
|-------|------------|-------|-------|
| Phase 1: Pre-Planning | 6 | 6 | 1 |
| Phase 2: Strategy Creation | 8 | 7 | 4 |
| Phase 3: Cascade to Entities | 8 | 0 | 8 |
| Phase 4: Governance | 4 | 6 | 1 |
| Phase 5: Communication | 6 | 4 | 0 |
| Phase 6: Monitoring | 1 + 17 root | 3 core | 3 |
| Phase 7: Evaluation | 3 | 1 | 0 |
| Phase 8: Recalibration | 6 | 1 | 0 |
| **TOTAL** | **55** | **30** | **17** |

---

## 🔗 Related Documentation

- [Strategy Design](./strategy-design.md) - Architecture and design decisions
- [Strategy Integration Matrix](./strategy-integration-matrix.md) - Entity integration mapping
- [Plan Tracker](./plan-tracker.md) - Implementation progress tracking
- [Phase Methodologies](./phase1-strategic-methodology.md) - Detailed phase documentation

---

## 📁 File Structure

```
src/
├── pages/
│   ├── StrategyCockpit.jsx
│   ├── StrategyDrillDown.jsx
│   ├── StrategyAlignment.jsx
│   ├── StrategyReviewPage.jsx
│   ├── StrategyGovernancePage.jsx
│   ├── StrategyOwnershipPage.jsx
│   ├── StrategyTemplatesPage.jsx
│   ├── NationalStrategyLinkerPage.jsx
│   ├── BaselineDataPage.jsx
│   ├── StrategyCampaignGeneratorPage.jsx
│   ├── StrategyPolicyGeneratorPage.jsx
│   ├── StrategyChallengeGeneratorPage.jsx
│   ├── StrategyRDCallGeneratorPage.jsx
│   ├── StrategyPilotGeneratorPage.jsx
│   ├── StrategyPartnershipGeneratorPage.jsx
│   ├── StrategyEventGeneratorPage.jsx
│   └── StrategyLivingLabGeneratorPage.jsx
├── components/
│   └── strategy/
│       ├── cascade/ (8 components)
│       ├── communication/ (6 components)
│       ├── creation/ (8 components)
│       ├── evaluation/ (3 components)
│       ├── governance/ (4 components)
│       ├── monitoring/ (1 component)
│       ├── preplanning/ (6 components)
│       ├── recalibration/ (6 components)
│       ├── review/ (3 components)
│       └── [17 root components]
└── hooks/
    ├── useStrategicKPI.js
    ├── useStrategicCascadeValidation.js
    ├── useStrategyAlignment.js
    └── strategy/ (27 hooks)
```

---

*This inventory is automatically maintained and should be updated when new strategy system components are added.*

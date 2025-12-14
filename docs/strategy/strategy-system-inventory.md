# Strategy System Inventory

> **Version:** 1.1  
> **Last Updated:** 2025-01-14  
> **Total Assets:** 103 files (18 pages, 55 components, 30 hooks)

---

## Overview

The Strategy System is the core strategic planning and execution framework that spans all 8 phases of the strategic methodology. This document provides a complete inventory of all pages, components, and hooks that comprise the system.

---

## 📄 Pages (17)

### Core Strategy Pages

| Page | File | Route | Description |
|------|------|-------|-------------|
| **Strategy Hub** | `StrategyHub.jsx` | `/strategy-hub` | **Central command center** - tabbed dashboard with workflow, cascade, governance, AI tools |
| Strategy Cockpit | `StrategyCockpit.jsx` | `/strategy-cockpit` | Main strategic dashboard with portfolio overview |
| Strategy Drill-Down | `StrategyDrillDown.jsx` | `/strategy-drill-down` | Detailed strategic plan analysis |
| Strategy Alignment | `StrategyAlignment.jsx` | `/strategy-alignment` | Cross-entity alignment visualization |
| Strategy Review | `StrategyReviewPage.jsx` | `/strategy-review` | Strategy adjustment and reprioritization |
| Strategy Governance | `StrategyGovernancePage.jsx` | `/strategy-governance` | Approvals, versioning, committee review |

### Strategy Creation Pages

| Page | File | Route | Description |
|------|------|-------|-------------|
| Strategy Ownership | `StrategyOwnershipPage.jsx` | `/strategy-ownership` | Assign ownership to strategic elements |
| Strategy Templates | `StrategyTemplatesPage.jsx` | `/strategy-templates` | Template library for strategy creation |
| National Strategy Linker | `NationalStrategyLinkerPage.jsx` | `/national-strategy-linker` | Link to national/federal strategies |
| Baseline Data | `BaselineDataPage.jsx` | `/baseline-data` | Collect pre-planning baseline data |

### Strategy Cascade Generator Pages

| Page | File | Route | Description |
|------|------|-------|-------------|
| Campaign Generator | `StrategyCampaignGeneratorPage.jsx` | `/strategy-campaign-generator` | Generate campaigns from objectives |
| Policy Generator | `StrategyPolicyGeneratorPage.jsx` | `/strategy-policy-generator` | Generate policies from priorities |
| Challenge Generator | `StrategyChallengeGeneratorPage.jsx` | `/strategy-challenge-generator` | Generate challenges from objectives |
| R&D Call Generator | `StrategyRDCallGeneratorPage.jsx` | `/strategy-rd-call-generator` | Generate R&D calls from gaps |
| Pilot Generator | `StrategyPilotGeneratorPage.jsx` | `/strategy-pilot-generator` | Generate pilots from challenges |
| Partnership Generator | `StrategyPartnershipGeneratorPage.jsx` | `/strategy-partnership-generator` | Find strategic partners |
| Event Generator | `StrategyEventGeneratorPage.jsx` | `/strategy-event-generator` | Generate strategic events |
| Living Lab Generator | `StrategyLivingLabGeneratorPage.jsx` | `/strategy-living-lab-generator` | Generate living lab concepts |

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

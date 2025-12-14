# Pilots System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 52 files (20 pages, 27 components, 5 hooks)  
> **Parent System:** Pilot Project Management  
> **Hub Page:** `/pilots`

---

## Overview

The Pilots System manages the full lifecycle of innovation pilots from design through evaluation, scaling, and policy impact. It includes stage-gate workflows, monitoring dashboards, and scaling preparation.

---

## 📄 Pages (20)

### Core Pilot Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Pilots** | `Pilots.jsx` | `/pilots` | `pilot_view` | Self (Root) |
| Pilot Create | `PilotCreate.jsx` | `/pilot-create` | `pilot_create` | Pilots |
| Pilot Detail | `PilotDetail.jsx` | `/pilot-detail` | `pilot_view` | Pilots |
| Pilot Edit | `PilotEdit.jsx` | `/pilot-edit` | `pilot_edit` | Pilot Detail |
| Pilot Launch Wizard | `PilotLaunchWizard.jsx` | `/pilot-launch-wizard` | `pilot_create` | Pilots |

### Pilot Workflow Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Pilot Gates Overview | `PilotGatesOverview.jsx` | `/pilot-gates-overview` | `pilot_manage` | Pilots |
| Pilot Management Panel | `PilotManagementPanel.jsx` | `/pilot-management-panel` | `pilot_manage` | Pilots |
| Pilot Workflow Guide | `PilotWorkflowGuide.jsx` | `/pilot-workflow-guide` | `pilot_view` | Pilots |
| Pilot Evaluations | `PilotEvaluations.jsx` | `/pilot-evaluations` | `pilot_evaluate` | Pilots |
| Iteration Workflow | `IterationWorkflow.jsx` | `/iteration-workflow` | `pilot_manage` | Pilots |

### Pilot Monitoring Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Pilot Monitoring Dashboard | `PilotMonitoringDashboard.jsx` | `/pilot-monitoring-dashboard` | `pilot_view` | Pilots |
| Pilot Success Patterns | `PilotSuccessPatterns.jsx` | `/pilot-success-patterns` | `pilot_view` | Pilots |

### Pilot Scaling Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Pilot Scaling Matcher | `PilotScalingMatcher.jsx` | `/pilot-scaling-matcher` | `pilot_manage` | Pilots |
| Scaling Workflow | `ScalingWorkflow.jsx` | `/scaling-workflow` | `pilot_manage` | Pilots |
| Collaborative Pilots | `CollaborativePilots.jsx` | `/collaborative-pilots` | `pilot_view` | Pilots |

### Personal & Reports Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| My Pilots | `MyPilots.jsx` | `/my-pilots` | `authenticated` | Personal |
| Pilot Coverage Report | `PilotCoverageReport.jsx` | `/pilot-coverage-report` | `admin` | Admin |
| Pilots Coverage Report | `PilotsCoverageReport.jsx` | `/pilots-coverage-report` | `admin` | Admin |

### Citizen Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Citizen Pilot Enrollment | `CitizenPilotEnrollment.jsx` | `/citizen-pilot-enrollment` | `public` | Citizen |

---

## 🧩 Components (27)

### Pilot Workflow Components
**Location:** `src/components/pilots/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AdaptiveManagement.jsx` | Adaptive management tools | PilotDetail |
| `PilotActivityLog.jsx` | Activity history | PilotDetail |
| `PilotBenchmarking.jsx` | Benchmarking analysis | Analytics |
| `PilotLearningEngine.jsx` | Learning from pilots | PilotDetail |
| `PilotPerformanceBenchmarking.jsx` | Performance comparison | Analytics |
| `PilotRetrospectiveCapture.jsx` | Capture retrospectives | PilotDetail |
| `ScalingReadiness.jsx` | Scaling readiness assessment | PilotDetail |
| `SuccessPatternAnalyzer.jsx` | Analyze success patterns | Analytics |
| `PreFlightRiskSimulator.jsx` | Pre-flight risk simulation | PilotCreate |

### Pilot Monitoring Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `CostTracker.jsx` | Cost tracking | PilotDetail |
| `RealTimeKPIIntegration.jsx` | KPI integration | Monitoring |
| `RealTimeKPIMonitor.jsx` | Real-time KPIs | Monitoring |
| `PilotsAIInsights.jsx` | AI insights | Pilots |

### Pilot Conversion Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `PilotToPolicyWorkflow.jsx` | Convert to policy | PilotDetail |
| `PilotToProcurementWorkflow.jsx` | Convert to procurement | PilotDetail |
| `PilotToRDWorkflow.jsx` | Convert to R&D | PilotDetail |
| `SolutionFeedbackLoop.jsx` | Solution feedback | PilotDetail |

### Pilot Collaboration Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `MultiCityOrchestration.jsx` | Multi-city coordination | CollaborativePilots |
| `StakeholderHub.jsx` | Stakeholder management | PilotDetail |

### Root-Level Pilot Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `PilotEvaluationGate.jsx` | Evaluation gate |
| `PilotFlowDiagram.jsx` | Flow visualization |
| `PilotPivotWorkflow.jsx` | Pivot workflow |
| `PilotPreparationChecklist.jsx` | Preparation checklist |
| `PilotSubmissionWizard.jsx` | Submission wizard |
| `PilotTerminationWorkflow.jsx` | Termination workflow |

### Strategy Components
**Location:** `src/components/strategy/cascade/`

| Component | Description |
|-----------|-------------|
| `StrategyToPilotGenerator.jsx` | Generate pilots from strategy |

---

## 🪝 Hooks (5)

**Location:** `src/hooks/`

| Hook | Description |
|------|-------------|
| `usePilotsWithVisibility.js` | Pilots with visibility filtering |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `pilots` | Core pilot data |
| `pilot_outcomes` | Pilot outcomes |
| `pilot_stakeholders` | Stakeholder relationships |
| `pilot_kpis` | KPI tracking |
| `citizen_pilot_enrollments` | Citizen enrollments |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `pilot_view` | View pilots |
| `pilot_view_all` | View all pilots |
| `pilot_view_own` | View own pilots |
| `pilot_create` | Create pilots |
| `pilot_edit` | Edit pilots |
| `pilot_manage` | Manage pilots |
| `pilot_evaluate` | Evaluate pilots |
| `pilot_support` | Support pilots |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Strategy | Receives generated pilots |
| Challenges | Creates pilots from challenges |
| Solutions | Tests solutions in pilots |
| R&D | Validates R&D outcomes |
| Programs | Supports program participants |
| Scaling | Feeds into scaling workflow |
| Policy | Informs policy recommendations |

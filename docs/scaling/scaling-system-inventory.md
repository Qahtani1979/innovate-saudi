# Scaling System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 28 files (8 pages, 18 components, 2 hooks)  
> **Parent System:** Innovation Scaling Management  
> **Hub Page:** `/scaling-workflow`

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← Partnerships](../partnerships/partnerships-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Events →](../events/events-system-inventory.md) |

---

## Overview

The Scaling System manages the transition of successful pilots to full-scale implementation across municipalities, including readiness assessment, rollout planning, and success monitoring.

---

## 📄 Pages (8)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Scaling Workflow** | `ScalingWorkflow.jsx` | `/scaling-workflow` | `scaling_view` | Self (Root) |
| Scaling Plan Detail | `ScalingPlanDetail.jsx` | `/scaling-plan-detail` | `scaling_view` | Scaling Workflow |
| Scaling Plan Create | `ScalingPlanCreate.jsx` | `/scaling-plan-create` | `scaling_create` | Scaling Workflow |
| Scaling Plan Edit | `ScalingPlanEdit.jsx` | `/scaling-plan-edit` | `scaling_edit` | Scaling Plan Detail |
| Pilot Scaling Matcher | `PilotScalingMatcher.jsx` | `/pilot-scaling-matcher` | `scaling_manage` | Pilots |
| Scaling Coverage Report | `ScalingCoverageReport.jsx` | `/scaling-coverage-report` | `admin` | Admin |

---

## 🧩 Components (18)

**Location:** `src/components/scaling/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIScalingReadinessPredictor.jsx` | AI readiness prediction | Scaling Workflow |
| `AdaptiveRolloutSequencing.jsx` | Rollout sequencing | Scaling Plan |
| `BudgetApprovalGate.jsx` | Budget approval gate | Scaling Workflow |
| `IterationOptimizationTool.jsx` | Iteration optimization | Scaling Plan |
| `MunicipalOnboardingWizard.jsx` | Municipal onboarding | Scaling Plan |
| `NationalIntegrationGate.jsx` | National integration gate | Scaling Workflow |
| `PeerMunicipalityLearningHub.jsx` | Peer learning | Scaling Plan |
| `ProviderScalingCommercial.jsx` | Commercial scaling | Scaling Plan |
| `RolloutRiskPredictor.jsx` | Risk prediction | Scaling Plan |
| `ScalingCostBenefitAnalyzer.jsx` | Cost-benefit analysis | Scaling Plan |
| `ScalingExecutionDashboard.jsx` | Execution dashboard | Scaling Workflow |
| `ScalingFailureEarlyWarning.jsx` | Early warning system | Scaling Plan |
| `ScalingListAIInsights.jsx` | AI insights | Scaling Workflow |
| `ScalingPlanWorkflowTab.jsx` | Workflow tab | Scaling Plan Detail |
| `ScalingPlanningWizard.jsx` | Planning wizard | Scaling Create |
| `ScalingReadinessChecker.jsx` | Readiness checker | Pilots |
| `ScalingToProgramConverter.jsx` | To program converter | Scaling Plan |
| `SuccessMonitoringDashboard.jsx` | Success monitoring | Scaling Plan |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `scaling_plans` | Scaling plan data |
| `scaling_rollouts` | Rollout tracking |
| `scaling_municipalities` | Municipal scaling status |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `scaling_view` | View scaling plans |
| `scaling_create` | Create scaling plans |
| `scaling_edit` | Edit scaling plans |
| `scaling_manage` | Manage scaling |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Pilots | Scales successful pilots |
| Municipalities | Rollout targets |
| Programs | Converts to programs |
| Solutions | Scales solutions |
| Budget | Budget allocation |

# Approvals & Workflows System Inventory

> **Version:** 2.0  
> **Last Updated:** 2026-01-03  
> **Total Assets:** 47 files (12 pages, 30 components, 5 hooks)  
> **Parent System:** Approval & Workflow Management  
> **Hub Page:** `/approval-center`

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← Portfolio & Analytics](../portfolio/portfolio-analytics-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Orphans →](../orphans/orphan-files-inventory.md) |

---

## Overview

The Approvals System manages all approval workflows, gates, and SLA tracking across the platform.

---

## 📄 Pages (12)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Approval Center** | `ApprovalCenter.jsx` | `/approval-center` | `approval_view` | Self (Root) |
| Approvals | `Approvals.jsx` | `/approvals` | `approval_view` | Approval Center |
| My Approvals | `MyApprovals.jsx` | `/my-approvals` | `authenticated` | Personal |
| Executive Approvals | `ExecutiveApprovals.jsx` | `/executive-approvals` | `executive` | Approval Center |
| Application Review Hub | `ApplicationReviewHub.jsx` | `/application-review-hub` | `approval_review` | Approval Center |

### Gate Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Strategic Plan Approval Gate | `StrategicPlanApprovalGate.jsx` | `/strategic-plan-approval-gate` | `strategy_approve` | Strategy |
| Budget Allocation Approval Gate | `BudgetAllocationApprovalGate.jsx` | `/budget-allocation-approval-gate` | `budget_approve` | Budget |
| Initiative Launch Gate | `InitiativeLaunchGate.jsx` | `/initiative-launch-gate` | `initiative_approve` | Portfolio |
| Portfolio Review Gate | `PortfolioReviewGate.jsx` | `/portfolio-review-gate` | `portfolio_approve` | Portfolio |
| Contract Approval | `ContractApproval.jsx` | `/contract-approval` | `contract_approve` | Contracts |
| Invoice Approval | `InvoiceApproval.jsx` | `/invoice-approval` | `finance_approve` | Finance |
| Gate Maturity Matrix | `GateMaturityMatrix.jsx` | `/gate-maturity-matrix` | `admin` | Admin |

---

## 🧩 Components (30)

### Approval Components
**Location:** `src/components/approval/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `ApprovalGateConfig.jsx` | Gate configuration | Admin |
| `ApprovalStageProgress.jsx` | Stage progress visualization | Sandbox |
| `BudgetApprovalWorkflow.jsx` | Budget approval workflow | Pilots |
| `ComplianceGateChecklist.jsx` | Compliance checklist gate | Pilots |
| `InlineApprovalWizard.jsx` | Inline approval wizard | All entities |
| `MilestoneApprovalGate.jsx` | Milestone approval gate | Pilots |
| `MultiStepApproval.jsx` | Multi-step approval workflow | All entities |
| `RequesterAI.jsx` | AI for requesters | Approvals |
| `ReviewerAI.jsx` | AI for reviewers | Approvals |
| `SLAMonitoring.jsx` | SLA monitoring dashboard | Approvals |
| `UnifiedWorkflowApprovalTab.jsx` | Unified approval tab | All entities |
| `WorkflowStatus.jsx` | Workflow status display | All entities |

**Location:** `src/components/approval/gate-configs/`

| Component | Description |
|-----------|-------------|
| Various gate configurations | Domain-specific gate configs |

### Gate Components
**Location:** `src/components/gates/`

| Component | Description |
|-----------|-------------|
| `BudgetAllocationApprovalGate.jsx` | Budget gate |
| `InitiativeLaunchGate.jsx` | Initiative gate |
| `PortfolioReviewGate.jsx` | Portfolio gate |
| `StrategicPlanApprovalGate.jsx` | Strategic gate |

---

## 🪝 Hooks (5)

**Location:** `src/hooks/`

| Hook | Description |
|------|-------------|
| `useApprovalRequest.js` | Create approval requests |
| `useApprovalRequests.js` | Fetch and manage approval requests |
| `useApprovalWorkflow.js` | Workflow state management |
| `useApprovals.js` | Approval data queries |
| `useGovernance.js` | Governance and workflow utilities |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `approval_requests` | Approval requests |
| `approval_history` | Approval history |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `approval_view` | View approvals |
| `approval_review` | Review approvals |
| `strategy_approve` | Strategic approvals |
| `budget_approve` | Budget approvals |
| `initiative_approve` | Initiative approvals |
| `portfolio_approve` | Portfolio approvals |
| `contract_approve` | Contract approvals |
| `finance_approve` | Finance approvals |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| All Systems | Approval workflows |

---

## 📋 Change Log

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-01-03 | Moved 7 components from root to `src/components/approval/` |
| 1.0 | 2025-12-14 | Initial inventory |
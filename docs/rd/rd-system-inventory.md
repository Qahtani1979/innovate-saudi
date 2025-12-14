# R&D System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 58 files (18 pages, 29 components, 3 hooks)  
> **Parent System:** Research & Development Management  
> **Hub Page:** `/rd-projects`

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← Programs](../programs/programs-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Solutions →](../solutions/solutions-system-inventory.md) |

---

## Overview

The R&D System manages the complete research and development lifecycle including R&D calls, proposals, projects, and technology transfer. It supports the innovation ecosystem by connecting challenges to research outputs.

---

## 📄 Pages (18)

### Core R&D Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **RD Projects** | `RDProjects.jsx` | `/rd-projects` | `rd_view` | Self (Root) |
| RD Project Create | `RDProjectCreate.jsx` | `/rd-project-create` | `rd_create` | RD Projects |
| RD Project Detail | `RDProjectDetail.jsx` | `/rd-project-detail` | `rd_view` | RD Projects |
| RD Project Edit | `RDProjectEdit.jsx` | `/rd-project-edit` | `rd_edit` | RD Project Detail |

### R&D Calls Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| RD Calls | `RDCalls.jsx` | `/rd-calls` | `rd_view` | RD Projects |
| RD Call Create | `RDCallCreate.jsx` | `/rd-call-create` | `rd_create` | RD Calls |
| RD Call Detail | `RDCallDetail.jsx` | `/rd-call-detail` | `rd_view` | RD Calls |
| RD Call Edit | `RDCallEdit.jsx` | `/rd-call-edit` | `rd_edit` | RD Call Detail |

### R&D Proposals Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Proposal Wizard | `ProposalWizard.jsx` | `/proposal-wizard` | `authenticated` | RD Calls |
| RD Proposal Detail | `RDProposalDetail.jsx` | `/rd-proposal-detail` | `rd_view` | RD Calls |
| RD Proposal Edit | `RDProposalEdit.jsx` | `/rd-proposal-edit` | `rd_edit` | RD Proposal Detail |
| Proposal Review Portal | `ProposalReviewPortal.jsx` | `/proposal-review-portal` | `rd_evaluate` | RD Projects |

### R&D Management Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| RD Portfolio Control Dashboard | `RDPortfolioControlDashboard.jsx` | `/rd-portfolio-control-dashboard` | `rd_manage` | RD Projects |
| RD Portfolio Planner | `RDPortfolioPlanner.jsx` | `/rd-portfolio-planner` | `rd_manage` | RD Projects |
| RD Progress Tracker | `RDProgressTracker.jsx` | `/rd-progress-tracker` | `rd_view` | RD Projects |

### Personal & Reports Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| My RD Projects | `MyRDProjects.jsx` | `/my-rd-projects` | `authenticated` | Personal |
| RD Coverage Report | `RDCoverageReport.jsx` | `/rd-coverage-report` | `admin` | Admin |
| RD Proposal Coverage Report | `RDProposalCoverageReport.jsx` | `/rd-proposal-coverage-report` | `admin` | Admin |

---

## 🧩 Components (29)

### R&D Proposal Components
**Location:** `src/components/rd/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIProposalScorer.jsx` | AI proposal scoring | Proposals |
| `AIProposalWriter.jsx` | AI proposal writing | Proposals |
| `CollaborativeProposalEditor.jsx` | Collaborative editing | Proposals |
| `RDProposalAIScorerWidget.jsx` | AI scorer widget | Proposals |
| `RDProposalActivityLog.jsx` | Activity log | ProposalDetail |
| `RDProposalAwardWorkflow.jsx` | Award workflow | Proposals |
| `RDProposalEscalationAutomation.jsx` | Escalation automation | Proposals |
| `RDProposalReviewGate.jsx` | Review gate | Proposals |
| `RDProposalSubmissionGate.jsx` | Submission gate | Proposals |

### R&D Project Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `RDCallActivityLog.jsx` | Call activity log | CallDetail |
| `RDProjectActivityLog.jsx` | Project activity log | ProjectDetail |
| `RDProjectCreateWizard.jsx` | Project creation wizard | ProjectCreate |
| `RDProjectFinalEvaluationPanel.jsx` | Final evaluation | ProjectDetail |
| `RealTimeProgressDashboard.jsx` | Progress dashboard | Monitoring |
| `ResearchDataRepository.jsx` | Data repository | ProjectDetail |

### R&D Conversion Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `IdeaToRDConverter.jsx` | Idea to R&D | Citizen |
| `RDToPilotTransition.jsx` | R&D to pilot | ProjectDetail |
| `RDToPolicyConverter.jsx` | R&D to policy | ProjectDetail |
| `RDToSolutionConverter.jsx` | R&D to solution | ProjectDetail |
| `RDToStartupSpinoff.jsx` | R&D to startup | ProjectDetail |

### R&D Researcher Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `ResearcherMunicipalityMatcher.jsx` | Municipality matching | RDCalls |
| `ResearcherReputationScoring.jsx` | Reputation scoring | Researcher |
| `MultiInstitutionCollaboration.jsx` | Multi-institution | ProjectDetail |

### R&D IP Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `IPCommercializationTracker.jsx` | IP commercialization | ProjectDetail |
| `IPManagementWidget.jsx` | IP management | ProjectDetail |
| `PolicyImpactTracker.jsx` | Policy impact | ProjectDetail |
| `PublicationTracker.jsx` | Publication tracking | ProjectDetail |

### R&D TRL Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `TRLAssessmentWorkflow.jsx` | TRL assessment | ProjectDetail |
| `TRLVisualization.jsx` | TRL visualization | ProjectDetail |

### Root-Level R&D Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `RDCallApprovalWorkflow.jsx` | Call approval |
| `RDCallAwardWorkflow.jsx` | Award workflow |
| `RDCallEvaluationPanel.jsx` | Evaluation panel |
| `RDCallPublishWorkflow.jsx` | Publish workflow |
| `RDCallReviewWorkflow.jsx` | Review workflow |
| `RDOutputValidation.jsx` | Output validation |
| `RDProjectCompletionWorkflow.jsx` | Completion workflow |
| `RDProjectKickoffWorkflow.jsx` | Kickoff workflow |
| `RDProjectMilestoneGate.jsx` | Milestone gate |
| `RDTRLAdvancement.jsx` | TRL advancement |
| `RDToPilotTransition.jsx` | Pilot transition |

---

## 🪝 Hooks (3)

**Location:** `src/hooks/`

| Hook | Description |
|------|-------------|
| `useRDProjectsWithVisibility.js` | R&D with visibility |
| `useProposalsWithVisibility.js` | Proposals with visibility |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `rd_calls` | R&D call announcements |
| `rd_proposals` | Research proposals |
| `rd_projects` | Active projects |
| `rd_milestones` | Project milestones |
| `rd_publications` | Publications |
| `rd_ip` | Intellectual property |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `rd_view` | View R&D content |
| `rd_create` | Create R&D calls/projects |
| `rd_edit` | Edit R&D content |
| `rd_manage` | Manage R&D portfolio |
| `rd_evaluate` | Evaluate proposals |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Strategy | Receives R&D calls from strategy |
| Challenges | Addresses challenges |
| Pilots | Transitions to pilots |
| Solutions | Creates solutions |
| Academia | Research partnerships |
| Startups | Spin-off creation |

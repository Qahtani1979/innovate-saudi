# Sandboxes & Living Labs System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 45 files (14 pages, 31 components)  
> **Parent System:** Regulatory Innovation  
> **Hub Pages:** `/sandboxes`, `/living-labs`

---

## Overview

The Sandboxes & Living Labs System manages regulatory sandboxes for testing innovations in controlled environments and living labs for real-world experimentation with citizens.

---

## 📄 Sandbox Pages (8)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Sandboxes** | `Sandboxes.jsx` | `/sandboxes` | `sandbox_view` | Self (Root) |
| Sandbox Create | `SandboxCreate.jsx` | `/sandbox-create` | `sandbox_create` | Sandboxes |
| Sandbox Detail | `SandboxDetail.jsx` | `/sandbox-detail` | `sandbox_view` | Sandboxes |
| Sandbox Edit | `SandboxEdit.jsx` | `/sandbox-edit` | `sandbox_edit` | Sandbox Detail |
| Sandbox Approval | `SandboxApproval.jsx` | `/sandbox-approval` | `sandbox_approve` | Sandboxes |
| Sandbox Reporting | `SandboxReporting.jsx` | `/sandbox-reporting` | `sandbox_view` | Sandboxes |
| Sandbox Application Detail | `SandboxApplicationDetail.jsx` | `/sandbox-application-detail` | `sandbox_view` | Sandboxes |
| Sandbox Coverage Report | `SandboxCoverageReport.jsx` | `/sandbox-coverage-report` | `admin` | Admin |

## 📄 Living Lab Pages (6)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Living Labs** | `LivingLabs.jsx` | `/living-labs` | `living_lab_view` | Self (Root) |
| Living Lab Create | `LivingLabCreate.jsx` | `/living-lab-create` | `living_lab_create` | Living Labs |
| Living Lab Detail | `LivingLabDetail.jsx` | `/living-lab-detail` | `living_lab_view` | Living Labs |
| Living Lab Edit | `LivingLabEdit.jsx` | `/living-lab-edit` | `living_lab_edit` | Living Lab Detail |
| Living Lab Operator Portal | `LivingLabOperatorPortal.jsx` | `/living-lab-operator-portal` | `living_lab_operate` | Living Labs |
| Living Lab Coverage Report | `LivingLabCoverageReport.jsx` | `/living-lab-coverage-report` | `admin` | Admin |
| Living Labs Coverage Report | `LivingLabsCoverageReport.jsx` | `/living-labs-coverage-report` | `admin` | Admin |
| Living Labs Program Integration | `LivingLabsProgramIntegration.jsx` | `/living-labs-program-integration` | `living_lab_manage` | Living Labs |
| Living Lab Project Matcher | `LivingLabProjectMatcher.jsx` | `/living-lab-project-matcher` | `living_lab_manage` | Living Labs |
| Citizen Living Labs Browser | `CitizenLivingLabsBrowser.jsx` | `/citizen-living-labs-browser` | `public` | Citizen |
| Citizen Lab Participation | `CitizenLabParticipation.jsx` | `/citizen-lab-participation` | `authenticated` | Citizen |

---

## 🧩 Sandbox Components (17)

**Location:** `src/components/sandbox/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIRegulatoryGapAnalyzer.jsx` | AI regulatory gap analysis | SandboxCreate |
| `AutoRiskRouter.jsx` | Automatic risk routing | Sandboxes |
| `FastTrackEligibilityChecker.jsx` | Fast track eligibility | SandboxCreate |
| `InternationalSandboxBenchmark.jsx` | International benchmarking | Analytics |
| `MultiStakeholderApprovalPanel.jsx` | Multi-stakeholder approval | SandboxApproval |
| `SandboxActivityLog.jsx` | Activity logging | SandboxDetail |
| `SandboxApplicationWorkflowTab.jsx` | Application workflow | SandboxDetail |
| `SandboxCertificationWorkflow.jsx` | Certification workflow | SandboxDetail |
| `SandboxComplianceMonitor.jsx` | Compliance monitoring | SandboxDetail |
| `SandboxCreateWizard.jsx` | Creation wizard | SandboxCreate |
| `SandboxDigitalTwin.jsx` | Digital twin simulation | SandboxDetail |
| `SandboxKnowledgeExchange.jsx` | Knowledge exchange | Sandboxes |
| `SandboxPerformanceAnalytics.jsx` | Performance analytics | SandboxDetail |
| `SandboxPolicyFeedbackWorkflow.jsx` | Policy feedback | SandboxDetail |
| `SandboxVerificationWorkflow.jsx` | Verification workflow | SandboxDetail |
| `SandboxWorkflowTab.jsx` | Workflow tab | SandboxDetail |

**Location:** `src/components/sandboxes/`

| Component | Description |
|-----------|-------------|
| `StrategicAlignmentSandbox.jsx` | Strategic alignment |

---

## 🧩 Living Lab Components (17)

**Location:** `src/components/livinglab/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `CitizenScienceIntegration.jsx` | Citizen science | LivingLabDetail |
| `LabEthicsReviewBoard.jsx` | Ethics review | LivingLabCreate |
| `LabPolicyEvidenceWorkflow.jsx` | Policy evidence | LivingLabDetail |
| `LabResourceUtilizationTracker.jsx` | Resource tracking | LivingLabDetail |
| `LabRoutingHub.jsx` | Routing hub | LivingLabs |
| `LabSolutionCertificationWorkflow.jsx` | Solution certification | LivingLabDetail |
| `LabToPilotTransition.jsx` | To pilot transition | LivingLabDetail |
| `LabToPilotTransitionWizard.jsx` | Transition wizard | LivingLabDetail |
| `LabToSolutionConverter.jsx` | To solution converter | LivingLabDetail |
| `LivingLabAccreditationWorkflow.jsx` | Accreditation | LivingLabDetail |
| `LivingLabActivityLog.jsx` | Activity log | LivingLabDetail |
| `LivingLabCreateWizard.jsx` | Creation wizard | LivingLabCreate |
| `LivingLabWorkflowTab.jsx` | Workflow tab | LivingLabDetail |
| `MultiLabCollaborationEngine.jsx` | Multi-lab collaboration | LivingLabs |
| `ResearchOutputImpactTracker.jsx` | Research impact | LivingLabDetail |

**Location:** `src/components/livinglabs/`

| Component | Description |
|-----------|-------------|
| `AICapacityOptimizer.jsx` | AI capacity optimization |
| `LivingLabInfrastructureWizard.jsx` | Infrastructure wizard |

**Location:** `src/components/living-labs/`

| Component | Description |
|-----------|-------------|
| `StrategicAlignmentLivingLab.jsx` | Strategic alignment |

### Root-Level Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `LivingLabAccreditationWorkflow.jsx` | Accreditation workflow |
| `LivingLabDashboard.jsx` | Dashboard |
| `LivingLabEventManager.jsx` | Event management |
| `LivingLabExpertMatching.jsx` | Expert matching |
| `LivingLabLaunchChecklist.jsx` | Launch checklist |
| `LivingLabPublicationSubmission.jsx` | Publication submission |
| `LivingLabResearchMilestoneTracker.jsx` | Milestone tracking |
| `LivingLabResourceBooking.jsx` | Resource booking |
| `SandboxAIRiskAssessment.jsx` | AI risk assessment |
| `SandboxApplicationForm.jsx` | Application form |
| `SandboxApplicationWizard.jsx` | Application wizard |
| `SandboxApplicationsList.jsx` | Applications list |
| `SandboxCapacityManager.jsx` | Capacity management |
| `SandboxCollaboratorManager.jsx` | Collaborator management |
| `SandboxInfrastructureReadinessGate.jsx` | Infrastructure gate |
| `SandboxLaunchChecklist.jsx` | Launch checklist |
| `SandboxMilestoneManager.jsx` | Milestone management |
| `SandboxMonitoringDashboard.jsx` | Monitoring dashboard |
| `SandboxProjectExitWizard.jsx` | Exit wizard |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `sandboxes` | Regulatory sandbox data |
| `sandbox_applications` | Sandbox applications |
| `sandbox_milestones` | Sandbox milestones |
| `living_labs` | Living lab data |
| `living_lab_participants` | Participant tracking |
| `living_lab_experiments` | Experiment records |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `sandbox_view` | View sandboxes |
| `sandbox_create` | Create sandboxes |
| `sandbox_edit` | Edit sandboxes |
| `sandbox_approve` | Approve sandboxes |
| `living_lab_view` | View living labs |
| `living_lab_create` | Create living labs |
| `living_lab_operate` | Operate living labs |
| `living_lab_manage` | Manage living labs |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Strategy | Receives generated concepts |
| Pilots | Transition to pilots |
| Solutions | Solution testing |
| R&D | Research collaboration |
| Citizens | Participant engagement |
| Policy | Policy recommendations |

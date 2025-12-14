# Programs System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 65 files (25 pages, 40 components, 3 hooks)  
> **Parent System:** Innovation Programs Management  
> **Hub Page:** `/programs`

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← Pilots](../pilots/pilots-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [R&D →](../rd/rd-system-inventory.md) |

---

## Overview

The Programs System manages innovation programs including accelerators, incubators, training programs, and challenge-based programs. It handles applications, cohort management, mentorship, and alumni tracking.

---

## 📄 Pages (25)

### Core Program Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Programs** | `Programs.jsx` | `/programs` | `program_view` | Self (Root) |
| Program Create | `ProgramCreate.jsx` | `/program-create` | `program_create` | Programs |
| Program Detail | `ProgramDetail.jsx` | `/program-detail` | `program_view` | Programs |
| Program Edit | `ProgramEdit.jsx` | `/program-edit` | `program_edit` | Program Detail |
| Program Launch Wizard | `ProgramLaunchWizard.jsx` | `/program-launch-wizard` | `program_create` | Programs |

### Program Application Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Program Application Wizard | `ProgramApplicationWizard.jsx` | `/program-application-wizard` | `public` | Programs |
| Program Application Detail | `ProgramApplicationDetail.jsx` | `/program-application-detail` | `program_view` | Programs |
| Program Application Evaluation Hub | `ProgramApplicationEvaluationHub.jsx` | `/program-application-evaluation-hub` | `program_evaluate` | Programs |

### Program Operations Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Program Operator Portal | `ProgramOperatorPortal.jsx` | `/program-operator-portal` | `program_operate` | Programs |
| Programs Control Dashboard | `ProgramsControlDashboard.jsx` | `/programs-control-dashboard` | `program_manage` | Programs |
| Program Cohort Management | `ProgramCohortManagement.jsx` | `/program-cohort-management` | `program_manage` | Programs |
| Program Idea Submission | `ProgramIdeaSubmission.jsx` | `/program-idea-submission` | `authenticated` | Programs |

### Program Planning Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Program Portfolio Planner | `ProgramPortfolioPlanner.jsx` | `/program-portfolio-planner` | `program_manage` | Programs |
| Program Campaign Hub | `ProgramCampaignHub.jsx` | `/program-campaign-hub` | `program_manage` | Programs |

### Program Analytics Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Program Outcomes Analytics | `ProgramOutcomesAnalytics.jsx` | `/program-outcomes-analytics` | `program_view` | Programs |
| Program Impact Dashboard | `ProgramImpactDashboard.jsx` | `/program-impact-dashboard` | `program_view` | Programs |
| Program Financial ROI | `ProgramFinancialROI.jsx` | `/program-financial-roi` | `program_manage` | Programs |
| Program ROI Dashboard | `ProgramROIDashboard.jsx` | `/program-roi-dashboard` | `program_view` | Programs |

### Program Alignment Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Program Challenge Alignment | `ProgramChallengeAlignment.jsx` | `/program-challenge-alignment` | `program_manage` | Programs |
| Program Challenge Matcher | `ProgramChallengeMatcher.jsx` | `/program-challenge-matcher` | `program_manage` | Programs |
| Program RD Approval Gates | `ProgramRDApprovalGates.jsx` | `/program-rd-approval-gates` | `program_manage` | Programs |
| Program RD Knowledge Exchange | `ProgramRDKnowledgeExchange.jsx` | `/program-rd-knowledge-exchange` | `program_view` | Programs |

### Personal & Reports Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| My Programs | `MyPrograms.jsx` | `/my-programs` | `authenticated` | Personal |
| My Program Dashboard | `MyProgramDashboard.jsx` | `/my-program-dashboard` | `authenticated` | Personal |
| Program Coverage Report | `ProgramCoverageReport.jsx` | `/program-coverage-report` | `admin` | Admin |
| Programs Coverage Report | `ProgramsCoverageReport.jsx` | `/programs-coverage-report` | `admin` | Admin |
| Program Operator Coverage Report | `ProgramOperatorCoverageReport.jsx` | `/program-operator-coverage-report` | `admin` | Admin |

---

## 🧩 Components (40)

### Program AI Components
**Location:** `src/components/programs/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIAlumniSuggester.jsx` | AI alumni suggestions | Alumni |
| `AICohortOptimizerWidget.jsx` | Cohort optimization | Cohorts |
| `AICurriculumGenerator.jsx` | Generate curriculum | ProgramCreate |
| `AIDropoutPredictor.jsx` | Predict dropouts | Monitoring |
| `AIProgramBenchmarking.jsx` | Benchmark programs | Analytics |
| `AIProgramSuccessPredictor.jsx` | Success prediction | Programs |

### Program Alumni Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `AlumniImpactTracker.jsx` | Track alumni impact | Alumni |
| `AlumniNetworkHub.jsx` | Alumni network | Alumni |
| `AlumniSuccessStoryGenerator.jsx` | Generate stories | Alumni |

### Program Operations Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `AttendanceTracker.jsx` | Track attendance | Sessions |
| `AutomatedCertificateGenerator.jsx` | Generate certificates | Graduation |
| `CohortManagement.jsx` | Manage cohorts | ProgramDetail |
| `CohortOptimizer.jsx` | Optimize cohorts | ProgramDetail |
| `GraduationWorkflow.jsx` | Graduation workflow | Programs |
| `OnboardingWorkflow.jsx` | Onboarding workflow | Programs |
| `ParticipantAssignmentSystem.jsx` | Assign participants | Cohorts |
| `SessionScheduler.jsx` | Schedule sessions | Programs |
| `WaitlistManager.jsx` | Manage waitlist | Programs |

### Program Mentorship Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `MentorMatchingEngine.jsx` | Match mentors | Programs |
| `MentorScheduler.jsx` | Schedule mentors | Programs |
| `PeerCollaborationHub.jsx` | Peer collaboration | Programs |
| `PeerLearningNetwork.jsx` | Peer learning | Programs |

### Program Analytics Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `CrossProgramSynergy.jsx` | Cross-program synergy | Analytics |
| `DropoutPredictor.jsx` | Dropout prediction | Monitoring |
| `EnhancedProgressDashboard.jsx` | Progress dashboard | Monitoring |
| `ImpactStoryGenerator.jsx` | Generate impact stories | Analytics |
| `MunicipalImpactCalculator.jsx` | Calculate impact | Analytics |
| `ProgramBenchmarking.jsx` | Benchmark programs | Analytics |
| `ProgramOutcomeKPITracker.jsx` | Track KPIs | Analytics |

### Program Workflow Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `ProgramActivityLog.jsx` | Activity log | ProgramDetail |
| `ProgramCreateWizard.jsx` | Creation wizard | ProgramCreate |
| `ProgramEventAuditLog.jsx` | Event audit | ProgramDetail |
| `ProgramExpertEvaluation.jsx` | Expert evaluation | Evaluation |
| `ProgramLessonsToStrategy.jsx` | Lessons to strategy | Strategy |
| `ProgramToPilotWorkflow.jsx` | Convert to pilot | ProgramDetail |
| `ProgramToSolutionWorkflow.jsx` | Convert to solution | ProgramDetail |
| `PostProgramFollowUp.jsx` | Follow-up workflow | Alumni |
| `ResourceLibrary.jsx` | Resource library | Programs |
| `StrategicAlignmentWidget.jsx` | Strategic alignment | ProgramCreate |
| `ProgramAlumniStoryboard.jsx` | Alumni storyboard | Alumni |

### Root-Level Program Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `ProgramApplicationScreening.jsx` | Application screening |
| `ProgramCompletionWorkflow.jsx` | Completion workflow |
| `ProgramLaunchWorkflow.jsx` | Launch workflow |
| `ProgramMentorMatching.jsx` | Mentor matching |
| `ProgramMidReviewGate.jsx` | Mid-review gate |
| `ProgramSelectionWorkflow.jsx` | Selection workflow |
| `ProgramSessionManager.jsx` | Session management |

---

## 🪝 Hooks (3)

**Location:** `src/hooks/`

| Hook | Description |
|------|-------------|
| `usePrograms.js` | Core programs hook |
| `useProgramsWithVisibility.js` | Programs with visibility |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `programs` | Core program data |
| `program_applications` | Applications |
| `program_cohorts` | Cohort management |
| `program_sessions` | Session scheduling |
| `program_participants` | Participant tracking |
| `program_outcomes` | Outcomes tracking |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `program_view` | View programs |
| `program_create` | Create programs |
| `program_edit` | Edit programs |
| `program_manage` | Manage programs |
| `program_operate` | Operate programs |
| `program_evaluate` | Evaluate applications |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Strategy | Receives generated programs |
| Challenges | Aligns with challenges |
| Pilots | Creates pilots from programs |
| Solutions | Develops solutions |
| R&D | Knowledge exchange |
| Startups | Startup programs |
| Academia | Research programs |

# Challenges System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 78 files (22 pages, 51 components, 5 hooks)  
> **Parent System:** Innovation Challenges Management  
> **Hub Page:** `/challenges`

---

## Overview

The Challenges System manages the full lifecycle of innovation challenges from creation through resolution. This includes challenge intake, review, matching, and tracking through to pilot/solution resolution.

---

## 📄 Pages (22)

### Core Challenge Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Challenges** | `Challenges.jsx` | `/challenges` | `challenge_view` | Self (Root) |
| Challenge Create | `ChallengeCreate.jsx` | `/challenge-create` | `challenge_create` | Challenges |
| Challenge Detail | `ChallengeDetail.jsx` | `/challenge-detail` | `challenge_view` | Challenges |
| Challenge Edit | `ChallengeEdit.jsx` | `/challenge-edit` | `challenge_edit` | Challenge Detail |
| Challenge Import | `ChallengeImport.jsx` | `/challenge-import` | `challenge_create` | Challenges |

### Challenge Workflow Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Challenge Review Queue | `ChallengeReviewQueue.jsx` | `/challenge-review-queue` | `challenge_review` | Challenges |
| Challenge Proposal Detail | `ChallengeProposalDetail.jsx` | `/challenge-proposal-detail` | `challenge_view` | Challenges |
| Challenge Proposal Review | `ChallengeProposalReview.jsx` | `/challenge-proposal-review` | `challenge_review` | Challenges |
| Challenge Resolution Tracker | `ChallengeResolutionTracker.jsx` | `/challenge-resolution-tracker` | `challenge_view` | Challenges |
| Challenge Idea Response | `ChallengeIdeaResponse.jsx` | `/challenge-idea-response` | `challenge_create` | Challenges |

### Challenge Matching Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Challenge Solution Matching | `ChallengeSolutionMatching.jsx` | `/challenge-solution-matching` | `challenge_manage` | Challenges |
| Challenge RD Call Matcher | `ChallengeRDCallMatcher.jsx` | `/challenge-rd-call-matcher` | `challenge_manage` | Challenges |
| Matching Queue | `MatchingQueue.jsx` | `/matching-queue` | `challenge_manage` | Challenges |

### Challenge Analytics Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Challenge Analytics Dashboard | `ChallengeAnalyticsDashboard.jsx` | `/challenge-analytics-dashboard` | `challenge_view` | Challenges |
| Challenge Coverage Report | `ChallengeCoverageReport.jsx` | `/challenge-coverage-report` | `admin` | Admin |
| Challenges Coverage Report | `ChallengesCoverageReport.jsx` | `/challenges-coverage-report` | `admin` | Admin |

### Citizen Challenge Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Citizen Challenges Browser | `CitizenChallengesBrowser.jsx` | `/citizen-challenges-browser` | `public` | Citizen Portal |
| My Challenges | `MyChallenges.jsx` | `/my-challenges` | `authenticated` | Personal |
| My Challenge Tracker | `MyChallengeTracker.jsx` | `/my-challenge-tracker` | `authenticated` | Personal |

### Audit Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Challenge Detail Deep Verification | `ChallengeDetailDeepVerification.jsx` | `/challenge-detail-deep-verification` | `admin` | Admin |
| Challenge Detail Full Audit | `ChallengeDetailFullAudit.jsx` | `/challenge-detail-full-audit` | `admin` | Admin |
| Challenge Detail Gaps Verified | `ChallengeDetailGapsVerified.jsx` | `/challenge-detail-gaps-verified` | `admin` | Admin |
| Challenge Detail Progress | `ChallengeDetailProgress.jsx` | `/challenge-detail-progress` | `admin` | Admin |

---

## 🧩 Components (51)

### Challenge Workflow Components
**Location:** `src/components/challenges/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIChallengeIntakeWizard.jsx` | AI-assisted challenge intake | ChallengeCreate |
| `BatchChallengeImport.jsx` | Bulk import challenges | ChallengeImport |
| `BatchProcessor.jsx` | Process challenge batches | Admin |
| `ChallengeActivityLog.jsx` | Activity history | ChallengeDetail |
| `ChallengeClustering.jsx` | Cluster similar challenges | Challenges |
| `ChallengeComparisonTool.jsx` | Compare challenges | Challenges |
| `ChallengeFollowButton.jsx` | Follow/subscribe | ChallengeDetail |
| `ChallengeHealthScore.jsx` | Health score display | ChallengeDetail |
| `ChallengeHealthTrend.jsx` | Health trend chart | ChallengeDetail |
| `ChallengeImpactForecaster.jsx` | Impact forecasting | ChallengeDetail |
| `ChallengeImpactSimulator.jsx` | Impact simulation | ChallengeDetail |
| `ChallengeMergeWorkflow.jsx` | Merge duplicate challenges | Admin |
| `ChallengeOwnershipTransfer.jsx` | Transfer ownership | ChallengeDetail |
| `ChallengeTemplateLibrary.jsx` | Challenge templates | ChallengeCreate |
| `ChallengeTimelineView.jsx` | Timeline visualization | ChallengeDetail |
| `ChallengeTimelineVisualizer.jsx` | Advanced timeline | ChallengeDetail |
| `ChallengeVoting.jsx` | Voting system | ChallengeDetail |

### Challenge Conversion Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `ChallengeToProgramWorkflow.jsx` | Convert to program | ChallengeDetail |
| `ChallengeToRDWizard.jsx` | Convert to R&D | ChallengeDetail |
| `ProposalToPilotConverter.jsx` | Proposal to pilot | ProposalDetail |
| `InnovationFramingGenerator.jsx` | Generate framing | ChallengeCreate |

### Challenge Tracking Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `ChallengeTrackAssignmentDecision.jsx` | Track assignment | ChallengeReview |
| `SLAMonitor.jsx` | SLA monitoring | ChallengeDetail |
| `LessonsLearnedEnforcer.jsx` | Enforce lessons | ChallengeDetail |
| `LiveKPIDashboard.jsx` | Live KPIs | ChallengeDetail |
| `PerformanceBenchmarking.jsx` | Benchmarking | Analytics |
| `KPIBenchmarkData.jsx` | KPI data | Analytics |

### Challenge Policy Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `PolicyRecommendationManager.jsx` | Policy recommendations | ChallengeDetail |
| `PolicyWorkflow.jsx` | Policy workflow | ChallengeDetail |
| `ImpactReportGenerator.jsx` | Generate reports | ChallengeDetail |

### Challenge Gamification Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `ChallengeGamification.jsx` | Gamification features | Challenges |
| `ChallengeBountySystem.jsx` | Bounty management | ChallengeDetail |

### Challenge Communication Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `CitizenClosureNotification.jsx` | Closure notifications | ChallengeDetail |
| `CitizenFeedbackWidget.jsx` | Citizen feedback | ChallengeDetail |
| `WhatsAppNotifier.jsx` | WhatsApp notifications | ChallengeDetail |
| `SocialShare.jsx` | Social sharing | ChallengeDetail |
| `ProviderNotificationPreferences.jsx` | Provider notifications | Settings |

### Challenge Proposal Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `ProposalSubmissionForm.jsx` | Submit proposals | ChallengeDetail |
| `RDCallRequestForm.jsx` | Request R&D call | ChallengeDetail |
| `ExpressInterestButton.jsx` | Express interest | ChallengeDetail |
| `PublishingWorkflow.jsx` | Publishing workflow | ChallengeDetail |
| `QuickFixWorkflow.jsx` | Quick fix workflow | ChallengeDetail |

### Cross-Entity Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `CrossCityLearning.jsx` | Cross-city learning | Challenges |
| `CrossCitySolutionSharing.jsx` | Solution sharing | Challenges |
| `ResearchChallengesView.jsx` | Research view | Academia |
| `StakeholderEngagementTracker.jsx` | Stakeholder engagement | ChallengeDetail |
| `StrategicAlignmentSelector.jsx` | Strategic alignment | ChallengeCreate |
| `TreatmentPlanCoPilot.jsx` | AI treatment plans | ChallengeDetail |
| `CausalGraphVisualizer.jsx` | Causal analysis | ChallengeDetail |
| `BlindReviewToggle.jsx` | Blind review mode | ChallengeReview |

### Root-Level Challenge Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `ChallengeArchiveWorkflow.jsx` | Archive workflow |
| `ChallengeResolutionWorkflow.jsx` | Resolution workflow |
| `ChallengeReviewWorkflow.jsx` | Review workflow |
| `ChallengeSubmissionWizard.jsx` | Submission wizard |
| `ChallengeToRDWizard.jsx` | To R&D wizard |
| `ChallengeTreatmentPlan.jsx` | Treatment planning |
| `ChallengeTypesConfig.jsx` | Types configuration |

---

## 🪝 Hooks (5)

**Location:** `src/hooks/`

| Hook | Description |
|------|-------------|
| `useChallengesWithVisibility.js` | Challenges with visibility filtering |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `challenges` | Core challenge data |
| `challenge_activities` | Activity logs |
| `challenge_attachments` | File attachments |
| `challenge_interests` | Express interest records |
| `challenge_proposals` | Submitted proposals |
| `challenge_solution_matches` | Solution matches |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `challenge_view` | View challenges |
| `challenge_view_all` | View all challenges |
| `challenge_view_own` | View own challenges |
| `challenge_view_confidential` | View confidential challenges |
| `challenge_create` | Create challenges |
| `challenge_edit` | Edit challenges |
| `challenge_review` | Review challenges |
| `challenge_manage` | Full management |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Strategy | Receives generated challenges |
| Pilots | Creates pilots from challenges |
| Solutions | Matches solutions to challenges |
| R&D | Creates R&D calls from challenges |
| Programs | Converts challenges to programs |
| Citizens | Submits challenges and ideas |
| Municipalities | Owns challenges |

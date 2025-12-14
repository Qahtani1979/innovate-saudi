# Citizens & Engagement System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 55 files (18 pages, 34 components, 3 hooks)  
> **Parent System:** Citizen Engagement Platform  
> **Hub Page:** `/citizen-dashboard`

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← Municipalities](../municipalities/municipalities-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Partnerships →](../partnerships/partnerships-system-inventory.md) |

---

## Overview

The Citizens System enables citizen participation in innovation through idea submission, voting, feedback, pilot enrollment, and living lab participation.

---

## 📄 Pages (18)

### Citizen Dashboard Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Citizen Dashboard** | `CitizenDashboard.jsx` | `/citizen-dashboard` | `authenticated` | Self (Root) |
| Citizen Onboarding | `CitizenOnboarding.jsx` | `/citizen-onboarding` | `public` | Citizen Dashboard |
| Citizen Leaderboard | `CitizenLeaderboard.jsx` | `/citizen-leaderboard` | `public` | Citizen Dashboard |
| Citizen Engagement Dashboard | `CitizenEngagementDashboard.jsx` | `/citizen-engagement-dashboard` | `engagement_view` | Admin |

### Citizen Idea Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Citizen Idea Submission | `CitizenIdeaSubmission.jsx` | `/citizen-idea-submission` | `authenticated` | Citizen Dashboard |
| Public Idea Submission | `PublicIdeaSubmission.jsx` | `/public-idea-submission` | `public` | Public |
| Idea Detail | `IdeaDetail.jsx` | `/idea-detail` | `public` | Ideas |
| Ideas Management | `IdeasManagement.jsx` | `/ideas-management` | `idea_manage` | Admin |
| Ideas Analytics | `IdeasAnalytics.jsx` | `/ideas-analytics` | `idea_view` | Admin |
| Idea Evaluation Queue | `IdeaEvaluationQueue.jsx` | `/idea-evaluation-queue` | `idea_evaluate` | Admin |

### Citizen Browser Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Citizen Challenges Browser | `CitizenChallengesBrowser.jsx` | `/citizen-challenges-browser` | `public` | Citizen Dashboard |
| Citizen Solutions Browser | `CitizenSolutionsBrowser.jsx` | `/citizen-solutions-browser` | `public` | Citizen Dashboard |
| Citizen Living Labs Browser | `CitizenLivingLabsBrowser.jsx` | `/citizen-living-labs-browser` | `public` | Citizen Dashboard |

### Citizen Participation Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Citizen Pilot Enrollment | `CitizenPilotEnrollment.jsx` | `/citizen-pilot-enrollment` | `authenticated` | Citizen Dashboard |
| Citizen Lab Participation | `CitizenLabParticipation.jsx` | `/citizen-lab-participation` | `authenticated` | Citizen Dashboard |

### Reports

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Ideas Coverage Report | `IdeasCoverageReport.jsx` | `/ideas-coverage-report` | `admin` | Admin |
| Citizen Engagement Coverage Report | `CitizenEngagementCoverageReport.jsx` | `/citizen-engagement-coverage-report` | `admin` | Admin |

---

## 🧩 Components (34)

### Citizen Idea Components
**Location:** `src/components/citizen/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIIdeaClassifier.jsx` | AI idea classification | Ideas |
| `AIPrioritySorter.jsx` | AI priority sorting | Ideas |
| `AIProposalScreening.jsx` | AI proposal screening | Ideas |
| `AdvancedFilters.jsx` | Advanced filtering | Ideas |
| `AdvancedIdeasAnalytics.jsx` | Ideas analytics | Analytics |
| `CitizenEngagementAnalytics.jsx` | Engagement analytics | Dashboard |
| `CitizenFeedbackLoop.jsx` | Feedback loop | Ideas |
| `CitizenIdeaBoard.jsx` | Idea board display | Citizen Dashboard |
| `CitizenIdeaSubmissionForm.jsx` | Submission form | Citizen Idea Submission |
| `CitizenIdeaWorkflowTab.jsx` | Workflow tab | Idea Detail |
| `CitizenPageLayout.jsx` | Page layout | All citizen pages |
| `CommentThread.jsx` | Comment threads | Ideas |
| `ContentModerationAI.jsx` | AI content moderation | Ideas |
| `ExportIdeasData.jsx` | Data export | Admin |
| `IdeaBulkActions.jsx` | Bulk actions | Admin |
| `IdeaFieldSecurity.jsx` | Field security | Admin |
| `IdeaVersionHistory.jsx` | Version history | Idea Detail |
| `IdeaVotingBoard.jsx` | Voting board | Ideas |
| `MergeDuplicatesDialog.jsx` | Merge duplicates | Admin |
| `MultiEvaluatorConsensus.jsx` | Multi-evaluator | Evaluation |
| `PublicFeedbackAggregator.jsx` | Feedback aggregation | Analytics |
| `PublicIdeaBoard.jsx` | Public idea board | Public |
| `ResponseTemplates.jsx` | Response templates | Admin |
| `SLATracker.jsx` | SLA tracking | Admin |
| `SocialShare.jsx` | Social sharing | Ideas |
| `StakeholderAlignmentGate.jsx` | Alignment gate | Ideas |
| `VotingSystemBackend.jsx` | Voting backend | Ideas |

### Citizen Conversion Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `IdeaToChallengeConverter.jsx` | To challenge | Idea Detail |
| `IdeaToPilotConverter.jsx` | To pilot | Idea Detail |
| `IdeaToProposalConverter.jsx` | To proposal | Idea Detail |
| `IdeaToRDConverter.jsx` | To R&D | Idea Detail |
| `IdeaToSolutionConverter.jsx` | To solution | Idea Detail |
| `InnovationProposalWorkflowTab.jsx` | Proposal workflow | Proposals |
| `ProposalToRDConverter.jsx` | Proposal to R&D | Proposals |

---

## 🪝 Hooks (3)

| Hook | Description |
|------|-------------|
| `useEventRegistrations.js` | Event registration tracking |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `citizen_ideas` | Citizen ideas |
| `citizen_votes` | Voting records |
| `citizen_feedback` | Feedback submissions |
| `citizen_badges` | Gamification badges |
| `citizen_points` | Points tracking |
| `citizen_profiles` | Citizen profiles |
| `citizen_notifications` | Notifications |
| `citizen_pilot_enrollments` | Pilot enrollments |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `idea_view` | View ideas |
| `idea_create` | Create ideas |
| `idea_manage` | Manage ideas |
| `idea_evaluate` | Evaluate ideas |
| `engagement_view` | View engagement |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Challenges | Converts ideas to challenges |
| Pilots | Enrolls in pilots |
| Living Labs | Participates in labs |
| Solutions | Browses solutions |
| Municipalities | Location-based engagement |

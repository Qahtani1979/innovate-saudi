# Platform Flows, Personas & Scenarios - Complete Reference

## Overview

This document traces all user flows, personas, and scenarios in the Saudi Innovates platform.

---

## Personas

### 1. Municipality Staff
| Attribute | Value |
|-----------|-------|
| ID | `municipality_staff` |
| Role Key | `municipality_admin`, `municipality_staff` |
| Icon | Building2 |
| Color | Purple |
| Requires Approval | Yes |
| Landing Dashboard | `MunicipalityDashboard` |
| Specialized Onboarding | `MunicipalityStaffOnboardingWizard` |
| Onboarding Page | `/municipality-staff-onboarding` |

**Capabilities:**
- Create and manage urban challenges
- Post R&D calls and innovation programs
- Review and evaluate proposals from providers
- Manage pilots and track solutions
- Access municipality-specific analytics
- Collaborate with other municipalities

**Key Pages:**
- MunicipalityDashboard, MyChallenges, ChallengeCreate
- MunicipalityProfile, MunicipalityIdeasView
- PilotManagementPanel, ProposalReviewPortal
- BudgetAllocationTool, MunicipalProposalInbox

---

### 2. Solution Provider / Startup
| Attribute | Value |
|-----------|-------|
| ID | `provider` |
| Role Key | `provider` |
| Icon | Rocket |
| Color | Blue |
| Requires Approval | Yes |
| Landing Dashboard | `StartupDashboard` (aliased as `ProviderDashboard`) |
| Specialized Onboarding | `StartupOnboardingWizard` |
| Onboarding Page | `/startup-onboarding` |

**Capabilities:**
- Browse and respond to challenges
- Submit proposals and solutions
- Manage startup/company profile
- Track opportunity pipeline
- Participate in pilots
- Access matchmaking services

**Key Pages:**
- ProviderDashboard, OpportunityFeed, Solutions
- SolutionCreate, SolutionEdit, SolutionDetail
- MyStartupProfileEditor, MyApplications
- ChallengeSolutionMatching, ProposalWizard

---

### 3. Researcher / Academic
| Attribute | Value |
|-----------|-------|
| ID | `researcher` |
| Role Key | `researcher` |
| Icon | FlaskConical |
| Color | Green |
| Requires Approval | Yes |
| Landing Dashboard | `ResearcherDashboard` |
| Specialized Onboarding | `ResearcherOnboardingWizard` |
| Onboarding Page | `/researcher-onboarding` |

**Capabilities:**
- Browse R&D calls and funding opportunities
- Submit research proposals
- Collaborate on pilot projects
- Access knowledge resources
- Connect with municipalities for applied research
- Publish findings and case studies

**Key Pages:**
- ResearcherDashboard, RDCalls, RDCallDetail
- ProposalWizard, MyRDProjects
- MyResearcherProfileEditor, AcademiaDashboard
- KnowledgeGraph, InstitutionRDDashboard

---

### 4. Expert / Evaluator
| Attribute | Value |
|-----------|-------|
| ID | `expert` |
| Role Key | `expert` |
| Icon | Award |
| Color | Amber |
| Requires Approval | Yes |
| Landing Dashboard | `ExpertRegistry` |
| Specialized Onboarding | `ExpertOnboardingWizard` |
| Onboarding Page | `/expert-onboarding` |

**Capabilities:**
- Evaluate proposals and applications
- Provide expert advisory services
- Join expert panels
- Review pilot outcomes
- Mentor startups/researchers
- Access evaluation dashboards

**Key Pages:**
- ExpertRegistry, ExpertDetail, ExpertAssignmentQueue
- ExpertEvaluationWorkflow, ExpertPanelManagement
- ExpertPerformanceDashboard, EvaluationPanel
- MyEvaluatorProfile, MentorDashboard

---

### 5. Citizen / Community Member
| Attribute | Value |
|-----------|-------|
| ID | `citizen` |
| Role Key | `citizen` |
| Icon | Users |
| Color | Orange |
| Requires Approval | No (Auto-approved) |
| Landing Dashboard | `CitizenDashboard` |
| Specialized Onboarding | `CitizenOnboardingWizard` |
| Onboarding Page | `/citizen-onboarding` |

**Capabilities:**
- Submit ideas for urban improvement
- Vote on community challenges
- Enroll in pilot programs
- Provide feedback on services
- Earn points and badges
- Participate in living labs

**Key Pages:**
- CitizenDashboard, CitizenLabParticipation
- CitizenLeaderboard, CitizenPilotEnrollment
- IdeaDetail, IdeasManagement
- PublicIdeaSubmission (pre-auth)

---

### 6. Viewer / Explorer
| Attribute | Value |
|-----------|-------|
| ID | `viewer` |
| Role Key | `viewer` |
| Icon | Eye |
| Color | Slate |
| Requires Approval | No (Auto-approved) |
| Landing Dashboard | `Home` |
| Specialized Onboarding | None (Main wizard only) |
| Onboarding Page | N/A |

**Capabilities:**
- Explore innovation initiatives
- Browse public challenges and solutions
- View case studies and success stories
- Access news and announcements
- Learn about the platform

**Key Pages:**
- Home, About, News
- PublicChallenges, PublicSolutions
- CaseStudyDetail, Knowledge

---

### 7. Admin
| Attribute | Value |
|-----------|-------|
| ID | `admin` |
| Role Key | `admin` |
| Icon | Shield |
| Color | Red |
| Requires Approval | Manual assignment only |
| Landing Dashboard | `AdminDashboard` |
| Specialized Onboarding | None |

**Capabilities:**
- Full platform administration
- User and role management
- Approval workflows
- System configuration
- Analytics and reporting
- Content moderation

**Key Pages:**
- AdminDashboard, AdminPortal
- UserManagement, RoleManagement
- ApprovalCenter, AuditTrail
- SystemSettings, FeatureFlagsDashboard

---

## User Flows

### Flow 1: New User Registration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEW USER REGISTRATION FLOW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Entry Points:                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │ Email/Pass   │  │ Google OAuth │  │ Microsoft    │                      │
│  │ Signup       │  │              │  │ OAuth        │                      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                      │
│         │                 │                 │                               │
│         └─────────────────┼─────────────────┘                               │
│                           ▼                                                 │
│  ┌─────────────────────────────────────────┐                               │
│  │         Auth Page (/auth)               │                               │
│  │  • Sign up form                         │                               │
│  │  • OAuth buttons                        │                               │
│  │  • Password reset                       │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  ┌─────────────────────────────────────────┐                               │
│  │         AuthContext                     │                               │
│  │  • Create session                       │                               │
│  │  • Fetch/create user_profiles           │                               │
│  │  • Check onboarding_completed           │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│          ┌─────────┴─────────┐                                             │
│          ▼                   ▼                                              │
│  ┌───────────────┐   ┌───────────────┐                                     │
│  │ Onboarding    │   │ Dashboard     │                                     │
│  │ (new user)    │   │ (returning)   │                                     │
│  └───────────────┘   └───────────────┘                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 2: Main Onboarding Wizard (6 Steps)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MAIN ONBOARDING WIZARD FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Step 1: Welcome                                                            │
│  ┌─────────────────────────────────────────┐                               │
│  │  • Platform introduction                │                               │
│  │  • Language selection (EN/AR)           │                               │
│  │  • Value proposition                    │                               │
│  └─────────────────────────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Step 2: Import Data                                                        │
│  ┌─────────────────────────────────────────┐                               │
│  │  • CV Upload (PDF/DOC)                  │                               │
│  │    → AI extraction of:                  │                               │
│  │      - Name, title, organization        │                               │
│  │      - Skills, experience               │                               │
│  │      - Education, certifications        │                               │
│  │  • LinkedIn URL import                  │                               │
│  │  • Skip option available                │                               │
│  └─────────────────────────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Step 3: Profile Information                                                │
│  ┌─────────────────────────────────────────┐                               │
│  │  • Full name (EN/AR)                    │                               │
│  │  • Job title (EN/AR)                    │                               │
│  │  • Organization (EN/AR)                 │                               │
│  │  • Bio (EN/AR)                          │                               │
│  │  • Location (region/city)               │                               │
│  │  • Contact info                         │                               │
│  │  • Expertise areas (max 5)              │                               │
│  │  • Add custom expertise                 │                               │
│  └─────────────────────────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Step 4: AI Assistance                                                      │
│  ┌─────────────────────────────────────────┐                               │
│  │  • AI-generated bio suggestions         │                               │
│  │  • Persona recommendations              │                               │
│  │  • Expertise area suggestions           │                               │
│  │  • Profile enhancement tips             │                               │
│  │  • Accept/modify suggestions            │                               │
│  └─────────────────────────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Step 5: Role Selection                                                     │
│  ┌─────────────────────────────────────────┐                               │
│  │  • 6 persona options:                   │                               │
│  │    1. Municipality Staff (approval)     │                               │
│  │    2. Provider/Startup (approval)       │                               │
│  │    3. Researcher (approval)             │                               │
│  │    4. Expert (approval)                 │                               │
│  │    5. Citizen (auto-approved)           │                               │
│  │    6. Viewer (auto-approved)            │                               │
│  │  • Justification for approval roles     │                               │
│  │  • Organization verification            │                               │
│  └─────────────────────────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Step 6: Completion                                                         │
│  ┌─────────────────────────────────────────┐                               │
│  │  • Profile summary                      │                               │
│  │  • Welcome email sent                   │                               │
│  │  • Role request notification            │                               │
│  │  • Redirect to specialized onboarding   │                               │
│  │    OR dashboard                         │                               │
│  └─────────────────────────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 3: Specialized Onboarding by Persona

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SPECIALIZED ONBOARDING FLOWS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MUNICIPALITY STAFF                                                         │
│  ┌─────────────────────────────────────────┐                               │
│  │  /municipality-staff-onboarding         │                               │
│  │  MunicipalityStaffOnboardingWizard      │                               │
│  │                                          │                               │
│  │  Steps:                                  │                               │
│  │  1. Municipality selection              │                               │
│  │  2. Department & role details           │                               │
│  │  3. Challenge areas of interest         │                               │
│  │  4. Platform orientation                │                               │
│  │  → MunicipalityDashboard                │                               │
│  └─────────────────────────────────────────┘                               │
│                                                                             │
│  STARTUP / PROVIDER                                                         │
│  ┌─────────────────────────────────────────┐                               │
│  │  /startup-onboarding                    │                               │
│  │  StartupOnboardingWizard                │                               │
│  │                                          │                               │
│  │  Steps:                                  │                               │
│  │  1. Company profile                     │                               │
│  │  2. Solution categories                 │                               │
│  │  3. Target sectors                      │                               │
│  │  4. Portfolio/case studies              │                               │
│  │  → ProviderDashboard                    │                               │
│  └─────────────────────────────────────────┘                               │
│                                                                             │
│  RESEARCHER                                                                 │
│  ┌─────────────────────────────────────────┐                               │
│  │  /researcher-onboarding                 │                               │
│  │  ResearcherOnboardingWizard             │                               │
│  │                                          │                               │
│  │  Steps:                                  │                               │
│  │  1. Institution affiliation             │                               │
│  │  2. Research areas                      │                               │
│  │  3. Publications/projects               │                               │
│  │  4. Collaboration interests             │                               │
│  │  → ResearcherDashboard                  │                               │
│  └─────────────────────────────────────────┘                               │
│                                                                             │
│  EXPERT                                                                     │
│  ┌─────────────────────────────────────────┐                               │
│  │  /expert-onboarding                     │                               │
│  │  ExpertOnboardingWizard                 │                               │
│  │                                          │                               │
│  │  Steps:                                  │                               │
│  │  1. Expert credentials                  │                               │
│  │  2. Domains of expertise                │                               │
│  │  3. Availability & rates                │                               │
│  │  4. Evaluation preferences              │                               │
│  │  → ExpertRegistry                       │                               │
│  └─────────────────────────────────────────┘                               │
│                                                                             │
│  CITIZEN                                                                    │
│  ┌─────────────────────────────────────────┐                               │
│  │  /citizen-onboarding                    │                               │
│  │  CitizenOnboardingWizard                │                               │
│  │                                          │                               │
│  │  Steps:                                  │                               │
│  │  1. Location/municipality               │                               │
│  │  2. Interests & areas of concern        │                               │
│  │  3. Participation preferences           │                               │
│  │  4. Notification settings               │                               │
│  │  → CitizenDashboard                     │                               │
│  └─────────────────────────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 4: Role Approval Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ROLE APPROVAL WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Submits Role Request                                                  │
│  ┌─────────────────────────────────────────┐                               │
│  │  • Persona selected in onboarding       │                               │
│  │  • Justification provided               │                               │
│  │  • Organization info verified           │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  ┌─────────────────────────────────────────┐                               │
│  │  role_requests table entry              │                               │
│  │  status: 'pending'                      │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  ┌─────────────────────────────────────────┐                               │
│  │  role-request-notification              │                               │
│  │  (Edge Function)                        │                               │
│  │  • Notifies admins                      │                               │
│  │  • User confirmation email              │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│          ┌─────────┴─────────┐                                             │
│          ▼                   ▼                                              │
│  ┌───────────────┐   ┌───────────────┐                                     │
│  │ Auto-Approved │   │ Needs Review  │                                     │
│  │ (citizen,     │   │ (muni, prov,  │                                     │
│  │  viewer)      │   │  researcher,  │                                     │
│  │               │   │  expert)      │                                     │
│  └───────┬───────┘   └───────┬───────┘                                     │
│          │                   │                                              │
│          │           ┌───────┴───────┐                                     │
│          │           ▼               ▼                                      │
│          │   ┌───────────┐   ┌───────────┐                                 │
│          │   │ Approved  │   │ Rejected  │                                 │
│          │   └─────┬─────┘   └─────┬─────┘                                 │
│          │         │               │                                        │
│          ▼         ▼               ▼                                        │
│  ┌─────────────────────────────────────────┐                               │
│  │  user_roles table updated               │                               │
│  │  Notification sent to user              │                               │
│  └─────────────────────────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 5: Challenge Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CHALLENGE LIFECYCLE FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Creation                                                                   │
│  ┌─────────────────────────────────────────┐                               │
│  │  Municipality Staff creates challenge   │                               │
│  │  → /challenge-create                    │                               │
│  │  • Title, description (EN/AR)           │                               │
│  │  • Sector, category                     │                               │
│  │  • Budget, timeline                     │                               │
│  │  • KPIs, success criteria               │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Review & Approval                                                          │
│  ┌─────────────────────────────────────────┐                               │
│  │  status: 'draft' → 'under_review'       │                               │
│  │  → ChallengeReviewQueue                 │                               │
│  │  • Internal review                      │                               │
│  │  • AI analysis                          │                               │
│  │  • Approval workflow                    │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Publication                                                                │
│  ┌─────────────────────────────────────────┐                               │
│  │  status: 'published'                    │                               │
│  │  • Visible to providers                 │                               │
│  │  • Matched with solutions               │                               │
│  │  • Notifications sent                   │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Proposal Collection                                                        │
│  ┌─────────────────────────────────────────┐                               │
│  │  Providers submit proposals             │                               │
│  │  → challenge_proposals table            │                               │
│  │  • Solution description                 │                               │
│  │  • Budget, timeline                     │                               │
│  │  • Team, methodology                    │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Evaluation                                                                 │
│  ┌─────────────────────────────────────────┐                               │
│  │  Expert evaluation                      │                               │
│  │  → EvaluationPanel                      │                               │
│  │  • Scoring rubrics                      │                               │
│  │  • Comparative analysis                 │                               │
│  │  • Recommendations                      │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Selection & Pilot                                                          │
│  ┌─────────────────────────────────────────┐                               │
│  │  Winner selected                        │                               │
│  │  status: 'in_progress'                  │                               │
│  │  → Pilot creation                       │                               │
│  │  → Contract management                  │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Resolution                                                                 │
│  ┌─────────────────────────────────────────┐                               │
│  │  status: 'resolved' or 'scaled'         │                               │
│  │  • Impact metrics                       │                               │
│  │  • Case study generation                │                               │
│  │  • Lessons learned                      │                               │
│  └─────────────────────────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 6: Pilot Program Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PILOT PROGRAM LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Planning                                                                   │
│  ┌─────────────────────────────────────────┐                               │
│  │  /pilot-launch-wizard                   │                               │
│  │  • Define objectives, scope             │                               │
│  │  • Set milestones, KPIs                 │                               │
│  │  • Allocate resources                   │                               │
│  │  • Identify stakeholders                │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Execution                                                                  │
│  ┌─────────────────────────────────────────┐                               │
│  │  • Implementation tracking              │                               │
│  │  • Milestone management                 │                               │
│  │  • Citizen enrollment (if applicable)   │                               │
│  │  • Progress reporting                   │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│                    ▼                                                        │
│  Evaluation                                                                 │
│  ┌─────────────────────────────────────────┐                               │
│  │  • Expert reviews                       │                               │
│  │  • Citizen feedback                     │                               │
│  │  • KPI measurement                      │                               │
│  │  • Impact assessment                    │                               │
│  └─────────────────┬───────────────────────┘                               │
│                    │                                                        │
│          ┌─────────┴─────────┐                                             │
│          ▼                   ▼                                              │
│  ┌───────────────┐   ┌───────────────┐                                     │
│  │ Scale         │   │ Archive       │                                     │
│  │ (Success)     │   │ (Learnings)   │                                     │
│  └───────────────┘   └───────────────┘                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Scenario Matrix

### By User Type

| Scenario | Municipality | Provider | Researcher | Expert | Citizen | Viewer |
|----------|-------------|----------|------------|--------|---------|--------|
| Browse challenges | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create challenge | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Submit proposal | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Evaluate proposals | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Submit idea | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Vote on ideas | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Join pilot | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ |
| Create R&D call | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Apply for R&D | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage solutions | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Expert evaluation | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Admin functions | Admin only | | | | | |

### Key User Journeys

#### Journey 1: Municipality Publishes Challenge
1. Log in → MunicipalityDashboard
2. Navigate to ChallengeCreate
3. Fill challenge details (bilingual)
4. Submit for review
5. Challenge approved and published
6. Receive proposals from providers
7. Assign to expert panel for evaluation
8. Select winner and create pilot
9. Monitor pilot progress
10. Record outcomes and case study

#### Journey 2: Startup Wins Opportunity
1. Complete onboarding as provider
2. Browse OpportunityFeed
3. Find matching challenge
4. Submit proposal via ProposalWizard
5. Proposal reviewed and shortlisted
6. Present to evaluation panel
7. Win the opportunity
8. Execute pilot with municipality
9. Solution scaled or archived

#### Journey 3: Researcher Applies for R&D Funding
1. Complete onboarding as researcher
2. Browse RDCalls
3. Find relevant call
4. Submit research proposal
5. Proposal evaluated
6. Funding approved
7. Execute research project
8. Publish findings

#### Journey 4: Citizen Participates in Innovation
1. Register and complete citizen onboarding
2. Browse citizen ideas
3. Vote on favorite ideas
4. Submit own idea
5. Idea gains traction
6. Idea converted to challenge
7. Enroll in related pilot
8. Provide feedback
9. Earn points and badges

#### Journey 5: Expert Evaluates Applications
1. Complete expert onboarding
2. Get approved and verified
3. Receive evaluation assignments
4. Review assigned applications
5. Score using rubrics
6. Submit recommendations
7. Track evaluation impact

---

## Page Categories

### Public Pages (No Auth Required)
- `/` (PublicPortal for non-auth)
- `/auth`
- `/about`, `/contact`, `/faq`
- `/for-municipalities`, `/for-providers`
- `/for-innovators`, `/for-researchers`
- `/public-challenges`, `/public-solutions`
- `/privacy`, `/terms`
- `/public-idea-submission`

### Onboarding Pages (Auth, No Layout)
- `/onboarding` - Main wizard
- `/startup-onboarding`
- `/municipality-staff-onboarding`
- `/researcher-onboarding`
- `/citizen-onboarding`
- `/expert-onboarding`

### Role-Based Dashboards
- `/municipality-dashboard` - Municipality staff
- `/provider-dashboard` - Startups/providers
- `/researcher-dashboard` - Researchers
- `/citizen-dashboard` - Citizens
- `/admin-dashboard` - Admins
- `/home` - General/viewer

### Protected Pages (Auth Required)
All other pages require authentication.

---

## Database Tables (Key)

| Table | Purpose |
|-------|---------|
| `user_profiles` | User data, onboarding status, persona |
| `user_roles` | Role assignments, permissions |
| `role_requests` | Pending role approvals |
| `onboarding_events` | Analytics tracking |
| `challenges` | Urban challenges |
| `challenge_proposals` | Provider proposals |
| `solutions` | Provider solutions |
| `pilots` | Pilot programs |
| `citizen_ideas` | Citizen submissions |
| `citizen_votes` | Voting on ideas |
| `expert_profiles` | Expert credentials |
| `evaluations` | Expert evaluations |

---

## Implementation Status

| Flow | Status | Notes |
|------|--------|-------|
| Email/Password Auth | ✅ Complete | Supabase Auth |
| Google OAuth | ✅ Complete | Configured |
| Microsoft OAuth | ✅ Complete | Configured |
| Main Onboarding Wizard | ✅ Complete | 6 steps with AI |
| Municipality Onboarding | ✅ Complete | 4 steps |
| Startup Onboarding | ✅ Complete | 4 steps |
| Researcher Onboarding | ✅ Complete | 4 steps |
| Citizen Onboarding | ✅ Complete | 4 steps |
| Expert Onboarding | ✅ Complete | CV extraction |
| Role Approval Flow | ✅ Complete | Edge function |
| Challenge Lifecycle | ✅ Complete | Full workflow |
| Pilot Lifecycle | ✅ Complete | Gate system |
| Citizen Participation | ✅ Complete | Voting, ideas |
| Expert Evaluation | ✅ Complete | Rubrics, panels |

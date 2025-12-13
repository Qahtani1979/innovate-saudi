# Programs & Events Hub - Design Document

**Version:** 2.0  
**Last Updated:** 2025-12-13  
**Status:** Comprehensive Review Complete  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [System Architecture](#system-architecture)
4. [Data Model](#data-model)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Feature Specifications](#feature-specifications)
7. [Integration Points](#integration-points)
8. [Communication System](#communication-system)
9. [AI Capabilities](#ai-capabilities)
10. [UI/UX Design](#uiux-design)
11. [Security Considerations](#security-considerations)
12. [Migration Strategy](#migration-strategy)

---

## 1. Executive Summary

### 1.1 Purpose

The Programs & Events Hub consolidates the management of programs, events, campaigns, and calendars into a unified interface. This document outlines the complete design for building and integrating this feature with all existing systems.

### 1.2 Goals

- **Unified Management**: Single hub for programs, events, and campaigns
- **Seamless Integration**: Connect with challenges, pilots, solutions, providers
- **AI-Powered**: Smart scheduling, attendance prediction, conflict detection
- **Communication Automation**: Integrated email/notification workflows
- **Role-Based Access**: Granular permissions for all user types

### 1.3 Scope

| In Scope | Out of Scope |
|----------|--------------|
| Program CRUD operations | Financial transactions |
| Event CRUD operations | Video conferencing integration |
| Campaign management | Social media publishing |
| Calendar views | Mobile native app |
| AI assistants | SMS notifications (Phase 2) |
| Email automation | |
| Provider applications | |

---

## 2. Current State Analysis

### 2.1 Existing Pages Inventory

#### Program Pages (14 total)

| Page | Path | Purpose | Status |
|------|------|---------|--------|
| `Programs.jsx` | `/programs` | Main listing with filters, AI insights | ✅ Active |
| `ProgramDetail.jsx` | `/programs/:id` | Full program view with 12+ tabs | ✅ Active (1215 lines) |
| `ProgramCreate.jsx` | `/programs/create` | Create via `ProgramCreateWizard` | ✅ Active |
| `ProgramEdit.jsx` | `/programs/:id/edit` | Edit with AI enhance, auto-save | ✅ Active (592 lines) |
| `ProgramApplicationWizard.jsx` | Apply flow | Multi-step application | ✅ Active |
| `ProgramApplicationDetail.jsx` | Application view | Single application details | ✅ Active |
| `ProgramApplicationEvaluationHub.jsx` | Evaluation | Application evaluation queue | ✅ Active |
| `ProgramCohortManagement.jsx` | Cohort mgmt | NOT FOUND (referenced) | ❌ Missing |
| `ProgramOperatorPortal.jsx` | Operator view | Program operator tools | ✅ Active |
| `ProgramOutcomesAnalytics.jsx` | Analytics | Outcome metrics & charts | ✅ Active |
| `ProgramImpactDashboard.jsx` | Impact | Conversion funnel analytics | ✅ Active |
| `ProgramPortfolioPlanner.jsx` | Portfolio | Program portfolio planning | ✅ Active |
| `MyPrograms.jsx` | `/my-programs` | User's enrolled programs | ✅ Active (199 lines) |
| `ParticipantDashboard.jsx` | Participant view | Active participant progress | ✅ Active (280 lines) |

#### Event Pages (4 total)

| Page | Path | Purpose | Status |
|------|------|---------|--------|
| `EventCalendar.jsx` | `/events` | Event listing (citizen-focused) | ✅ Active (187 lines) |
| `EventDetail.jsx` | `/events/:id` | Single event view | ✅ Active (194 lines) |
| `EventRegistration.jsx` | Component | Registration form | ✅ Active (221 lines) |
| `EventCreate.jsx` | `/events/create` | Create new event | ❌ **MISSING** |
| `EventEdit.jsx` | `/events/:id/edit` | Edit event | ❌ **MISSING** |

#### Campaign & Calendar Pages (3 total)

| Page | Path | Purpose | Status |
|------|------|---------|--------|
| `CampaignPlanner.jsx` | `/campaign-planner` | Campaign creation wizard | ✅ Active (699 lines) |
| `CalendarView.jsx` | `/calendar` | Unified calendar (pilots, programs, expert assignments) | ✅ Active (210 lines) |
| `CampaignManager` (component) | Communications | Email campaign manager | ✅ Active |

### 2.2 Existing Components Inventory

#### Program Components (37 files in `/src/components/programs/`)

| Component | Purpose | Status |
|-----------|---------|--------|
| `AICurriculumGenerator.jsx` | AI-generated week-by-week curriculum | ✅ Active |
| `AIDropoutPredictor.jsx` | At-risk participant detection | ✅ Active |
| `AICohortOptimizerWidget.jsx` | AI cohort optimization | ✅ Active |
| `AIAlumniSuggester.jsx` | Alumni next-step suggestions | ✅ Active |
| `AIProgramBenchmarking.jsx` | Program benchmarking | ✅ Active |
| `AIProgramSuccessPredictor.jsx` | Success prediction | ✅ Active |
| `AlumniImpactTracker.jsx` | Alumni impact tracking | ✅ Active |
| `AlumniNetworkHub.jsx` | Alumni networking | ✅ Active |
| `AlumniSuccessStoryGenerator.jsx` | AI story generation | ✅ Active |
| `AttendanceTracker.jsx` | Session attendance | ✅ Active |
| `AutomatedCertificateGenerator.jsx` | Certificate generation | ✅ Active |
| `CohortManagement.jsx` | Cohort management | ✅ Active |
| `CohortOptimizer.jsx` | Cohort optimization | ✅ Active |
| `CrossProgramSynergy.jsx` | Cross-program analysis | ✅ Active |
| `DropoutPredictor.jsx` | Dropout prediction | ✅ Active |
| `EnhancedProgressDashboard.jsx` | Progress dashboard | ✅ Active |
| `GraduationWorkflow.jsx` | Graduation process | ✅ Active |
| `ImpactStoryGenerator.jsx` | Impact story generator | ✅ Active |
| `MentorMatchingEngine.jsx` | Mentor matching | ✅ Active |
| `MentorScheduler.jsx` | Mentor scheduling | ✅ Active |
| `MunicipalImpactCalculator.jsx` | Municipal impact calc | ✅ Active |
| `OnboardingWorkflow.jsx` | Participant onboarding | ✅ Active |
| `ParticipantAssignmentSystem.jsx` | Assignment management | ✅ Active |
| `PeerCollaborationHub.jsx` | Peer collaboration | ✅ Active |
| `PeerLearningNetwork.jsx` | Peer learning network | ✅ Active |
| `PostProgramFollowUp.jsx` | Post-program tracking | ✅ Active |
| `ProgramActivityLog.jsx` | Activity logging | ✅ Active |
| `ProgramAlumniStoryboard.jsx` | Alumni storyboard | ✅ Active |
| `ProgramBenchmarking.jsx` | Benchmarking | ✅ Active |
| `ProgramCreateWizard.jsx` | Creation wizard | ✅ Active |
| `ProgramExpertEvaluation.jsx` | Expert evaluation | ✅ Active |
| `ProgramToPilotWorkflow.jsx` | Program→Pilot transition | ✅ Active |
| `ProgramToSolutionWorkflow.jsx` | Program→Solution transition | ✅ Active |
| `ResourceLibrary.jsx` | Resource library | ✅ Active |
| `SessionScheduler.jsx` | Session scheduling | ✅ Active |
| `StrategicAlignmentWidget.jsx` | Strategic alignment | ✅ Active |
| `WaitlistManager.jsx` | Waitlist management | ✅ Active |

#### Workflow Components (Top-level, program-related)

| Component | Purpose | Status |
|-----------|---------|--------|
| `ProgramLaunchWorkflow.jsx` | Launch program with email trigger | ✅ Active |
| `ProgramApplicationScreening.jsx` | Application screening | ✅ Active |
| `ProgramSelectionWorkflow.jsx` | Cohort selection | ✅ Active |
| `ProgramSessionManager.jsx` | Session management | ✅ Active |
| `ProgramMentorMatching.jsx` | Mentor matching | ✅ Active |
| `ProgramCompletionWorkflow.jsx` | Program completion | ✅ Active |
| `ProgramMidReviewGate.jsx` | Mid-program review | ✅ Active |

#### Event Components (1 file in `/src/components/calendar/`)

| Component | Purpose | Status |
|-----------|---------|--------|
| `ExternalCalendarSync.jsx` | External calendar sync | ✅ Active |

**CRITICAL GAP: No dedicated `/src/components/events/` folder exists!**

### 2.3 Database Tables

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROGRAMS TABLE                           │
├─────────────────────────────────────────────────────────────────┤
│ id, code, name_en, name_ar, tagline_en, tagline_ar              │
│ description_en, description_ar, objectives_en, objectives_ar    │
│ program_type (accelerator|incubator|hackathon|challenge|        │
│              fellowship|training|matchmaker|sandbox_wave|other)  │
│ status (planning|applications_open|selection|active|completed|  │
│         cancelled)                                               │
│ municipality_id, sector_id, region_id                           │
│ focus_areas, target_audience, eligibility_criteria              │
│ min_participants, max_participants, application_count           │
│ accepted_count, participants_count                               │
│ duration_weeks, timeline (JSONB - app open/close, start/end)    │
│ budget_amount, currency, funding_sources                        │
│ curriculum (JSONB array), events (JSONB array - NOT SYNCED!)    │
│ kpis, outcomes, success_metrics, lessons_learned                │
│ created_by, manager_email, coordinator_emails                   │
│ linked_challenge_ids, linked_pilot_ids, linked_solution_ids     │
│ is_featured, is_published, is_deleted                           │
│ version_number, previous_version_id                             │
│ created_at, updated_at                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         EVENTS TABLE                            │
├─────────────────────────────────────────────────────────────────┤
│ id, code, title_en, title_ar, description_en, description_ar    │
│ event_type (workshop|conference|hackathon|webinar|training|     │
│             networking|ceremony|demo|meetup|other)               │
│ start_date, end_date, timezone                                  │
│ location, location_address, is_virtual, virtual_link            │
│ mode (in_person|virtual|hybrid)                                 │
│ organizer_email, organizer_name                                 │
│ municipality_id, sector_id, program_id (FK to programs)         │
│ capacity, max_participants, registered_count, registration_count│
│ registration_required, registration_deadline                    │
│ is_public, is_featured, is_cancelled                            │
│ status (draft|published|registration_open|registration_closed|  │
│         in_progress|completed|cancelled)                        │
│ tags, image_url, agenda (JSONB), speakers (JSONB)               │
│ created_by_email, created_at, updated_at                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   EVENT_REGISTRATIONS TABLE                     │
├─────────────────────────────────────────────────────────────────┤
│ id, event_id, user_id, user_email, user_name                    │
│ organization_id, organization_name                              │
│ registration_status (pending|confirmed|cancelled|attended|      │
│                      no_show|waitlisted)                        │
│ registration_date, confirmation_date                            │
│ attendance_confirmed, check_in_time                             │
│ notes, dietary_requirements, special_requests                   │
│ feedback_submitted, rating                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  PROGRAM_APPLICATIONS TABLE                     │
├─────────────────────────────────────────────────────────────────┤
│ id, program_id, applicant_email, applicant_name                 │
│ organization_id, provider_id                                    │
│ status (draft|submitted|under_review|shortlisted|accepted|      │
│         rejected|waitlisted|withdrawn|enrolled|graduated)       │
│ application_data (JSONB), attachments, cover_letter             │
│ ai_score, ai_feedback, evaluation_scores                        │
│ reviewer_email, review_notes, review_date                       │
│ progress_percentage, attendance_rate, deliverables_completed    │
│ total_deliverables                                              │
│ submitted_at, decision_date, created_by                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  EMAIL_CAMPAIGNS TABLE                          │
├─────────────────────────────────────────────────────────────────┤
│ id, name, description, template_id                              │
│ audience_type, audience_filter (JSONB)                          │
│ campaign_variables (JSONB)                                      │
│ status (draft|scheduled|sending|sent|failed)                    │
│ scheduled_at, sent_at, created_by                               │
│ created_at, updated_at                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Critical Gap: Event Synchronization

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT DISCONNECT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CampaignPlanner.jsx                    events table            │
│  ┌─────────────────┐                   ┌─────────────────┐     │
│  │ programs.events │ ─── NO SYNC ───→  │  events table   │     │
│  │   (JSONB)       │                   │  (standalone)   │     │
│  └─────────────────┘                   └─────────────────┘     │
│         ↑                                      ↓                │
│   Events added here                   EventCalendar reads       │
│   are NOT visible                     from here (may be empty)  │
│   in EventCalendar                                              │
│                                                                 │
│  CalendarView.jsx reads from:                                   │
│  - pilots.timeline.pilot_start                                  │
│  - programs.timeline.program_start                              │
│  - expert_assignments.due_date                                  │
│  (Does NOT read from events table!)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Existing Hooks

```javascript
// Program Hooks
useProgramsWithVisibility.js  // Visibility-scoped program fetching (164 lines)
// Uses usePermissions, useVisibilitySystem
// Handles: Admin, National Deputyship, Municipality Staff, Provider, Others

// Email Trigger Hook
useEmailTrigger.js            // Email trigger automation
// Used in: ProgramLaunchWorkflow, EventRegistration

// Event Hooks (TO BE CREATED)
// useEvents.js - Event CRUD operations
// useEventRegistrations.js - Registration management
// useEventsWithVisibility.js - Visibility-scoped fetch
```

### 2.6 Email Trigger Status

| Trigger Code | Template | Wired In UI | Location |
|--------------|----------|-------------|----------|
| `program.launched` | ✅ | ✅ | `ProgramLaunchWorkflow.jsx` |
| `program.application_received` | ✅ | ⚠️ Unknown | Application flow |
| `program.application_status_changed` | ✅ | ⚠️ Unknown | Status change |
| `program.participant_welcome` | ✅ | ⚠️ Unknown | On acceptance |
| `event.registration_confirmed` | ✅ | ✅ | `EventRegistration.jsx` |
| `event.reminder` | ✅ | ❌ | No scheduler |
| `event.invitation` | ✅ | ❌ | No UI |
| `event.updated` | ✅ | ❌ | No EventEdit.jsx |
| `event.cancelled` | ✅ | ❌ | No cancellation UI |
| `event.created` | ✅ | ❌ | No EventCreate.jsx |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PROGRAMS & EVENTS HUB                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Programs   │  │   Events    │  │  Campaigns  │  │  Calendar   │        │
│  │    Tab      │  │    Tab      │  │    Tab      │  │    Tab      │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                    │                                        │
│                          ┌─────────┴─────────┐                              │
│                          │   Unified State   │                              │
│                          │   Management      │                              │
│                          └─────────┬─────────┘                              │
│                                    │                                        │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         │                          │                          │            │
│  ┌──────┴──────┐           ┌───────┴───────┐          ┌───────┴───────┐    │
│  │  Programs   │           │    Events     │          │   Campaigns   │    │
│  │   Service   │◄─────────►│    Service    │◄────────►│    Service    │    │
│  └──────┬──────┘           └───────┬───────┘          └───────┬───────┘    │
│         │                          │                          │            │
│         └──────────────────────────┼──────────────────────────┘            │
│                                    │                                        │
│                          ┌─────────┴─────────┐                              │
│                          │   Sync Service    │                              │
│                          │ (Program↔Event)   │                              │
│                          └─────────┬─────────┘                              │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                   ┌──────┴──────┐       ┌──────┴──────┐
                   │  Supabase   │       │    Edge     │
                   │  Database   │       │  Functions  │
                   └─────────────┘       └─────────────┘
```

### 3.2 Proposed Component Structure

```
src/
├── pages/
│   ├── Programs.jsx              # Refactor to hub with tabs
│   ├── ProgramDetail.jsx         # Keep as-is (feature-complete)
│   ├── ProgramCreate.jsx         # Keep as-is
│   ├── ProgramEdit.jsx           # Keep as-is
│   ├── EventCalendar.jsx         # Enhance with create link
│   ├── EventDetail.jsx           # Enhance with edit/cancel
│   ├── EventCreate.jsx           # NEW
│   ├── EventEdit.jsx             # NEW
│   ├── CalendarView.jsx          # Enhance to include events table
│   ├── CampaignPlanner.jsx       # Enhance with sync
│   ├── MyPrograms.jsx            # Keep as-is
│   └── ParticipantDashboard.jsx  # Keep as-is
│
├── components/
│   ├── programs/                  # 37 existing components
│   │   └── ... (all existing)
│   │
│   ├── events/                    # NEW FOLDER
│   │   ├── EventCard.jsx          # NEW
│   │   ├── EventFilters.jsx       # NEW
│   │   ├── EventCreateForm.jsx    # NEW
│   │   ├── EventEditForm.jsx      # NEW
│   │   ├── EventCancelDialog.jsx  # NEW
│   │   └── EventAttendeeList.jsx  # NEW
│   │
│   ├── hub/                       # NEW FOLDER
│   │   ├── ProgramsEventsHub.jsx  # NEW - Tab container
│   │   ├── HubTabs.jsx            # NEW - Tab navigation
│   │   ├── HubStats.jsx           # NEW - Unified statistics
│   │   └── QuickActions.jsx       # NEW - Common actions
│   │
│   └── ai/
│       ├── AIEventOptimizer.jsx      # NEW
│       ├── AIAttendancePredictor.jsx # NEW
│       └── AIConflictDetector.jsx    # NEW
│
├── hooks/
│   ├── useProgramsWithVisibility.js  # Existing
│   ├── useEvents.js                  # NEW
│   ├── useEventRegistrations.js      # NEW
│   └── useEventsWithVisibility.js    # NEW
│
└── services/
    └── eventSyncService.js           # NEW - Sync logic
```

---

## 4. User Roles & Permissions

### 4.1 Current Permissions (from codebase)

```javascript
// Existing program permissions
'program_create'     // ProgramCreate page guard
'program_edit'       // ProgramDetail edit button
'program_delete'     // Archive/delete
'program_manage'     // Full management

// Missing permissions (to be added)
'event_create'       // Create events
'event_edit'         // Edit events
'event_delete'       // Delete/cancel events
'event_manage'       // Full event management
'campaign_create'    // Create campaigns
'campaign_manage'    // Manage campaigns
```

### 4.2 Role Permission Matrix

| Role | program_create | program_edit | event_create | event_edit | campaign_manage |
|------|----------------|--------------|--------------|------------|-----------------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Deputyship Admin | ✅ (sector) | ✅ (sector) | ✅ (sector) | ✅ (sector) | ✅ (sector) |
| Deputyship Staff | ✅ (sector) | ❌ | ✅ (sector) | ❌ | ❌ |
| Municipality Admin | ✅ (own) | ✅ (own) | ✅ (own) | ✅ (own) | ✅ (own) |
| Municipality Staff | ❌ | ❌ | ❌ | ❌ | ❌ |
| Municipality Coordinator | ❌ | ❌ | ✅ (own) | ✅ (own) | ❌ |
| Provider | ❌ | ❌ | ❌ | ❌ | ❌ |
| Citizen | ❌ | ❌ | ❌ | ❌ | ❌ |

### 4.3 Visibility Rules (from useProgramsWithVisibility)

```javascript
// Admin: Full access
// National Deputyship: Filter by assigned sectors
// Municipality Staff: Own municipality + national programs
// Provider: Published programs only
// Others: Published programs only
```

---

## 5. AI Capabilities

### 5.1 Existing AI Features (Programs)

| Feature | Component | Model Used | Status |
|---------|-----------|------------|--------|
| Curriculum Generator | `AICurriculumGenerator.jsx` | useAIWithFallback | ✅ Active |
| Dropout Predictor | `AIDropoutPredictor.jsx` | Mock (random) | ⚠️ Mock |
| Cohort Optimizer | `AICohortOptimizerWidget.jsx` | useAIWithFallback | ✅ Active |
| Alumni Suggester | `AIAlumniSuggester.jsx` | useAIWithFallback | ✅ Active |
| Success Predictor | `AIProgramSuccessPredictor.jsx` | useAIWithFallback | ✅ Active |
| Benchmarking | `AIProgramBenchmarking.jsx` | useAIWithFallback | ✅ Active |
| Strategic Insights | Programs.jsx `handleAIInsights` | useAIWithFallback | ✅ Active |
| Content Enhancement | ProgramEdit.jsx `handleAIEnhance` | useAIWithFallback | ✅ Active |

### 5.2 Existing AI Features (Campaigns)

| Feature | Component | Model Used | Status |
|---------|-----------|------------|--------|
| Campaign Generator | `CampaignPlanner.jsx` | useAIWithFallback | ✅ Active |
| Subject/Body Generator | `CampaignAIHelpers.jsx` | useAIWithFallback | ✅ Active |

### 5.3 Proposed AI Features (Events)

| Feature | Component | Purpose |
|---------|-----------|---------|
| Event Optimizer | `AIEventOptimizer.jsx` | Optimal timing + description |
| Attendance Predictor | `AIAttendancePredictor.jsx` | Forecast attendance |
| Conflict Detector | `AIConflictDetector.jsx` | Scheduling conflict detection |

---

## 6. Integration Points

### 6.1 Entity Linkages

```
Programs ←→ Challenges
  - programs.linked_challenge_ids[]
  - ProgramChallengeAlignment.jsx page exists

Programs ←→ Pilots
  - programs.linked_pilot_ids[]
  - ProgramToPilotWorkflow.jsx component

Programs ←→ Solutions
  - programs.linked_solution_ids[]
  - ProgramToSolutionWorkflow.jsx component

Programs ←→ Events
  - events.program_id (FK)
  - programs.events[] (JSONB - NOT SYNCED!)

Programs ←→ Applications
  - program_applications.program_id (FK)

Programs ←→ Municipalities
  - programs.municipality_id (FK)

Programs ←→ Sectors
  - programs.sector_id (FK)

Events ←→ Registrations
  - event_registrations.event_id (FK)

Events ←→ Municipalities
  - events.municipality_id (FK)
```

### 6.2 Menu Integration (sidebar)

Current structure in sidebar needs update to reflect hub:

```javascript
// Proposed menu structure
{
  label: 'Programs & Events',
  icon: Layers,
  path: '/programs',
  children: [
    { label: 'All Programs', path: '/programs?tab=programs' },
    { label: 'All Events', path: '/programs?tab=events' },
    { label: 'Calendar', path: '/programs?tab=calendar' },
    { label: 'Campaigns', path: '/programs?tab=campaigns' },
    { label: 'Create Program', path: '/programs/create', permission: 'program_create' },
    { label: 'Create Event', path: '/events/create', permission: 'event_create' },
  ]
}
```

---

## 7. Communication System

### 7.1 Email Templates (Existing)

| Category | Template Key | Variables |
|----------|--------------|-----------|
| Events | `event.registration_confirmed` | eventTitle, eventDate, location |
| Events | `event.reminder` | eventTitle, eventDate, hours_before |
| Events | `event.invitation` | eventTitle, eventDate, inviter_name |
| Events | `event.updated` | eventTitle, changes_summary |
| Events | `event.cancelled` | eventTitle, reason, alternative |
| Programs | `program.launched` | programName, programType, launchDate |
| Programs | `program.application_received` | programName, applicant_name |
| Programs | `program.application_status_changed` | programName, new_status |
| Programs | `program.participant_welcome` | programName, start_date |

### 7.2 Edge Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `send-email` | Send emails via Resend | ✅ Active |
| `campaign-sender` | Send campaigns | ✅ Active |
| `strategy-program-theme-generator` | AI theme generation | ✅ Active |

---

## 8. Security Considerations

### 8.1 RLS Policies Required

```sql
-- Events table should have:
-- 1. Public read for is_public = true
-- 2. Write restricted by municipality/sector scope
-- 3. Delete restricted to admins + owners

-- Event registrations:
-- 1. Users can read their own
-- 2. Event organizers can read all for their events
-- 3. Admins can read all
```

### 8.2 Permission Checks

All new pages must use:
- `ProtectedPage` HOC
- `usePermissions` hook
- `hasPermission()` checks for actions

---

## 9. Migration Strategy

### 9.1 Phase 1: Event CRUD (Week 1-2)
1. Create `/src/components/events/` folder
2. Create `EventCreate.jsx` and `EventEdit.jsx` pages
3. Add event permissions to database
4. Wire email triggers

### 9.2 Phase 2: Sync Service (Week 3)
1. Create `eventSyncService.js`
2. Update `CampaignPlanner.jsx` to use sync
3. Add sync_id tracking

### 9.3 Phase 3: Hub Consolidation (Week 4)
1. Refactor `Programs.jsx` to hub with tabs
2. Create hub components
3. Update navigation/menus

### 9.4 Phase 4: AI Enhancements (Week 5)
1. Create AI event components
2. Integrate with creation forms
3. Add to hub dashboard

---

## 10. Appendix

### A. File Size Analysis

| File | Lines | Complexity |
|------|-------|------------|
| ProgramDetail.jsx | 1,215 | High (12+ tabs, many workflows) |
| CampaignPlanner.jsx | 699 | Medium |
| ProgramEdit.jsx | 592 | Medium |
| ParticipantDashboard.jsx | 280 | Low |
| EventRegistration.jsx | 221 | Low |
| CalendarView.jsx | 210 | Low |
| MyPrograms.jsx | 199 | Low |
| EventDetail.jsx | 194 | Low |
| EventCalendar.jsx | 187 | Low |

### B. Dependencies

All required dependencies are already installed:
- `@tanstack/react-query` - Data fetching
- `date-fns` - Date handling
- `react-day-picker` - Calendar
- `lucide-react` - Icons
- `sonner` - Toasts

---

**Document Status:** Comprehensive Review Complete  
**Last Updated:** 2025-12-13  
**Next Action:** Proceed with Phase 1 Implementation

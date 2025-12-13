# Programs & Events Hub - Design Document

**Version:** 1.0  
**Last Updated:** 2025-12-13  
**Status:** Draft  

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
11. [API Specifications](#api-specifications)
12. [Security Considerations](#security-considerations)
13. [Migration Strategy](#migration-strategy)

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

### 2.1 Existing Components

#### Database Tables

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROGRAMS TABLE                           │
├─────────────────────────────────────────────────────────────────┤
│ id, code, title_en, title_ar, description_en, description_ar    │
│ program_type (national|regional|local|sectoral)                 │
│ status (draft|planned|open|active|completed|cancelled)          │
│ municipality_id, sector_id, region_id                           │
│ target_participants, max_participants, min_participants         │
│ start_date, end_date, application_deadline                      │
│ budget_amount, currency, funding_sources                        │
│ events (JSONB array - NOT synced to events table)               │
│ campaigns (JSONB array)                                         │
│ eligibility_criteria, selection_criteria, evaluation_rubric     │
│ linked_challenge_ids, linked_pilot_ids, linked_solution_ids     │
│ kpis, success_metrics, lessons_learned                          │
│ created_by_email, manager_email, coordinator_emails             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         EVENTS TABLE                            │
├─────────────────────────────────────────────────────────────────┤
│ id, title_en, title_ar, description_en, description_ar          │
│ event_type (webinar|workshop|conference|meetup|demo|training|   │
│             networking|hackathon|ceremony|other)                │
│ event_date, start_time, end_time, timezone                      │
│ location_type (virtual|physical|hybrid)                         │
│ location_name, location_address, virtual_link                   │
│ organizer_id, organizer_email, organizer_name                   │
│ municipality_id, sector_id, program_id (FK to programs)         │
│ max_attendees, current_attendees, waitlist_count                │
│ registration_required, registration_deadline                    │
│ is_public, is_featured, is_cancelled                            │
│ tags, image_url, agenda, speakers                               │
│ created_by_email                                                │
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
│         rejected|waitlisted|withdrawn)                          │
│ application_data, attachments, cover_letter                     │
│ ai_score, ai_feedback, evaluation_scores                        │
│ reviewer_email, review_notes, review_date                       │
│ submitted_at, decision_date, waitlist_promoted_date             │
└─────────────────────────────────────────────────────────────────┘
```

#### Existing UI Components

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| `Programs.jsx` | `/programs` | Program listing & management | ✅ Active |
| `ProgramDetail.jsx` | `/programs/:id` | Single program view | ✅ Active |
| `ProgramCreate.jsx` | `/programs/create` | Create new program | ✅ Active |
| `ProgramEdit.jsx` | `/programs/:id/edit` | Edit existing program | ✅ Active |
| `ProgramApply.jsx` | `/programs/:id/apply` | Provider application | ✅ Active |
| `CampaignPlanner.jsx` | Tab in ProgramDetail | Campaign & event planning | ⚠️ Partial |
| `EventCalendar.jsx` | `/events` | Calendar view | ✅ Active |
| `EventDetail.jsx` | `/events/:id` | Single event view | ✅ Active |
| `EventRegistration.jsx` | Component | Registration form | ✅ Active |
| `EventCreate.jsx` | - | Create new event | ❌ Missing |
| `EventEdit.jsx` | - | Edit existing event | ❌ Missing |

#### Critical Gap: Event Synchronization

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
│   are NOT visible                     from here (empty)         │
│   in EventCalendar                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Existing Hooks

```javascript
// Program Hooks
useProgramsWithVisibility.js  // Visibility-scoped program fetching
usePrograms.js               // Basic program operations (if exists)

// Event Hooks (to be created)
useEvents.js                 // Event CRUD operations
useEventRegistrations.js     // Registration management
useEventSync.js              // Program-Event synchronization
```

### 2.3 Existing Email Triggers

| Trigger Code | Template | Status | Wired In UI |
|--------------|----------|--------|-------------|
| `event.registration_confirmed` | ✅ Exists | Active | ✅ EventRegistration.jsx |
| `event.reminder` | ✅ Exists | Active | ❌ No cron/scheduler |
| `event.invitation` | ✅ Exists | Active | ❌ No UI |
| `event.updated` | ✅ Exists | Active | ❌ No EventEdit.jsx |
| `event.cancelled` | ✅ Exists | Active | ❌ No cancellation UI |
| `event.created` | ✅ Exists | Active | ❌ No EventCreate.jsx |
| `program.application_received` | ✅ Exists | Active | ✅ ProgramApply.jsx |
| `program.application_status_changed` | ✅ Exists | Active | ✅ Application review |
| `program.participant_welcome` | ✅ Exists | Active | ✅ On acceptance |

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

### 3.2 Component Architecture

```
src/
├── pages/
│   ├── programs/
│   │   ├── Programs.jsx              # Main hub (refactored)
│   │   ├── ProgramDetail.jsx         # Existing
│   │   ├── ProgramCreate.jsx         # Existing
│   │   ├── ProgramEdit.jsx           # Existing
│   │   └── ProgramApply.jsx          # Existing
│   └── events/
│       ├── Events.jsx                # Event listing (new)
│       ├── EventDetail.jsx           # Existing (enhanced)
│       ├── EventCreate.jsx           # NEW
│       └── EventEdit.jsx             # NEW
│
├── components/
│   ├── programs/
│   │   ├── ProgramCard.jsx
│   │   ├── ProgramFilters.jsx
│   │   ├── ProgramStats.jsx
│   │   ├── CampaignPlanner.jsx       # Enhanced with sync
│   │   ├── WaitlistManager.jsx
│   │   ├── AIDropoutPredictor.jsx
│   │   └── AIApplicationScorer.jsx
│   │
│   ├── events/
│   │   ├── EventCard.jsx             # NEW
│   │   ├── EventFilters.jsx          # NEW
│   │   ├── EventCalendar.jsx         # Enhanced
│   │   ├── EventRegistration.jsx     # Existing
│   │   ├── EventCreateForm.jsx       # NEW
│   │   ├── EventEditForm.jsx         # NEW
│   │   ├── EventCancelDialog.jsx     # NEW
│   │   └── EventAttendeeList.jsx     # NEW
│   │
│   ├── hub/
│   │   ├── ProgramsEventsHub.jsx     # NEW - Main container
│   │   ├── HubTabs.jsx               # NEW - Tab navigation
│   │   ├── HubStats.jsx              # NEW - Unified statistics
│   │   └── QuickActions.jsx          # NEW - Common actions
│   │
│   └── ai/
│       ├── AIEventOptimizer.jsx      # NEW
│       ├── AIAttendancePredictor.jsx # NEW
│       ├── AIConflictDetector.jsx    # NEW
│       └── AICampaignSuggester.jsx   # NEW
│
├── hooks/
│   ├── programs/
│   │   ├── usePrograms.js
│   │   ├── useProgramsWithVisibility.js
│   │   └── useProgramApplications.js
│   │
│   └── events/
│       ├── useEvents.js              # NEW
│       ├── useEventRegistrations.js  # NEW
│       ├── useEventSync.js           # NEW
│       └── useEventCalendar.js       # NEW
│
└── services/
    ├── eventSyncService.js           # NEW - Sync logic
    └── campaignService.js            # NEW - Campaign orchestration
```

---

## 4. Data Model

### 4.1 Enhanced Events Table

```sql
-- No schema changes needed, existing table is comprehensive
-- Key relationships:
-- events.program_id → programs.id (FK exists)
-- events.municipality_id → municipalities.id (FK exists)
-- events.sector_id → sectors.id (FK exists)
```

### 4.2 Synchronization Model

```javascript
// EventSyncService.js

/**
 * Sync Direction: Program.events[] → events table
 * 
 * When an event is added in CampaignPlanner:
 * 1. Create record in events table
 * 2. Store the events table ID back in program.events[].sync_id
 * 3. Keep both in sync on updates
 */

const syncEventFromProgram = async (program, eventData) => {
  // Check if already synced
  if (eventData.sync_id) {
    // Update existing event
    await supabase.from('events')
      .update({
        title_en: eventData.name,
        event_date: eventData.date,
        // ... map fields
      })
      .eq('id', eventData.sync_id);
  } else {
    // Create new event
    const { data } = await supabase.from('events')
      .insert({
        title_en: eventData.name,
        program_id: program.id,
        municipality_id: program.municipality_id,
        sector_id: program.sector_id,
        event_date: eventData.date,
        // ... map fields
      })
      .select()
      .single();
    
    // Update program.events[] with sync_id
    // ...
  }
};
```

### 4.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Action                  Processing                    Result          │
│  ───────────                  ──────────                    ──────          │
│                                                                             │
│  ┌─────────────┐             ┌─────────────┐             ┌─────────────┐   │
│  │ Create Event│────────────►│ EventCreate │────────────►│ events table│   │
│  │ (Standalone)│             │   Form      │             │ + email     │   │
│  └─────────────┘             └─────────────┘             └─────────────┘   │
│                                                                             │
│  ┌─────────────┐             ┌─────────────┐             ┌─────────────┐   │
│  │ Add Event   │────────────►│ Campaign    │────────────►│ programs.   │   │
│  │ (In Program)│             │ Planner     │             │ events[] +  │   │
│  └─────────────┘             └──────┬──────┘             │ sync to     │   │
│                                     │                     │ events table│   │
│                                     ▼                     └─────────────┘   │
│                              ┌─────────────┐                               │
│                              │ Sync Service│                               │
│                              └─────────────┘                               │
│                                                                             │
│  ┌─────────────┐             ┌─────────────┐             ┌─────────────┐   │
│  │ Register    │────────────►│ Registration│────────────►│ event_      │   │
│  │ for Event   │             │ Component   │             │ registrations│  │
│  └─────────────┘             └──────┬──────┘             │ + email     │   │
│                                     │                     └─────────────┘   │
│                                     ▼                                       │
│                              ┌─────────────┐                               │
│                              │ Email Edge  │                               │
│                              │ Function    │                               │
│                              └─────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. User Roles & Permissions

### 5.1 Role Matrix

| Role | Programs | Events | Campaigns | Calendar |
|------|----------|--------|-----------|----------|
| **Admin** | Full CRUD | Full CRUD | Full CRUD | Full Access |
| **Deputyship Admin** | Sector CRUD | Sector CRUD | Sector CRUD | Full Access |
| **Deputyship Staff** | Sector View/Create | Sector View/Create | View | Full Access |
| **Municipality Admin** | Own CRUD | Own CRUD | Own CRUD | Full Access |
| **Municipality Staff** | Own View/Create | Own View/Create | View | Full Access |
| **Municipality Coordinator** | Own View | Own CRUD | View | Full Access |
| **Provider** | View/Apply | View/Register | View | View |
| **Citizen** | Public View | Public View/Register | - | Public View |
| **Guest** | Public View | Public View | - | Public View |

### 5.2 Required Permissions

```javascript
// New permissions to add to the system
const eventPermissions = [
  'event_create',    // Create new events
  'event_edit',      // Edit own/assigned events
  'event_delete',    // Delete/cancel events
  'event_manage',    // Manage all event aspects
  'event_register',  // Register for events
  'event_view_all',  // View all events (bypass visibility)
];

const campaignPermissions = [
  'campaign_create', // Create campaigns
  'campaign_edit',   // Edit campaigns
  'campaign_manage', // Full campaign management
  'campaign_execute',// Execute/send campaigns
];

// Existing program permissions (for reference)
const programPermissions = [
  'program_create',
  'program_edit',
  'program_delete',
  'program_manage',
  'program_apply',
  'program_review_applications',
];
```

### 5.3 Visibility Rules

```javascript
/**
 * Visibility System Integration
 * 
 * Uses existing useVisibilitySystem hook patterns
 */

// Events follow same visibility as programs:
// - Admin: All events
// - National Deputyship: Events in their sector(s)
// - Geographic Municipality: Own + national events
// - Provider: Events for programs they've applied to
// - Public: Published/active events only

const useEventsWithVisibility = (options) => {
  const { hasFullVisibility, isNational, sectorIds, userMunicipalityId } = useVisibilitySystem();
  
  // Apply same patterns as useProgramsWithVisibility
  // ...
};
```

---

## 6. Feature Specifications

### 6.1 Programs Tab

#### 6.1.1 Program Listing
- Grid/List view toggle
- Filters: status, type, sector, municipality, date range
- Search: title, description, code
- Sorting: date, participants, status
- Quick actions: view, edit, duplicate, archive

#### 6.1.2 Program Creation
- Multi-step wizard or single form
- AI-assisted description generation
- Template selection
- Challenge/Pilot linking
- Automatic code generation

#### 6.1.3 Program Management
- Application review queue
- Participant management
- Progress tracking
- KPI monitoring
- Event scheduling (CampaignPlanner integration)

### 6.2 Events Tab

#### 6.2.1 Event Listing
- Card grid view
- Filters: type, date, location type, program
- Search: title, description
- Quick registration button
- Status indicators

#### 6.2.2 Event Creation (NEW)

```jsx
// EventCreate.jsx - Feature Spec

const eventCreateFeatures = {
  basicInfo: {
    title: { en: 'required', ar: 'optional' },
    description: { en: 'required', ar: 'optional' },
    eventType: 'dropdown', // webinar, workshop, etc.
    tags: 'multi-select',
    image: 'upload',
  },
  
  scheduling: {
    date: 'date-picker',
    startTime: 'time-picker',
    endTime: 'time-picker',
    timezone: 'dropdown',
    recurrence: 'optional', // Phase 2
  },
  
  location: {
    type: 'radio', // virtual, physical, hybrid
    virtualLink: 'conditional', // if virtual/hybrid
    locationName: 'conditional', // if physical/hybrid
    locationAddress: 'conditional',
  },
  
  registration: {
    required: 'toggle',
    maxAttendees: 'number',
    deadline: 'date-picker',
    waitlistEnabled: 'toggle',
  },
  
  programLink: {
    programId: 'optional-dropdown',
    // If linked, inherits municipality/sector
  },
  
  visibility: {
    isPublic: 'toggle',
    isFeatured: 'toggle',
  },
  
  aiAssistance: {
    generateDescription: 'button',
    suggestTiming: 'button', // based on target audience
    predictAttendance: 'button',
  },
};
```

#### 6.2.3 Event Edit (NEW)

- Same form as create, pre-populated
- Version history
- Change notifications to registrants
- Cancel option with reason

#### 6.2.4 Event Cancellation (NEW)

```jsx
// EventCancelDialog.jsx

const cancellationFeatures = {
  reason: 'required-textarea',
  notifyRegistrants: 'toggle', // default: true
  offerAlternative: 'optional-event-select',
  refundPolicy: 'info-display', // if applicable
};

// On cancellation:
// 1. Set is_cancelled = true
// 2. Trigger event.cancelled email to all registrants
// 3. Update registration statuses
// 4. Log activity
```

### 6.3 Campaigns Tab

#### 6.3.1 Campaign Types
- Awareness campaigns
- Recruitment drives
- Event promotion
- Success stories
- Surveys/Feedback

#### 6.3.2 Campaign Builder
- Template selection
- Audience targeting
- Multi-channel: email, in-app, (SMS Phase 2)
- Scheduling
- A/B testing (Phase 2)

### 6.4 Calendar Tab

#### 6.4.1 Views
- Month view (default)
- Week view
- Day view
- Agenda/List view

#### 6.4.2 Features
- Color-coded by type/status
- Drag-and-drop rescheduling
- Quick event creation
- Conflict highlighting
- Filter by program/type

### 6.5 AI Analytics Tab

#### 6.5.1 AI Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Attendance Predictor** | Predict event attendance based on historical data | Edge function + ML |
| **Optimal Timing** | Suggest best dates/times for events | Analytics-based |
| **Conflict Detector** | Identify scheduling conflicts | Calendar analysis |
| **Dropout Predictor** | Identify at-risk program participants | Existing component |
| **Campaign Optimizer** | A/B test suggestions, timing optimization | Edge function |
| **Description Generator** | AI-generated event/program descriptions | OpenAI/Gemini |

---

## 7. Integration Points

### 7.1 System Integrations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTEGRATION MAP                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        ┌─────────────────┐                                  │
│                        │  Programs &     │                                  │
│                        │  Events Hub     │                                  │
│                        └────────┬────────┘                                  │
│                                 │                                           │
│    ┌────────────────────────────┼────────────────────────────┐             │
│    │                            │                            │             │
│    ▼                            ▼                            ▼             │
│ ┌──────────┐              ┌──────────┐              ┌──────────┐          │
│ │Challenges│              │  Pilots  │              │Solutions │          │
│ │          │◄────────────►│          │◄────────────►│          │          │
│ └──────────┘              └──────────┘              └──────────┘          │
│    │                            │                            │             │
│    └────────────────────────────┼────────────────────────────┘             │
│                                 │                                           │
│                                 ▼                                           │
│                        ┌─────────────────┐                                  │
│                        │   Providers     │                                  │
│                        │   (Applicants)  │                                  │
│                        └─────────────────┘                                  │
│                                 │                                           │
│         ┌───────────────────────┼───────────────────────┐                  │
│         │                       │                       │                  │
│         ▼                       ▼                       ▼                  │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐            │
│  │Municipalities│        │  Sectors    │        │  Regions    │            │
│  └─────────────┘        └─────────────┘        └─────────────┘            │
│                                                                             │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐            │
│  │   Email     │        │Notifications│        │  Activity   │            │
│  │   System    │        │   System    │        │    Logs     │            │
│  └─────────────┘        └─────────────┘        └─────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Challenge Integration

```javascript
// Programs can be linked to challenges
// challenges.linked_program_ids[] ↔ programs.linked_challenge_ids[]

const linkProgramToChallenge = async (programId, challengeId) => {
  // Update both sides of relationship
  await Promise.all([
    supabase.from('programs')
      .update({ linked_challenge_ids: [...existing, challengeId] })
      .eq('id', programId),
    supabase.from('challenges')
      .update({ linked_program_ids: [...existing, programId] })
      .eq('id', challengeId),
  ]);
};
```

### 7.3 Pilot Integration

```javascript
// Programs can spawn from successful pilots
// pilots → programs (graduation path)

const graduatePilotToProgram = async (pilotId) => {
  const pilot = await fetchPilot(pilotId);
  
  const programData = {
    title_en: `${pilot.title_en} Program`,
    description_en: pilot.description_en,
    municipality_id: pilot.municipality_id,
    sector_id: pilot.sector_id,
    linked_pilot_ids: [pilotId],
    // ... inherit relevant fields
  };
  
  return createProgram(programData);
};
```

### 7.4 Provider Integration

```javascript
// Providers apply to programs
// Providers register for events

const providerIntegration = {
  programs: {
    canApply: true,
    canViewApplicationStatus: true,
    receivesNotifications: ['accepted', 'rejected', 'waitlisted'],
  },
  events: {
    canRegister: true,
    canViewRegisteredEvents: true,
    receivesReminders: true,
  },
};
```

---

## 8. Communication System

### 8.1 Email Triggers

| Trigger | When | Recipients | Template |
|---------|------|------------|----------|
| `event.created` | New event published | Relevant users by visibility | Event announcement |
| `event.updated` | Event details changed | All registrants | Update notification |
| `event.cancelled` | Event cancelled | All registrants | Cancellation notice |
| `event.reminder` | 24h before event | Confirmed registrants | Event reminder |
| `event.registration_confirmed` | User registers | Registrant | Confirmation |
| `program.application_received` | Provider applies | Applicant + Manager | Receipt confirmation |
| `program.application_status_changed` | Status changes | Applicant | Status update |
| `program.participant_welcome` | Accepted to program | New participant | Welcome package |

### 8.2 Email Implementation

```javascript
// Edge function: send-email

const sendEventEmail = async (triggerCode, eventId, recipientEmails) => {
  const event = await fetchEvent(eventId);
  const template = await fetchTemplate(triggerCode);
  
  const variables = {
    event_title: event.title_en,
    event_date: formatDate(event.event_date),
    event_time: `${event.start_time} - ${event.end_time}`,
    event_location: event.location_name || event.virtual_link,
    event_link: `${BASE_URL}/events/${event.id}`,
  };
  
  return sendBatchEmail(template, recipientEmails, variables);
};
```

### 8.3 In-App Notifications

```javascript
// Notification types for events
const eventNotificationTypes = [
  'event_created',
  'event_updated', 
  'event_cancelled',
  'event_reminder',
  'event_registration_confirmed',
  'event_registration_cancelled',
  'event_feedback_requested',
];

// Use existing citizen_notifications table
const createEventNotification = async (userId, type, eventId) => {
  await supabase.from('citizen_notifications').insert({
    user_id: userId,
    notification_type: type,
    entity_type: 'event',
    entity_id: eventId,
    title: getNotificationTitle(type),
    message: getNotificationMessage(type, event),
  });
};
```

---

## 9. AI Capabilities

### 9.1 AI Event Optimizer

```javascript
// AIEventOptimizer.jsx

const aiEventOptimizer = {
  features: [
    {
      name: 'Optimal Timing',
      description: 'Suggests best date/time based on target audience availability',
      input: { targetAudience: 'string', eventType: 'string' },
      output: { suggestedDates: 'Date[]', reasoning: 'string' },
    },
    {
      name: 'Description Generator',
      description: 'Generates compelling event description',
      input: { title: 'string', eventType: 'string', keyPoints: 'string[]' },
      output: { description: 'string', tagline: 'string' },
    },
    {
      name: 'Attendance Predictor',
      description: 'Predicts expected attendance',
      input: { eventId: 'uuid' },
      output: { predicted: 'number', confidence: 'number', factors: 'string[]' },
    },
  ],
};
```

### 9.2 AI Conflict Detector

```javascript
// AIConflictDetector.jsx

const detectConflicts = async (newEvent) => {
  // Check for:
  // 1. Same organizer has another event
  // 2. Same municipality has overlapping events
  // 3. Similar target audience has competing events
  // 4. Key stakeholders have calendar conflicts
  
  const conflicts = await analyzeCalendarConflicts(newEvent);
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts: conflicts.map(c => ({
      type: c.type,
      severity: c.severity, // high, medium, low
      conflictingEvent: c.event,
      suggestion: c.resolution,
    })),
  };
};
```

### 9.3 AI Campaign Suggester

```javascript
// AICampaignSuggester.jsx

const suggestCampaign = async (programId) => {
  const program = await fetchProgram(programId);
  
  // Analyze program details and suggest:
  return {
    campaignType: 'recommended type',
    targetAudience: 'segment definition',
    messaging: {
      headline: 'suggested headline',
      body: 'suggested body',
      cta: 'suggested call-to-action',
    },
    timing: {
      startDate: 'suggested start',
      duration: 'suggested duration',
      frequency: 'suggested frequency',
    },
    channels: ['email', 'in-app'],
  };
};
```

---

## 10. UI/UX Design

### 10.1 Hub Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Programs & Events Hub                                    [+ New ▼] [🔔] [⚙]│
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐                       │
│  │Programs │ Events  │Campaigns│Calendar │AI Stats │                       │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Quick Stats Bar                                                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │Active   │ │Upcoming │ │Total    │ │Open     │ │Pending  │       │   │
│  │  │Programs │ │Events   │ │Attendees│ │Campaigns│ │Reviews  │       │   │
│  │  │   12    │ │    8    │ │  1,247  │ │    3    │ │   45    │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────┐ ┌─────────────────────────────────────────┐   │
│  │ Filters                 │ │ Content Area (tab-specific)             │   │
│  │ ───────                 │ │                                         │   │
│  │ Status: [All ▼]         │ │ ┌───────────────┐ ┌───────────────┐    │   │
│  │ Type: [All ▼]           │ │ │ Program Card  │ │ Program Card  │    │   │
│  │ Sector: [All ▼]         │ │ │               │ │               │    │   │
│  │ Date: [Range]           │ │ └───────────────┘ └───────────────┘    │   │
│  │                         │ │                                         │   │
│  │ [Clear Filters]         │ │ ┌───────────────┐ ┌───────────────┐    │   │
│  │                         │ │ │ Program Card  │ │ Program Card  │    │   │
│  │ ───────                 │ │ │               │ │               │    │   │
│  │ Quick Actions           │ │ └───────────────┘ └───────────────┘    │   │
│  │ • Create Program        │ │                                         │   │
│  │ • Create Event          │ │                                         │   │
│  │ • Launch Campaign       │ │                                         │   │
│  └─────────────────────────┘ └─────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Event Creation Flow

```
Step 1: Basic Info          Step 2: Schedule           Step 3: Settings
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│ Title *         │        │ Date *          │        │ Registration    │
│ [____________]  │        │ [📅 Select]     │        │ [✓] Required    │
│                 │        │                 │        │                 │
│ Description *   │        │ Start Time *    │        │ Max Attendees   │
│ [____________]  │        │ [🕐 Select]     │        │ [____100____]   │
│ [____________]  │        │                 │        │                 │
│ [____________]  │        │ End Time *      │        │ Deadline        │
│                 │        │ [🕐 Select]     │        │ [📅 Select]     │
│ Event Type *    │        │                 │        │                 │
│ [Workshop ▼]    │        │ Timezone        │        │ [✓] Waitlist    │
│                 │        │ [UTC+3 ▼]       │        │                 │
│ [🤖 AI Assist]  │        │                 │        │ Visibility      │
│                 │        │ Location Type   │        │ [✓] Public      │
│ Tags            │        │ ○ Virtual       │        │ [ ] Featured    │
│ [____________]  │        │ ○ Physical      │        │                 │
│                 │        │ ○ Hybrid        │        │ Link to Program │
│ Image           │        │                 │        │ [Select... ▼]   │
│ [📤 Upload]     │        │ [AI Suggest]    │        │                 │
└─────────────────┘        └─────────────────┘        └─────────────────┘
        │                          │                          │
        ▼                          ▼                          ▼
   [← Back]                   [← Back]                   [← Back]
   [Next →]                   [Next →]                   [Create Event]
```

### 10.3 Calendar View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  December 2025                                    [Month][Week][Day][Agenda]│
├─────────────────────────────────────────────────────────────────────────────┤
│  Sun    Mon    Tue    Wed    Thu    Fri    Sat                             │
├─────────────────────────────────────────────────────────────────────────────┤
│   1      2      3      4      5      6      7                              │
│        ┌────┐                      ┌────┐                                  │
│        │🔵  │                      │🟢  │                                  │
│        │Wksp│                      │Demo│                                  │
│        └────┘                      └────┘                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│   8      9     10     11     12     13     14                              │
│        ┌────┐        ┌────┐                                                │
│        │🟠  │        │🔴  │ ← Conflict                                     │
│        │Conf│        │⚠️  │   indicator                                    │
│        └────┘        └────┘                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Legend: 🔵 Workshop  🟢 Demo  🟠 Conference  🔴 Conflict                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. API Specifications

### 11.1 Event APIs

```typescript
// Event CRUD Operations

// Create Event
POST /events
Body: EventCreateDTO
Response: Event

// Update Event
PUT /events/:id
Body: EventUpdateDTO
Response: Event

// Cancel Event
POST /events/:id/cancel
Body: { reason: string, notifyRegistrants: boolean }
Response: { success: boolean }

// Get Event with Registrations
GET /events/:id?include=registrations
Response: Event & { registrations: Registration[] }

// Register for Event
POST /events/:id/register
Body: { user_email: string, notes?: string }
Response: Registration

// Cancel Registration
DELETE /events/:id/register
Response: { success: boolean }
```

### 11.2 Program-Event Sync API

```typescript
// Sync Program Events
POST /programs/:id/sync-events
Response: { synced: number, created: number, updated: number }

// Get Program with Events
GET /programs/:id?include=events
Response: Program & { events: Event[] }
```

---

## 12. Security Considerations

### 12.1 RLS Policies

```sql
-- Events RLS (similar pattern to programs)

-- Public can view published, non-cancelled events
CREATE POLICY "Public can view published events"
ON events FOR SELECT
USING (is_public = true AND is_cancelled = false);

-- Staff can view events in their scope
CREATE POLICY "Staff can view scoped events"
ON events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND (
      ur.role = 'admin'
      OR ur.municipality_id = events.municipality_id
      OR (ur.role IN ('deputyship_admin', 'deputyship_staff') 
          AND events.sector_id IN (SELECT unnest(focus_sectors) FROM municipalities WHERE id = ur.municipality_id))
    )
  )
);

-- Organizers can manage their events
CREATE POLICY "Organizers can manage events"
ON events FOR ALL
USING (
  organizer_id = auth.uid() 
  OR created_by_email = (SELECT user_email FROM user_profiles WHERE user_id = auth.uid())
);
```

### 12.2 Input Validation

```javascript
// Zod schemas for validation

const eventCreateSchema = z.object({
  title_en: z.string().min(5).max(200),
  title_ar: z.string().max(200).optional(),
  description_en: z.string().min(20).max(5000),
  event_type: z.enum(['webinar', 'workshop', 'conference', ...]),
  event_date: z.string().datetime(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  location_type: z.enum(['virtual', 'physical', 'hybrid']),
  max_attendees: z.number().min(1).max(10000).optional(),
  // ...
});
```

---

## 13. Migration Strategy

### 13.1 Phase 1: Core Event CRUD (Week 1-2)

```
Day 1-2: Create missing UI components
├── EventCreate.jsx
├── EventEdit.jsx
├── EventCreateForm.jsx
└── EventCancelDialog.jsx

Day 3-4: Wire email triggers
├── event.created → EventCreate
├── event.updated → EventEdit
└── event.cancelled → EventCancelDialog

Day 5: Add permissions
├── event_create
├── event_edit
├── event_delete
└── event_manage

Day 6-7: Testing & fixes
```

### 13.2 Phase 2: Synchronization (Week 3)

```
Day 1-2: Create EventSyncService
├── syncEventFromProgram()
├── syncProgramFromEvent()
└── bidirectionalSync()

Day 3-4: Update CampaignPlanner
├── Auto-sync on event add
├── Sync indicator UI
└── Conflict detection

Day 5: Testing sync
```

### 13.3 Phase 3: Hub Consolidation (Week 4)

```
Day 1-2: Create hub components
├── ProgramsEventsHub.jsx
├── HubTabs.jsx
└── HubStats.jsx

Day 3: Update routing & menus

Day 4-5: Testing & polish
```

### 13.4 Phase 4: AI Enhancements (Week 5)

```
Day 1-2: AI components
├── AIEventOptimizer.jsx
├── AIAttendancePredictor.jsx
└── AIConflictDetector.jsx

Day 3-4: Integration & testing

Day 5: Documentation & cleanup
```

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Program** | A structured initiative with applications, participants, and outcomes |
| **Event** | A scheduled occurrence (webinar, workshop, etc.) |
| **Campaign** | A coordinated communication effort |
| **Hub** | The unified management interface |
| **Sync** | Bidirectional data synchronization between systems |
| **Visibility** | Access rules based on user role and geography |

## Appendix B: References

- Existing Files: `src/pages/Programs.jsx`, `src/components/events/EventCalendar.jsx`
- Database Schema: `events`, `programs`, `event_registrations`, `program_applications`
- Email System: `email_triggers`, `email_templates`, `email_logs`
- Permissions: `permissions`, `role_permissions`, `user_roles`

---

**Document Status:** Draft  
**Next Review:** After Phase 1 completion  
**Owner:** Development Team

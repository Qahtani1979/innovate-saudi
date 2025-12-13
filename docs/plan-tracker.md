# Programs & Events Hub - Implementation Plan Tracker

**Project:** Programs & Events Hub  
**Last Audit:** 2025-12-13  
**Target Completion:** 5 Weeks  
**Status:** 🟡 Planning (Deep Review Complete)  

---

## Executive Summary

This document tracks the implementation of the Programs & Events Hub. A comprehensive codebase audit has been completed, identifying 14 program pages, 4 event pages, 37 program components, and critical gaps including missing Event CRUD pages and event-program synchronization.

---

## Current State Summary

### What Exists ✅

| Category | Count | Status |
|----------|-------|--------|
| Program Pages | 14 | Complete |
| Event Pages | 4 | Partial |
| Program Components | 37 | Complete |
| Event Components | 1 | Critical Gap |
| Program Workflows | 7 | Complete |
| AI Components (Programs) | 8 | Complete |
| Email Templates (Events) | 6 | Exist but unwired |

### Critical Gaps ❌

| Gap | Impact | Priority |
|-----|--------|----------|
| `EventCreate.jsx` missing | Cannot create events via UI | 🔴 Critical |
| `EventEdit.jsx` missing | Cannot edit events via UI | 🔴 Critical |
| No `/src/components/events/` folder | No event UI components | 🔴 Critical |
| `CampaignPlanner.jsx` → `events` table sync | Events not visible in calendar | 🔴 Critical |
| `CalendarView.jsx` doesn't read events table | Events not shown on calendar | 🟡 High |
| Event email triggers unwired | No event.created/updated emails | 🟡 High |
| Event permissions not in DB | Cannot control event access | 🟡 High |

---

## Phase Overview

| Phase | Name | Duration | Status | Progress |
|-------|------|----------|--------|----------|
| 1 | Core Event CRUD | 2 weeks | 🔴 Not Started | 0% |
| 2 | Synchronization Service | 1 week | 🔴 Not Started | 0% |
| 3 | Hub Consolidation | 1 week | 🔴 Not Started | 0% |
| 4 | AI Enhancements | 1 week | 🔴 Not Started | 0% |

**Legend:** 🔴 Not Started | 🟡 In Progress | 🟢 Complete | ⚫ Blocked

---

## Phase 1: Core Event CRUD

**Objective:** Create missing event management UI and wire email triggers

### 1.1 New Folder Structure

```
src/components/events/         # CREATE THIS FOLDER
├── EventCard.jsx              # Event display card
├── EventFilters.jsx           # Filter component
├── EventCreateForm.jsx        # Reusable create form
├── EventEditForm.jsx          # Reusable edit form  
├── EventCancelDialog.jsx      # Cancellation dialog
└── EventAttendeeList.jsx      # Attendee management
```

### 1.2 New Pages

| Task | File | Lines Est. | Status | Notes |
|------|------|------------|--------|-------|
| Create EventCreate page | `src/pages/EventCreate.jsx` | ~400 | 🔴 | Multi-step form, AI assist |
| Create EventEdit page | `src/pages/EventEdit.jsx` | ~350 | 🔴 | Pre-populated, version track |

### 1.3 New Components

| Task | File | Status | Priority |
|------|------|--------|----------|
| EventCard | `src/components/events/EventCard.jsx` | 🔴 | High |
| EventFilters | `src/components/events/EventFilters.jsx` | 🔴 | High |
| EventCreateForm | `src/components/events/EventCreateForm.jsx` | 🔴 | Critical |
| EventEditForm | `src/components/events/EventEditForm.jsx` | 🔴 | Critical |
| EventCancelDialog | `src/components/events/EventCancelDialog.jsx` | 🔴 | High |
| EventAttendeeList | `src/components/events/EventAttendeeList.jsx` | 🔴 | Medium |

### 1.4 New Hooks

| Task | File | Status | Purpose |
|------|------|--------|---------|
| useEvents | `src/hooks/useEvents.js` | 🔴 | Event CRUD operations |
| useEventRegistrations | `src/hooks/useEventRegistrations.js` | 🔴 | Registration management |
| useEventsWithVisibility | `src/hooks/useEventsWithVisibility.js` | 🔴 | Visibility-scoped fetch |

### 1.5 Email Trigger Wiring

| Trigger | Where to Wire | Status | Notes |
|---------|---------------|--------|-------|
| `event.created` | EventCreate.jsx → on submit | 🔴 | Notify organizer + admins |
| `event.updated` | EventEdit.jsx → on save | 🔴 | Notify registrants |
| `event.cancelled` | EventCancelDialog.jsx → on confirm | 🔴 | Notify all registrants |
| `event.reminder` | Edge function (scheduled) | 🔴 | 24h before event |

### 1.6 Database Permissions

```sql
-- Add these permissions
INSERT INTO permissions (code, name, description, module, category) VALUES
  ('event_create', 'Create Events', 'Create new events', 'events', 'manage'),
  ('event_edit', 'Edit Events', 'Edit own or assigned events', 'events', 'manage'),
  ('event_delete', 'Delete Events', 'Delete or cancel events', 'events', 'manage'),
  ('event_manage', 'Manage Events', 'Full event management', 'events', 'manage');

-- Assign to roles (examples)
-- Admin: all event permissions
-- Municipality Admin: event_create, event_edit, event_delete (own)
-- Municipality Coordinator: event_create, event_edit (own)
```

### 1.7 Existing Page Updates

| Page | Changes Needed | Status |
|------|----------------|--------|
| `EventCalendar.jsx` | Add "Create Event" button (line ~91 exists but routes to detail) | 🔴 |
| `EventDetail.jsx` | Add Edit button, Cancel button, link to EventEdit | 🔴 |
| `CalendarView.jsx` | Add events table to data sources (currently only pilots, programs, assignments) | 🔴 |

### 1.8 Route Updates

| Route | Component | Status |
|-------|-----------|--------|
| `/events/create` | EventCreate.jsx | 🔴 Add |
| `/events/:id/edit` | EventEdit.jsx | 🔴 Add |

---

## Phase 2: Synchronization Service

**Objective:** Sync events between CampaignPlanner and events table

### 2.1 Core Service

| Task | File | Status | Notes |
|------|------|--------|-------|
| Create EventSyncService | `src/services/eventSyncService.js` | 🔴 | Core sync logic |

### 2.2 Sync Logic

```javascript
// eventSyncService.js
export const eventSyncService = {
  // Sync from program.events[] to events table
  syncEventToTable: async (programId, eventData) => {
    if (eventData.sync_id) {
      // Update existing
      await supabase.from('events').update({...}).eq('id', eventData.sync_id);
    } else {
      // Create new and get sync_id
      const { data } = await supabase.from('events').insert({
        program_id: programId,
        title_en: eventData.name,
        event_date: eventData.date,
        location: eventData.location,
        event_type: eventData.type,
        // ... map other fields
      }).select().single();
      return data.id; // Return sync_id
    }
  },
  
  // Sync from events table back to program.events[]
  syncEventToProgram: async (eventId, programId) => {
    // Read event, update program.events[] with changes
  },
  
  // Bulk sync all program events
  syncAllProgramEvents: async (programId) => {
    // Get program.events[], sync each to table
  }
};
```

### 2.3 CampaignPlanner Updates

| Task | Location | Status |
|------|----------|--------|
| Import eventSyncService | Top of file | 🔴 |
| Call sync on event add | `setCampaignData` for events | 🔴 |
| Call sync on event edit | Event edit handler | 🔴 |
| Call sync on event delete | Event delete handler | 🔴 |
| Add sync status indicator | UI near events section | 🔴 |
| Add manual sync button | Events section header | 🔴 |

### 2.4 Schema Updates (Optional)

```sql
-- Add sync tracking to programs.events[] items
-- Each item should have: { ..., sync_id: uuid, synced_at: timestamp }

-- Add source tracking to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS program_synced boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS program_sync_source text; -- 'campaign_planner' | 'direct'
```

---

## Phase 3: Hub Consolidation

**Objective:** Create unified Programs & Events Hub

### 3.1 Hub Components

| Task | File | Status | Notes |
|------|------|--------|-------|
| ProgramsEventsHub | `src/components/hub/ProgramsEventsHub.jsx` | 🔴 | Main tab container |
| HubTabs | `src/components/hub/HubTabs.jsx` | 🔴 | Tab navigation |
| HubStats | `src/components/hub/HubStats.jsx` | 🔴 | Unified statistics |
| QuickActions | `src/components/hub/QuickActions.jsx` | 🔴 | Common actions |

### 3.2 Tab Structure

| Tab | Content Source | Status |
|-----|----------------|--------|
| Programs | Current Programs.jsx listing | 🔴 |
| Events | EventCalendar.jsx content | 🔴 |
| Campaigns | CampaignPlanner.jsx content | 🔴 |
| Calendar | CalendarView.jsx content | 🔴 |
| AI Analytics | New AI dashboard | 🔴 |

### 3.3 Programs.jsx Refactor

```jsx
// Current: Programs.jsx is standalone page
// New: Programs.jsx becomes hub container with tabs

// Option A: Query param based tabs
// /programs?tab=programs (default)
// /programs?tab=events
// /programs?tab=calendar
// /programs?tab=campaigns

// Option B: Nested routes
// /programs (redirects to /programs/all)
// /programs/all
// /programs/events
// /programs/calendar
// /programs/campaigns
```

### 3.4 Navigation Updates

| File | Changes | Status |
|------|---------|--------|
| `src/config/sidebarMenus.js` | Add submenu for Programs & Events | 🔴 |
| `App.jsx` | Add routes for /events/create, /events/:id/edit | 🔴 |

---

## Phase 4: AI Enhancements

**Objective:** Add AI-powered event features

### 4.1 AI Components

| Task | File | Status | Purpose |
|------|------|--------|---------|
| AIEventOptimizer | `src/components/ai/AIEventOptimizer.jsx` | 🔴 | Timing + description |
| AIAttendancePredictor | `src/components/ai/AIAttendancePredictor.jsx` | 🔴 | Attendance forecast |
| AIConflictDetector | `src/components/ai/AIConflictDetector.jsx` | 🔴 | Scheduling conflicts |

### 4.2 AI Features Detail

#### AIEventOptimizer
```jsx
// Features:
// 1. Suggest optimal date/time based on:
//    - Target audience availability patterns
//    - Competing events
//    - Historical attendance data
// 2. Generate bilingual descriptions
// 3. Suggest relevant tags
// 4. Recommend event type based on objectives

// Integration: EventCreate.jsx, EventEdit.jsx
```

#### AIAttendancePredictor
```jsx
// Features:
// 1. Predict attendance count based on:
//    - Event type
//    - Historical data
//    - Registration trends
//    - Similar events
// 2. Recommend capacity adjustments

// Integration: EventDetail.jsx, EventEdit.jsx
```

#### AIConflictDetector
```jsx
// Features:
// 1. Detect scheduling conflicts with:
//    - Other events
//    - Program sessions
//    - Pilot milestones
//    - Expert assignments
// 2. Suggest alternative times

// Integration: EventCreate.jsx, CalendarView.jsx
```

---

## Integration Checklist

### System Integrations

| System | Integration Point | Status | Notes |
|--------|------------------|--------|-------|
| Challenges | programs.linked_challenge_ids | ✅ Exists | Working |
| Pilots | programs.linked_pilot_ids | ✅ Exists | Working |
| Solutions | programs.linked_solution_ids | ✅ Exists | Working |
| Providers | program_applications.provider_id | ✅ Exists | Working |
| Municipalities | program/event.municipality_id | ✅ Exists | Working |
| Sectors | program/event.sector_id | ✅ Exists | Working |
| Email System | useEmailTrigger hook | ✅ Available | Need to wire events |
| Notifications | Notification entity | ✅ Available | Need to wire events |
| Activity Logs | system_activities table | ✅ Available | Used in ProgramEdit |
| Visibility System | useVisibilitySystem hook | ✅ Available | Need events version |

### Permission Integration

| Role | Programs | Events | Campaigns |
|------|----------|--------|-----------|
| Admin | Full ✅ | Full 🔴 | Full ✅ |
| Deputyship Admin | Sector ✅ | Sector 🔴 | Sector ✅ |
| Deputyship Staff | Sector View ✅ | Sector View 🔴 | View ✅ |
| Municipality Admin | Own ✅ | Own 🔴 | Own ✅ |
| Municipality Staff | Own View ✅ | Own View 🔴 | View ✅ |
| Municipality Coordinator | Own View ✅ | Own 🔴 | View ✅ |
| Provider | View/Apply ✅ | View/Register ⚠️ | View ✅ |
| Citizen | Public ✅ | Public ⚠️ | N/A |

---

## File Changes Summary

### New Files (22 total)

```
src/
├── pages/
│   ├── EventCreate.jsx                  # NEW (Critical)
│   └── EventEdit.jsx                    # NEW (Critical)
│
├── components/
│   ├── events/                          # NEW FOLDER
│   │   ├── EventCard.jsx                # NEW
│   │   ├── EventFilters.jsx             # NEW
│   │   ├── EventCreateForm.jsx          # NEW
│   │   ├── EventEditForm.jsx            # NEW
│   │   ├── EventCancelDialog.jsx        # NEW
│   │   └── EventAttendeeList.jsx        # NEW
│   │
│   ├── hub/                             # NEW FOLDER
│   │   ├── ProgramsEventsHub.jsx        # NEW
│   │   ├── HubTabs.jsx                  # NEW
│   │   ├── HubStats.jsx                 # NEW
│   │   └── QuickActions.jsx             # NEW
│   │
│   └── ai/
│       ├── AIEventOptimizer.jsx         # NEW
│       ├── AIAttendancePredictor.jsx    # NEW
│       └── AIConflictDetector.jsx       # NEW
│
├── hooks/
│   ├── useEvents.js                     # NEW
│   ├── useEventRegistrations.js         # NEW
│   └── useEventsWithVisibility.js       # NEW
│
└── services/
    └── eventSyncService.js              # NEW
```

### Modified Files (8 total)

```
src/
├── pages/
│   ├── Programs.jsx                     # Refactor to hub
│   ├── EventCalendar.jsx                # Add create button
│   ├── EventDetail.jsx                  # Add edit/cancel
│   ├── CalendarView.jsx                 # Add events table source
│   └── CampaignPlanner.jsx              # Add sync service
│
├── config/
│   └── sidebarMenus.js                  # Update navigation
│
└── App.jsx                              # Add routes
```

### Database Changes

```sql
-- Permissions to add (migration)
INSERT INTO permissions (code, name, description, module, category) VALUES
  ('event_create', 'Create Events', 'Create new events', 'events', 'manage'),
  ('event_edit', 'Edit Events', 'Edit own or assigned events', 'events', 'manage'),
  ('event_delete', 'Delete Events', 'Delete or cancel events', 'events', 'manage'),
  ('event_manage', 'Manage Events', 'Full event management', 'events', 'manage'),
  ('campaign_create', 'Create Campaigns', 'Create new campaigns', 'campaigns', 'manage'),
  ('campaign_manage', 'Manage Campaigns', 'Full campaign management', 'campaigns', 'manage');

-- Role-permission assignments (add per role based on matrix above)
```

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation | Status |
|------|--------|------------|------------|--------|
| Sync conflicts between program.events and events table | High | Medium | Implement conflict resolution, sync_id tracking | 🔴 |
| Permission complexity | Medium | Medium | Reuse existing visibility patterns | 🔴 |
| Breaking existing CampaignPlanner | High | Low | Incremental changes, feature flags | 🔴 |
| CalendarView performance with more data | Medium | Low | Implement pagination, virtualization | 🔴 |
| Email trigger reliability | High | Low | Add retry logic, logging, monitoring | 🔴 |
| ProgramDetail.jsx is 1215 lines | Medium | Low | Consider refactoring into sub-components | 🔴 |

---

## Dependencies

### External (All Installed ✅)

| Dependency | Version | Purpose |
|------------|---------|---------|
| @tanstack/react-query | ^5.84.1 | Data fetching |
| date-fns | ^3.6.0 | Date handling |
| react-day-picker | ^8.10.1 | Calendar picker |
| lucide-react | ^0.475.0 | Icons |
| sonner | ^2.0.1 | Toast notifications |
| framer-motion | ^11.16.4 | Animations |

### Internal (All Available ✅)

| Dependency | File | Purpose |
|------------|------|---------|
| useVisibilitySystem | hook | Scope management |
| usePermissions | hook | Permission checks |
| useEmailTrigger | hook | Email delivery |
| ProtectedPage | HOC | Page protection |
| useAIWithFallback | hook | AI integration |
| PageLayout | component | Page layout |
| CitizenPageLayout | component | Citizen pages |

---

## Testing Checklist

### Unit Tests

| Component | Test | Status |
|-----------|------|--------|
| EventCreateForm | Form validation | 🔴 |
| EventSyncService | Sync logic | 🔴 |
| useEvents | CRUD operations | 🔴 |
| useEventsWithVisibility | Visibility filtering | 🔴 |

### Integration Tests

| Flow | Test | Status |
|------|------|--------|
| Create Event → View in Calendar | End-to-end | 🔴 |
| Edit Event → Notify Registrants | End-to-end | 🔴 |
| Cancel Event → Notify All | End-to-end | 🔴 |
| Register for Event → Confirmation Email | End-to-end | ✅ Works |
| CampaignPlanner Event → Sync to Table | End-to-end | 🔴 |

### User Acceptance Tests

| Scenario | Persona | Status |
|----------|---------|--------|
| Create event as Municipality Admin | Staff | 🔴 |
| Register for event as Provider | Provider | 🔴 |
| View calendar as Citizen | Citizen | 🔴 |
| Manage campaign as Deputyship | Staff | 🔴 |
| View synced events | Admin | 🔴 |

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Event creation rate | +50% | N/A (no create UI) | 🔴 |
| Registration conversion | >60% | Unknown | 🔴 |
| Calendar usage | +30% | Unknown | 🔴 |
| Time to create event | <5 min | N/A | 🔴 |
| Sync accuracy | >99% | N/A | 🔴 |
| Email delivery rate | >95% | Unknown | 🔴 |

---

## Weekly Progress Log

### Week 0 (Planning)

**Date:** 2025-12-13  
**Status:** ✅ Complete

**Completed:**
- Deep codebase audit
- Identified 14 program pages, 4 event pages
- Documented 37 program components
- Identified critical gaps (EventCreate, EventEdit, sync)
- Updated design document
- Updated plan tracker

**Blockers:**
- None

**Next Week:**
- Start Phase 1: Core Event CRUD
- Priority: EventCreate.jsx, EventCreateForm.jsx

---

### Week 1

**Date:** TBD  
**Status:** 🔴 Not Started

**Planned:**
- [ ] Create `/src/components/events/` folder
- [ ] Create EventCreateForm.jsx
- [ ] Create EventCreate.jsx page
- [ ] Add event permissions to DB
- [ ] Update App.jsx routes

---

### Week 2

**Date:** TBD  
**Status:** 🔴 Not Started

**Planned:**
- [ ] Create EventEditForm.jsx
- [ ] Create EventEdit.jsx page
- [ ] Create EventCancelDialog.jsx
- [ ] Wire email triggers
- [ ] Update EventDetail.jsx with edit/cancel buttons
- [ ] Create useEvents.js hook

---

### Week 3

**Date:** TBD  
**Status:** 🔴 Not Started

**Planned:**
- [ ] Create eventSyncService.js
- [ ] Update CampaignPlanner.jsx with sync
- [ ] Update CalendarView.jsx to read events table
- [ ] Create useEventsWithVisibility.js
- [ ] Test sync functionality

---

### Week 4

**Date:** TBD  
**Status:** 🔴 Not Started

**Planned:**
- [ ] Create hub components folder
- [ ] Refactor Programs.jsx to hub
- [ ] Create tab components
- [ ] Update sidebar navigation
- [ ] Integration testing

---

### Week 5

**Date:** TBD  
**Status:** 🔴 Not Started

**Planned:**
- [ ] Create AI event components
- [ ] Integrate AI into forms
- [ ] Final testing
- [ ] Documentation update
- [ ] Deployment

---

## Appendix

### A. Related Documents

- [Programs & Events Design Document](./programs-events-design.md)
- Database Schema (types.ts)
- Email Templates Reference
- Permission System Guide

### B. Key Files Reference

| File | Lines | Location | Notes |
|------|-------|----------|-------|
| Programs.jsx | 692 | src/pages/ | Main listing, needs hub refactor |
| ProgramDetail.jsx | 1,215 | src/pages/ | Very complex, 12+ tabs |
| CampaignPlanner.jsx | 699 | src/pages/ | Campaign wizard, has events[] |
| ProgramEdit.jsx | 592 | src/pages/ | AI enhance, auto-save |
| ParticipantDashboard.jsx | 280 | src/pages/ | Participant progress |
| EventRegistration.jsx | 221 | src/pages/ | Registration with email |
| CalendarView.jsx | 210 | src/pages/ | Multi-source calendar |
| MyPrograms.jsx | 199 | src/pages/ | User's programs |
| EventDetail.jsx | 194 | src/pages/ | Event view |
| EventCalendar.jsx | 187 | src/pages/ | Event listing |
| useProgramsWithVisibility.js | 164 | src/hooks/ | Visibility hook pattern |

### C. Existing AI Components (Reference)

| Component | Location | Hook Used |
|-----------|----------|-----------|
| AICurriculumGenerator | programs/ | useAIWithFallback |
| AIDropoutPredictor | programs/ | useState (mock) |
| AICohortOptimizerWidget | programs/ | useAIWithFallback |
| AIAlumniSuggester | programs/ | useAIWithFallback |
| AIProgramSuccessPredictor | programs/ | useAIWithFallback |
| AIProgramBenchmarking | programs/ | useAIWithFallback |
| CampaignAIHelpers | communications/ | useAIWithFallback |

---

**Document Status:** Comprehensive Audit Complete  
**Last Updated:** 2025-12-13  
**Next Review:** After Phase 1 Completion

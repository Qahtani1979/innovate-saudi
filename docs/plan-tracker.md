# Programs & Events Hub - Implementation Plan Tracker

**Project:** Programs & Events Hub  
**Start Date:** TBD  
**Target Completion:** 5 Weeks  
**Status:** 🟡 Planning  

---

## Executive Summary

This document tracks the implementation of the Programs & Events Hub, consolidating program management, event handling, campaigns, and calendar functionality into a unified interface with AI capabilities.

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

### 1.1 New Components

| Task | File | Status | Assignee | Notes |
|------|------|--------|----------|-------|
| Create EventCreate page | `src/pages/events/EventCreate.jsx` | 🔴 | - | Multi-step form |
| Create EventEdit page | `src/pages/events/EventEdit.jsx` | 🔴 | - | Pre-populated form |
| Create EventCreateForm | `src/components/events/EventCreateForm.jsx` | 🔴 | - | Reusable form |
| Create EventEditForm | `src/components/events/EventEditForm.jsx` | 🔴 | - | Edit variant |
| Create EventCancelDialog | `src/components/events/EventCancelDialog.jsx` | 🔴 | - | Confirmation + reason |
| Create EventAttendeeList | `src/components/events/EventAttendeeList.jsx` | 🔴 | - | Registrant management |
| Create EventCard | `src/components/events/EventCard.jsx` | 🔴 | - | Grid display |
| Create EventFilters | `src/components/events/EventFilters.jsx` | 🔴 | - | Filter UI |

### 1.2 Hooks

| Task | File | Status | Notes |
|------|------|--------|-------|
| Create useEvents hook | `src/hooks/events/useEvents.js` | 🔴 | CRUD operations |
| Create useEventRegistrations | `src/hooks/events/useEventRegistrations.js` | 🔴 | Registration management |
| Create useEventsWithVisibility | `src/hooks/events/useEventsWithVisibility.js` | 🔴 | Visibility-scoped fetch |

### 1.3 Email Trigger Integration

| Trigger | Component | Status | Notes |
|---------|-----------|--------|-------|
| `event.created` | EventCreate.jsx | 🔴 | On publish |
| `event.updated` | EventEdit.jsx | 🔴 | Notify registrants |
| `event.cancelled` | EventCancelDialog.jsx | 🔴 | Notify all |
| `event.registration_confirmed` | EventRegistration.jsx | 🟢 | Already wired |
| `event.reminder` | Scheduled job | 🔴 | 24h before event |

### 1.4 Permissions

| Permission | Description | Status |
|------------|-------------|--------|
| `event_create` | Create new events | 🔴 |
| `event_edit` | Edit own/assigned events | 🔴 |
| `event_delete` | Delete/cancel events | 🔴 |
| `event_manage` | Full event management | 🔴 |

### 1.5 Route Updates

| Route | Component | Status |
|-------|-----------|--------|
| `/events/create` | EventCreate.jsx | 🔴 |
| `/events/:id/edit` | EventEdit.jsx | 🔴 |

### 1.6 Existing Component Updates

| Component | Changes | Status |
|-----------|---------|--------|
| EventDetail.jsx | Add edit/cancel buttons | 🔴 |
| EventCalendar.jsx | Add create button, improve filters | 🔴 |
| sidebarMenus.js | Add event create link | 🔴 |

---

## Phase 2: Synchronization Service

**Objective:** Sync events between CampaignPlanner and events table

### 2.1 Service Creation

| Task | File | Status | Notes |
|------|------|--------|-------|
| Create EventSyncService | `src/services/eventSyncService.js` | 🔴 | Core sync logic |
| Sync from program to event | Function | 🔴 | Program.events[] → events table |
| Sync from event to program | Function | 🔴 | events table → Program.events[] |
| Conflict resolution | Logic | 🔴 | Handle merge conflicts |

### 2.2 CampaignPlanner Updates

| Task | Status | Notes |
|------|--------|-------|
| Add sync on event add | 🔴 | Auto-create in events table |
| Add sync on event edit | 🔴 | Auto-update in events table |
| Add sync on event delete | 🔴 | Soft delete in events table |
| Add sync status indicator | 🔴 | Show sync state |
| Add manual sync button | 🔴 | Force sync option |

### 2.3 Database Considerations

| Task | Status | Notes |
|------|--------|-------|
| Add sync_id to program.events[] | 🔴 | Track linked event |
| Add program_synced flag to events | 🔴 | Track source |

---

## Phase 3: Hub Consolidation

**Objective:** Create unified Programs & Events Hub

### 3.1 Hub Components

| Task | File | Status | Notes |
|------|------|--------|-------|
| Create ProgramsEventsHub | `src/components/hub/ProgramsEventsHub.jsx` | 🔴 | Main container |
| Create HubTabs | `src/components/hub/HubTabs.jsx` | 🔴 | Tab navigation |
| Create HubStats | `src/components/hub/HubStats.jsx` | 🔴 | Unified stats |
| Create QuickActions | `src/components/hub/QuickActions.jsx` | 🔴 | Common actions |

### 3.2 Tab Structure

| Tab | Content | Status |
|-----|---------|--------|
| Programs | Program listing + management | 🔴 |
| Events | Event listing + management | 🔴 |
| Campaigns | Campaign management | 🔴 |
| Calendar | Unified calendar view | 🔴 |
| AI Analytics | AI insights dashboard | 🔴 |

### 3.3 Navigation Updates

| Task | Status | Notes |
|------|--------|-------|
| Update Programs.jsx | 🔴 | Refactor to hub |
| Update sidebarMenus.js | 🔴 | New structure |
| Update App.jsx routes | 🔴 | Hub routing |
| Add breadcrumbs | 🔴 | Navigation context |

---

## Phase 4: AI Enhancements

**Objective:** Add AI-powered features

### 4.1 AI Components

| Task | File | Status | Notes |
|------|------|--------|-------|
| Create AIEventOptimizer | `src/components/ai/AIEventOptimizer.jsx` | 🔴 | Timing + description |
| Create AIAttendancePredictor | `src/components/ai/AIAttendancePredictor.jsx` | 🔴 | Attendance forecast |
| Create AIConflictDetector | `src/components/ai/AIConflictDetector.jsx` | 🔴 | Scheduling conflicts |
| Create AICampaignSuggester | `src/components/ai/AICampaignSuggester.jsx` | 🔴 | Campaign recommendations |

### 4.2 AI Features

| Feature | Description | Status |
|---------|-------------|--------|
| Optimal Timing | Suggest best event times | 🔴 |
| Description Generator | AI-generated descriptions | 🔴 |
| Attendance Predictor | Forecast attendance | 🔴 |
| Conflict Detection | Identify scheduling issues | 🔴 |
| Campaign Optimizer | A/B test suggestions | 🔴 |

### 4.3 Edge Functions

| Function | Purpose | Status |
|----------|---------|--------|
| `ai-event-optimizer` | Event optimization | 🔴 |
| `ai-attendance-predict` | Attendance prediction | 🔴 |

---

## Integration Checklist

### System Integrations

| System | Integration Point | Status | Notes |
|--------|------------------|--------|-------|
| Challenges | Link programs to challenges | 🟢 | Existing |
| Pilots | Program graduation path | 🟡 | Partial |
| Solutions | Link solutions to programs | 🟢 | Existing |
| Providers | Application system | 🟢 | Existing |
| Municipalities | Geographic scoping | 🟢 | Existing |
| Sectors | Sectoral scoping | 🟢 | Existing |
| Email System | Trigger integration | 🟡 | Partial |
| Notifications | In-app alerts | 🟡 | Partial |
| Activity Logs | Audit trail | 🟢 | Existing |

### Permission Integration

| Role | Programs | Events | Campaigns | Status |
|------|----------|--------|-----------|--------|
| Admin | Full | Full | Full | 🔴 |
| Deputyship Admin | Sector | Sector | Sector | 🔴 |
| Deputyship Staff | Sector View | Sector View | View | 🔴 |
| Municipality Admin | Own | Own | Own | 🔴 |
| Municipality Staff | Own View | Own View | View | 🔴 |
| Provider | View/Apply | View/Register | View | 🔴 |
| Citizen | Public | Public | - | 🔴 |

### Menu Integration

| Menu | Item | Route | Status |
|------|------|-------|--------|
| Main Sidebar | Programs & Events | `/programs` | 🟡 |
| Programs Submenu | All Programs | `/programs?tab=programs` | 🔴 |
| Programs Submenu | All Events | `/programs?tab=events` | 🔴 |
| Programs Submenu | Calendar | `/programs?tab=calendar` | 🔴 |
| Programs Submenu | Create Program | `/programs/create` | 🟢 |
| Programs Submenu | Create Event | `/events/create` | 🔴 |

---

## File Changes Summary

### New Files

```
src/
├── pages/
│   └── events/
│       ├── EventCreate.jsx           # NEW
│       └── EventEdit.jsx             # NEW
│
├── components/
│   ├── events/
│   │   ├── EventCard.jsx             # NEW
│   │   ├── EventFilters.jsx          # NEW
│   │   ├── EventCreateForm.jsx       # NEW
│   │   ├── EventEditForm.jsx         # NEW
│   │   ├── EventCancelDialog.jsx     # NEW
│   │   └── EventAttendeeList.jsx     # NEW
│   │
│   ├── hub/
│   │   ├── ProgramsEventsHub.jsx     # NEW
│   │   ├── HubTabs.jsx               # NEW
│   │   ├── HubStats.jsx              # NEW
│   │   └── QuickActions.jsx          # NEW
│   │
│   └── ai/
│       ├── AIEventOptimizer.jsx      # NEW
│       ├── AIAttendancePredictor.jsx # NEW
│       ├── AIConflictDetector.jsx    # NEW
│       └── AICampaignSuggester.jsx   # NEW
│
├── hooks/
│   └── events/
│       ├── useEvents.js              # NEW
│       ├── useEventRegistrations.js  # NEW
│       └── useEventsWithVisibility.js # NEW
│
└── services/
    └── eventSyncService.js           # NEW
```

### Modified Files

```
src/
├── pages/
│   └── Programs.jsx                  # Refactor to hub
│
├── components/
│   ├── events/
│   │   ├── EventCalendar.jsx         # Add create, filters
│   │   └── EventDetail.jsx           # Add edit/cancel
│   │
│   └── programs/
│       └── CampaignPlanner.jsx       # Add sync
│
├── config/
│   └── sidebarMenus.js               # Update structure
│
└── App.jsx                           # Add routes
```

### Database Changes

```sql
-- Permissions to add
INSERT INTO permissions (code, name, description, module, category) VALUES
  ('event_create', 'Create Events', 'Create new events', 'events', 'manage'),
  ('event_edit', 'Edit Events', 'Edit own or assigned events', 'events', 'manage'),
  ('event_delete', 'Delete Events', 'Delete or cancel events', 'events', 'manage'),
  ('event_manage', 'Manage Events', 'Full event management', 'events', 'manage'),
  ('campaign_create', 'Create Campaigns', 'Create new campaigns', 'campaigns', 'manage'),
  ('campaign_manage', 'Manage Campaigns', 'Full campaign management', 'campaigns', 'manage');

-- Role-permission assignments (to be added per role)
```

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation | Status |
|------|--------|------------|------------|--------|
| Sync conflicts between program.events and events table | High | Medium | Implement conflict resolution logic | 🔴 |
| Permission complexity | Medium | Medium | Reuse existing visibility patterns | 🔴 |
| UI consistency | Low | Low | Use existing component patterns | 🔴 |
| Performance with large event lists | Medium | Low | Implement pagination | 🔴 |
| Email trigger reliability | High | Low | Add retry logic, logging | 🔴 |

---

## Dependencies

### External Dependencies

| Dependency | Version | Purpose | Status |
|------------|---------|---------|--------|
| @tanstack/react-query | ^5.x | Data fetching | 🟢 Installed |
| date-fns | ^3.x | Date handling | 🟢 Installed |
| react-day-picker | ^8.x | Calendar | 🟢 Installed |
| lucide-react | ^0.x | Icons | 🟢 Installed |

### Internal Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| useVisibilitySystem | Scope management | 🟢 Available |
| usePermissions | Permission checks | 🟢 Available |
| send-email edge function | Email delivery | 🟢 Available |
| Email templates | Event templates | 🟢 Available |

---

## Testing Checklist

### Unit Tests

| Component | Test | Status |
|-----------|------|--------|
| EventCreateForm | Form validation | 🔴 |
| EventSyncService | Sync logic | 🔴 |
| useEvents | CRUD operations | 🔴 |

### Integration Tests

| Flow | Test | Status |
|------|------|--------|
| Create Event | End-to-end | 🔴 |
| Edit Event | End-to-end | 🔴 |
| Cancel Event | End-to-end | 🔴 |
| Register for Event | End-to-end | 🔴 |
| Sync Program Events | End-to-end | 🔴 |

### User Acceptance Tests

| Scenario | Persona | Status |
|----------|---------|--------|
| Create event as Municipality Admin | Staff | 🔴 |
| Register for event as Provider | Provider | 🔴 |
| View calendar as Citizen | Citizen | 🔴 |
| Manage campaign as Deputyship | Staff | 🔴 |

---

## Deployment Plan

### Pre-Deployment

- [ ] All tests passing
- [ ] Code review completed
- [ ] Permissions seeded
- [ ] Email templates verified
- [ ] Documentation updated

### Deployment Steps

1. Deploy database changes (permissions)
2. Deploy edge function updates
3. Deploy frontend changes
4. Verify email triggers
5. Monitor for errors

### Rollback Plan

1. Revert frontend to previous version
2. Disable new routes
3. Keep database changes (non-breaking)

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Event creation rate | +50% | - | 🔴 |
| Registration conversion | >60% | - | 🔴 |
| User satisfaction | >4.0/5 | - | 🔴 |
| Time to create event | <5 min | - | 🔴 |
| Sync accuracy | >99% | - | 🔴 |

---

## Weekly Progress Log

### Week 1

**Date:** TBD  
**Status:** Not Started  
**Completed:**
- None

**In Progress:**
- None

**Blockers:**
- None

**Next Week:**
- Start Phase 1

---

### Week 2

**Date:** TBD  
**Status:** Not Started  

---

### Week 3

**Date:** TBD  
**Status:** Not Started  

---

### Week 4

**Date:** TBD  
**Status:** Not Started  

---

### Week 5

**Date:** TBD  
**Status:** Not Started  

---

## Appendix

### A. Related Documents

- [Programs & Events Design Document](./programs-events-design.md)
- Database Schema Reference
- Email Templates Reference
- Permission System Guide

### B. Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| Product Owner | TBD | Requirements, priorities |
| Tech Lead | TBD | Architecture, reviews |
| Developer | TBD | Implementation |
| QA | TBD | Testing |

### C. Communication

- Daily standups: TBD
- Weekly reviews: TBD
- Slack channel: TBD

---

**Document Status:** Draft  
**Last Updated:** 2025-12-13  
**Next Review:** Weekly

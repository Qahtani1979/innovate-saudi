# Programs & Events - System Integration Matrix

**Last Updated:** 2025-12-13  
**Status:** Phase 9 Complete - Phase 10 In Progress (AI Components UI Integration)

---

## Executive Summary

| System | Programs | Events | Gap Level |
|--------|----------|--------|-----------|
| **Approval Workflow** | ✅ Full | ✅ Full | None |
| **Permissions (Roles)** | ✅ Full | ✅ Full | None |
| **Email Templates** | ✅ Full (8) | ✅ Full (8) | None |
| **Email Triggers (Hooks)** | ✅ Full | ✅ Full | None |
| **Notifications (In-App)** | ✅ Full | ✅ Full | None |
| **Calendar Integration** | ✅ Full | ✅ Full | None |
| **Campaign Sync** | ✅ Full | ✅ Full | None |
| **AI Components** | ✅ Full (6/6 integrated) | ⚠️ Partial (1/4 integrated) | Medium |
| **Analytics/Reporting** | ✅ Full | ⚠️ Partial | Low |
| **Budget Integration** | ✅ Full | ✅ Full | None |
| **Audit Logging** | ✅ Full | ✅ Full | None |
| **Media/Storage** | ✅ Full | ✅ Full | None |
| **Media Management** | ✅ Integrated | ✅ Integrated | None |
| **Expert & Evaluation** | ✅ Full | ✅ Full | None |
| **Search/Discovery** | ✅ Full | ✅ Full | None |
| **Comments System** | ✅ Full | ✅ Full | None |
| **Bookmarks** | ✅ Full | ✅ Full | None |
| **Realtime Updates** | ❌ Future | ❌ Future | Low |

---

## 1. APPROVAL WORKFLOW SYSTEM ✅ FULLY INTEGRATED

### Programs
| Gate | Type | SLA | Status |
|------|------|-----|--------|
| `launch_approval` | approval | 5 days | ✅ |
| `selection_approval` | approval | 7 days | ✅ |
| `mid_review` | review | 3 days | ✅ |
| `completion_review` | approval | 10 days | ✅ |

**Files:** 
- `src/components/approval/ApprovalGateConfig.jsx` (lines 509-608)
- `src/pages/ApprovalCenter.jsx`
- `src/components/programs/ProgramCreateWizard.jsx`

### Events
| Gate | Type | SLA | Status |
|------|------|-----|--------|
| `submission` | submission | 2 days | ✅ |
| `approval` | approval | 3 days | ✅ |

**Files:**
- `src/components/approval/ApprovalGateConfig.jsx` (lines 711-759)
- `src/hooks/useEvents.js` (auto-creates approval_requests)
- `src/pages/ApprovalCenter.jsx` (Events tab)

---

## 2. PERMISSIONS SYSTEM ✅ FULLY INTEGRATED

### Implementation Status

| Feature | Programs | Events | Status |
|---------|----------|--------|--------|
| usePermissions hook integration | ✅ | ✅ | Complete |
| hasPermission() checks | ✅ (3 pages) | ✅ (4 pages) | Complete |
| ProtectedPage wrapper | ✅ | ✅ | Complete |
| Role-based access | ✅ | ✅ | Complete |
| Action-based permissions | ✅ | ✅ | Complete |

### Programs Permission Implementation

| Page | usePermissions | Permission Checks | Status |
|------|----------------|-------------------|--------|
| Programs.jsx | ✅ hasPermission | `program_create`, `program_edit` | ✅ Complete |
| ProgramDetail.jsx | ✅ hasPermission | `program_edit`, `program_approve` | ✅ Complete |
| ProgramEdit.jsx | ✅ hasPermission | Edit access control | ✅ Complete |
| ApprovalCenter.jsx | ✅ Multi-permission | `program_approve` | ✅ Complete |
| ProgramOperatorPortal.jsx | ✅ ProtectedPage | `['program_manage']` | ✅ Complete |

### Events Permission Implementation

| Page | usePermissions | Permission Checks | Status |
|------|----------------|-------------------|--------|
| EventCalendar.jsx | ✅ hasAnyPermission | `['event_create', 'admin']` + role fallback | ✅ Complete |
| EventDetail.jsx | ✅ hasAnyPermission | `['event_edit', 'event_manage', 'admin']`, `['event_evaluate', 'expert_evaluate', 'admin']` | ✅ Complete |
| EventCreate.jsx | ✅ usePermissions | `municipalityId` for scoping | ✅ Complete |
| EventEdit.jsx | ✅ hasAnyPermission | `['event_manage', 'admin']` + owner check | ✅ Complete |

### Roles with Program Permissions (18 roles total)
| Role | create | edit | view | approve | manage |
|------|--------|------|------|---------|--------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Municipality Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Municipality Coordinator | ✅ | ✅ | ✅ | - | - |
| Program Manager | ✅ | ✅ | ✅ | - | ✅ |
| Program Director | ✅ | ✅ | ✅ | ✅ | ✅ |
| Program Operator | - | ✅ | ✅ | - | ✅ |
| GDISB Operations | - | - | ✅ | ✅ | - |
| GDISB Internal | ✅ | ✅ | ✅ | ✅ | ✅ |

### Roles with Event Permissions (18 roles total)
| Role | create | edit | view | approve | evaluate |
|------|--------|------|------|---------|----------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Municipality Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Municipality Coordinator | ✅ | ✅ | ✅ | ✅ | - |
| Municipality Staff | ✅ | ✅ | ✅ | - | - |
| GDISB Internal | ✅ | ✅ | ✅ | ✅ | ✅ |
| Event Manager | ✅ | ✅ | ✅ | - | - |
| Expert | - | - | ✅ | - | ✅ |
| Evaluator | - | - | ✅ | - | ✅ |

### Permission Gaps: NONE ✅

All permission checks are properly implemented:
- **Programs:** 3 pages with `hasPermission()` checks
- **Events:** 4 pages with `hasAnyPermission()` checks + role fallbacks
- **ProtectedPage wrapper:** Used on all pages
- **Owner-based access:** Implemented for edit actions

---

## 3. EMAIL SYSTEM ✅ FULLY INTEGRATED

### Email Templates - Database Status (VERIFIED 2025-12-13)

**Programs (8 templates):**
| Template Key | Name | Active | Status |
|-------------|------|--------|--------|
| `program_accepted` | Program Accepted | ✅ | ✅ |
| `program_announced` | Program Announced | ✅ | ✅ |
| `program_application_received` | Program Application Received | ✅ | ✅ |
| `program_application_reviewed` | Program Application Under Review | ✅ | ✅ |
| `program_cohort_start` | Program Cohort Starting | ✅ | ✅ |
| `program_deadline_reminder` | Program Deadline Reminder | ✅ | ✅ |
| `program_mentorship_assigned` | Mentor Assigned | ✅ | ✅ |
| `program_rejected` | Program Application Rejected | ✅ | ✅ |

**Events (7 templates):**
| Template Key | Name | Active | Status |
|-------------|------|--------|--------|
| `event_approved` | Event Approved | ✅ | ✅ |
| `event_cancelled` | Event Cancelled | ✅ | ✅ |
| `event_invitation` | Event Invitation | ✅ | ✅ |
| `event_registration_confirmed` | Event Registration Confirmed | ✅ | ✅ |
| `event_reminder` | Event Reminder | ✅ | ✅ |
| `event_submitted` | Event Submitted for Approval | ✅ | ✅ |
| `event_updated` | Event Updated | ✅ | ✅ |

**Campaign (8 templates for related notifications):**
| Template Key | Name | Active | Status |
|-------------|------|--------|--------|
| `campaign_event_invite` | Event Invitation | ✅ | ✅ |
| `campaign_announcement` | Announcement Template | ✅ | ✅ |
| `campaign_digest` | Weekly Digest | ✅ | ✅ |
| `campaign_newsletter` | Newsletter Template | ✅ | ✅ |
| ... | (4 more) | ✅ | ✅ |

### Email Triggers (Hook Implementation) ✅ COMPLETE

**usePrograms.js Triggers:**
| Trigger Key | When Called | Status |
|-------------|-------------|--------|
| `program.created` | Draft program created | ✅ Implemented |
| `program.submitted` | Program submitted for approval | ✅ Implemented |
| `program.updated` | Program data updated | ✅ Implemented |
| `program.launched` | Program launched (status → active) | ✅ Implemented |
| `program.completed` | Program completed | ✅ Implemented |
| `program.cancelled` | Program cancelled (if notifyParticipants) | ✅ Implemented |

**useEvents.js Triggers:**
| Trigger Key | When Called | Status |
|-------------|-------------|--------|
| `event.created` | Draft event created | ✅ Implemented |
| `event.submitted` | Event submitted for approval | ✅ Implemented |
| `event.updated` | Event updated (if registrants > 0) | ✅ Implemented |
| `event.cancelled` | Event cancelled (if notifyRegistrants) | ✅ Implemented |

**Email Infrastructure:**
- `src/hooks/useEmailTrigger.ts` - Unified email trigger hook
- `supabase/functions/email-trigger-hub/` - Edge function for processing triggers
- `supabase/functions/send-email/` - Edge function for sending via Resend
- `supabase/functions/event-reminder/` - Edge function for 24h event reminders

---

## 4. IN-APP NOTIFICATIONS ✅ FULLY INTEGRATED

### Implementation Status

**Files:**
- `src/components/AutoNotification.jsx` - Core notification functions
- `src/hooks/usePrograms.js` - Uses `notifyProgramEvent()`
- `src/hooks/useEvents.js` - Uses `notifyEventAction()`

### Program Notifications (notifyProgramEvent)
| Event Type | Message | Priority | Status |
|------------|---------|----------|--------|
| `created` | New program has been created | medium | ✅ |
| `submitted` | Program submitted for approval | medium | ✅ |
| `approved` | Program has been approved | high | ✅ |
| `launched` | Program has been launched and is accepting applications | high | ✅ |
| `application_received` | New application received | medium (type: task) | ✅ |
| `participant_enrolled` | Participant enrolled in program | medium | ✅ |
| `session_scheduled` | New session scheduled | medium | ✅ |
| `milestone_completed` | Program milestone completed | medium | ✅ |
| `completed` | Program has been completed | medium | ✅ |

### Event Notifications (notifyEventAction)
| Action Type | Message | Priority | Status |
|-------------|---------|----------|--------|
| `created` | New event has been created | medium | ✅ |
| `submitted` | Event submitted for approval | medium | ✅ |
| `approved` | Event has been approved | medium | ✅ |
| `published` | Event is now published | medium | ✅ |
| `registration_opened` | Registration is now open | medium | ✅ |
| `registration_closed` | Registration has closed | medium | ✅ |
| `reminder` | Event reminder: {title} is coming up | high | ✅ |
| `cancelled` | Event has been cancelled | high | ✅ |
| `completed` | Event has concluded | medium | ✅ |

### Hook Integration Status
| Hook | Uses Notifications | Triggers On | Status |
|------|-------------------|-------------|--------|
| `usePrograms.js` | ✅ `notifyProgramEvent` | created, submitted, launched, completed | ✅ Complete |
| `useEvents.js` | ✅ `notifyEventAction` | created, submitted, cancelled | ✅ Complete |

### Notification Gaps: NONE ✅

All program and event lifecycle events have corresponding in-app notifications configured.

---

## 5. CALENDAR INTEGRATION ✅ COMPLETE

### CalendarView.jsx
- ✅ Reads from `events` table
- ✅ Reads from `pilots` table
- ✅ Reads from `programs` table
- ✅ Color-coded by type

### CampaignPlanner.jsx
- ✅ Uses `eventSyncService.js`
- ✅ Auto-syncs program events to events table
- ✅ Bidirectional sync support

---

## 6. AI COMPONENTS ⚠️ PARTIAL (Programs Full, Events Partial UI Integration)

### Programs (6 AI Components) ✅ FULLY INTEGRATED
| Component | Purpose | Used In | Status |
|-----------|---------|---------|--------|
| `AICurriculumGenerator` | Generate curriculum | ProgramDetail, ProgramEdit | ✅ Integrated |
| `AIDropoutPredictor` | Predict at-risk participants | ProgramDetail (active) | ✅ Integrated |
| `AICohortOptimizerWidget` | Optimize cohort composition | ProgramDetail (selection) | ✅ Integrated |
| `AIAlumniSuggester` | Suggest alumni next steps | ProgramDetail (completed) | ✅ Integrated |
| `AIProgramBenchmarking` | Benchmark against similar | ProgramDetail | ✅ Integrated |
| `AIProgramSuccessPredictor` | Predict success rate | ProgramDetail | ✅ Integrated |

### Events (4 AI Components) ⚠️ PARTIAL UI INTEGRATION
| Component | Purpose | Used In | Status |
|-----------|---------|---------|--------|
| `AIEventOptimizer` | Optimize timing/description | **NOT USED** | ❌ Gap |
| `AIAttendancePredictor` | Predict attendance | **NOT USED** | ❌ Gap |
| `AIConflictDetector` | Detect scheduling conflicts | **NOT USED** | ❌ Gap |
| `AIProgramEventCorrelator` | Correlate program-event | ProgramsEventsHub | ✅ Integrated |

### AI Components Gap Analysis
| Gap | Where to Integrate | Priority | Effort |
|-----|-------------------|----------|--------|
| `AIEventOptimizer` not used | EventDetail, EventEdit, EventCreate | High | 0.5 day |
| `AIAttendancePredictor` not used | EventDetail | Medium | 0.5 day |
| `AIConflictDetector` not used | EventCreate, EventEdit | High | 0.5 day |

---

## 7. REMAINING GAPS

### Media Management Integration ✅ COMPLETE
**Implementation Completed:**
- ✅ MediaLibraryPicker component created
- ✅ MediaFieldWithPicker component for unified media selection
- ✅ useMediaIntegration hook for tracking
- ✅ ProgramEdit.jsx integrated with media library
- ✅ EventEdit.jsx integrated with media library
- ✅ registerUsage() auto-called on upload/select
- ✅ media_usages tracking in place

**Files Created:**
- `src/components/media/MediaLibraryPicker.jsx`
- `src/components/media/MediaFieldWithPicker.jsx`
- `src/hooks/useMediaIntegration.js`

### Audit Logging ✅ COMPLETE
**Both Programs and Events:** 
- ✅ useAuditLog.js hook with comprehensive logging
- ✅ logProgramActivity() for all program lifecycle events
- ✅ logEventActivity() for all event lifecycle events
- ✅ ProgramEventAuditLog.jsx for viewing logs
- ✅ Logs to access_logs table with detailed metadata

### Analytics/Reporting ⚠️ PARTIAL
**Programs:** ✅ Full reporting (ProgramImpactDashboard, etc.)
**Events:** ⚠️ Basic stats only (registration counts)

### Realtime Updates ❌ FUTURE
**Both Programs and Events:**
- ❌ No Supabase Realtime subscription
- ❌ No live updates in listings
- ❌ No collaborative editing support
- **Priority:** Low (future enhancement)

---

## 8. COMPLETED INTEGRATIONS (This Phase)

### ✅ COMPLETED
| Item | Implementation |
|------|----------------|
| Program email triggers | usePrograms.js - all lifecycle events |
| Event email triggers | useEvents.js - all lifecycle events |
| In-app notifications for programs | notifyProgramEvent() in AutoNotification.jsx |
| In-app notifications for events | notifyEventAction() in AutoNotification.jsx |
| Events in global search | useVisibilityAwareSearch.js |
| Budget tracking for events | budget_estimate, budget_actual columns |
| Comments for events | EventDetail.jsx with comments table |
| Bookmarks for events | EventDetail.jsx with bookmarks table |
| Event reminder edge function | supabase/functions/event-reminder/ |

### NEXT PHASE: Media Management Integration
| Task | Effort | Impact |
|------|--------|--------|
| MediaLibrary picker for Programs | 0.5 day | High |
| MediaLibrary picker for Events | 0.5 day | High |
| registerUsage() integration | 0.5 day | Medium |
| media_usages tracking | 0.5 day | Medium |
| Dependency check before deletion | 0.5 day | Medium |

### PHASE 9: Expert & Evaluation Integration ✅ COMPLETE (100%)

| Task | Effort | Status |
|------|--------|--------|
| EventExpertEvaluation component | 1 day | ✅ DONE |
| expert_evaluations entity_type: 'event' support | 0.5 day | ✅ DONE |
| EventDetail expert evaluation tab | 0.5 day | ✅ DONE |
| expert_assignments entity_type: 'event' support | 0.5 day | ✅ DONE |
| ExpertMatchingEngine for events | 0.5 day | ✅ DONE |
| EvaluationConsensusPanel for events | 0.5 day | ✅ DONE |

### PHASE 10: AI Components UI Integration 🔵 IN PROGRESS

| Task | Where | Effort | Status |
|------|-------|--------|--------|
| Integrate AIEventOptimizer in EventDetail | EventDetail.jsx | 0.5 day | ❌ TODO |
| Integrate AIEventOptimizer in EventEdit | EventEdit.jsx | 0.5 day | ❌ TODO |
| Integrate AIEventOptimizer in EventCreate | EventCreate.jsx | 0.5 day | ❌ TODO |
| Integrate AIAttendancePredictor in EventDetail | EventDetail.jsx | 0.5 day | ❌ TODO |
| Integrate AIConflictDetector in EventCreate | EventCreate.jsx | 0.5 day | ❌ TODO |
| Integrate AIConflictDetector in EventEdit | EventEdit.jsx | 0.5 day | ❌ TODO |

**Total Effort:** 1.5 days

### FUTURE ENHANCEMENTS (Low Priority)
| Item | Effort | Impact |
|------|--------|--------|
| Implement Supabase Realtime for live updates | 2 days | Medium |
| Enhanced event analytics dashboard | 1 day | Low |

---

## 9. FILE REFERENCES

### Core Hooks
- `src/hooks/useEvents.js` - Event CRUD + email triggers
- `src/hooks/useEventRegistrations.js` - Registration management
- `src/hooks/useProgramsWithVisibility.js` - Program fetching
- `src/hooks/useEmailTrigger.js` - Email trigger helper

### Core Services
- `src/services/eventSyncService.js` - Campaign ↔ Events sync

### UI Components
- `src/pages/ApprovalCenter.jsx` - Unified approval
- `src/pages/EventCalendar.jsx` - Event listing
- `src/pages/EventCreate.jsx` - Event creation
- `src/pages/EventEdit.jsx` - Event editing
- `src/pages/Programs.jsx` - Program listing
- `src/pages/ProgramDetail.jsx` - Program detail (16+ tabs)

### AI Components
- `src/components/ai/AIEventOptimizer.jsx`
- `src/components/ai/AIAttendancePredictor.jsx`
- `src/components/ai/AIConflictDetector.jsx`
- `src/components/ai/AIProgramEventCorrelator.jsx`
- `src/components/programs/AI*.jsx` (6 files)

---

## 10. DATABASE TABLES INVOLVED

| Table | Used By | Status |
|-------|---------|--------|
| `programs` | Programs CRUD | ✅ |
| `program_applications` | Applications | ✅ |
| `events` | Events CRUD | ✅ |
| `event_registrations` | Registrations | ✅ |
| `approval_requests` | Approval workflow | ✅ |
| `email_templates` | Email system | ✅ |
| `email_logs` | Email tracking | ✅ |
| `notifications` | In-app notifications | ✅ Both |
| `comments` | Discussions | ✅ Both |
| `bookmarks` | User saves | ✅ Both |
| `roles` | Permissions | ✅ |
| `user_functional_roles` | Role assignments | ✅ |
| `budgets` | Budget tracking | ✅ (events use inline columns) |

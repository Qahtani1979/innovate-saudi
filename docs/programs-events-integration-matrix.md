# Programs & Events - System Integration Matrix

**Last Updated:** 2025-12-13  
**Status:** Phase 8 Complete (100%) - All Integration Systems Fully Operational

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
| **AI Components** | ✅ Full (6) | ✅ Full (4) | None |
| **Analytics/Reporting** | ✅ Full | ⚠️ Partial | Low |
| **Budget Integration** | ✅ Full | ✅ Full | None |
| **Audit Logging** | ✅ Full | ✅ Full | None |
| **Media/Storage** | ✅ Full | ✅ Full | None |
| **Media Management** | ✅ Integrated | ✅ Integrated | None |
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

### Roles with Program Permissions
| Role | create | edit | view | approve | manage |
|------|--------|------|------|---------|--------|
| Municipality Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Municipality Coordinator | ✅ | ✅ | ✅ | - | - |
| Program Manager | ✅ | ✅ | ✅ | - | ✅ |
| Program Director | ✅ | ✅ | ✅ | ✅ | ✅ |
| Program Operator | - | ✅ | ✅ | - | ✅ |
| GDISB Operations | - | - | ✅ | ✅ | - |

### Roles with Event Permissions
| Role | create | edit | view | approve | publish |
|------|--------|------|------|---------|---------|
| Municipality Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Municipality Coordinator | ✅ | ✅ | ✅ | ✅ | ✅ |
| Program Manager | ✅ | ✅ | ✅ | - | ✅ |
| Program Director | ✅ | ✅ | ✅ | ✅ | ✅ |
| GDISB Operations | - | - | ✅ | ✅ | ✅ |
| Municipality Staff | ✅ | ✅ | ✅ | - | - |

---

## 3. EMAIL SYSTEM

### Email Templates ✅ COMPLETE

**Programs (8 templates):**
| Template Key | Category | Active |
|-------------|----------|--------|
| `program_accepted` | program | ✅ |
| `program_announced` | program | ✅ |
| `program_application_received` | program | ✅ |
| `program_application_reviewed` | program | ✅ |
| `program_cohort_start` | program | ✅ |
| `program_deadline_reminder` | program | ✅ |
| `program_mentorship_assigned` | program | ✅ |
| `program_rejected` | program | ✅ |

**Events (8 templates):**
| Template Key | Category | Active |
|-------------|----------|--------|
| `event_approved` | event | ✅ |
| `event_cancelled` | event | ✅ |
| `event_invitation` | event | ✅ |
| `event_registration_confirmed` | event | ✅ |
| `event_reminder` | event | ✅ |
| `event_submitted` | event | ✅ |
| `event_updated` | event | ✅ |
| `campaign_event_invite` | campaign | ✅ |

### Email Triggers (Hook Implementation)

**Events - useEvents.js ✅ COMPLETE**
| Trigger | When | Status |
|---------|------|--------|
| `event.created` | Draft event created | ✅ |
| `event.submitted` | Event submitted for approval | ✅ |
| `event.updated` | Event updated (if registrants) | ✅ |
| `event.cancelled` | Event cancelled | ✅ |
| `event.approved` | Event approved in ApprovalCenter | ✅ |

**Programs - usePrograms.js ✅ COMPLETE**
| Trigger | When | Status |
|---------|------|--------|
| `program.created` | Program created | ✅ |
| `program.submitted` | Submitted for approval | ✅ |
| `program.updated` | Program updated | ✅ |
| `program.launched` | Program launched | ✅ |
| `program.completed` | Program completed | ✅ |
| `program.cancelled` | Program cancelled | ✅ |

---

## 4. IN-APP NOTIFICATIONS ✅ COMPLETE

### Current Implementation
- Uses `notifications` table
- `createNotification()` helper in AutoNotification.jsx
- `notifyProgramEvent()` for programs
- `notifyEventAction()` for events

### Programs Integration ✅
| Event | Notification | Status |
|-------|-------------|--------|
| Program created | Admin notified | ✅ |
| Program submitted | Reviewers notified | ✅ |
| Program approved | Creator notified | ✅ |
| Program launched | Broadcast | ✅ |
| Milestone completed | Stakeholders notified | ✅ |
| Program completed | Stakeholders notified | ✅ |

### Events Integration ✅
| Event | Notification | Status |
|-------|-------------|--------|
| Event created | Admin notified | ✅ |
| Event submitted | Reviewers notified | ✅ |
| Event approved | Creator notified | ✅ |
| Event published | Broadcast | ✅ |
| Event reminder | Registrants notified | ✅ (edge function) |
| Event cancelled | Registrants notified | ✅ |

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

## 6. AI COMPONENTS ✅ COMPLETE

### Programs (6 AI Components)
| Component | Purpose | Status |
|-----------|---------|--------|
| `AICurriculumGenerator` | Generate curriculum | ✅ |
| `AIDropoutPredictor` | Predict at-risk participants | ✅ |
| `AICohortOptimizerWidget` | Optimize cohort composition | ✅ |
| `AIAlumniSuggester` | Suggest alumni next steps | ✅ |
| `AIProgramBenchmarking` | Benchmark against similar | ✅ |
| `AIProgramSuccessPredictor` | Predict success rate | ✅ |

### Events (4 AI Components)
| Component | Purpose | Status |
|-----------|---------|--------|
| `AIEventOptimizer` | Optimize timing/description | ✅ |
| `AIAttendancePredictor` | Predict attendance | ✅ |
| `AIConflictDetector` | Detect scheduling conflicts | ✅ |
| `AIProgramEventCorrelator` | Correlate program-event | ✅ |

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

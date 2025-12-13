# Programs & Events - System Integration Matrix

**Last Updated:** 2025-12-13  
**Status:** Comprehensive Assessment

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
| **Budget Integration** | ✅ Full | ⚠️ Missing | Medium |
| **Audit Logging** | ⚠️ Partial | ⚠️ Partial | Low |
| **Media/Storage** | ✅ Full | ✅ Full | None |
| **Search/Discovery** | ✅ Full | ✅ Full | None |
| **Comments System** | ✅ Full | ⚠️ Missing | Low |
| **Bookmarks** | ✅ Full | ⚠️ Missing | Low |
| **Realtime Updates** | ❌ Missing | ❌ Missing | Medium |

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

**Programs - Various Hooks ⚠️ PARTIAL**
| Trigger | When | Status |
|---------|------|--------|
| Application received | User applies | ✅ In ProgramApplicationWizard |
| Application reviewed | Evaluator reviews | ✅ |
| Program accepted | User accepted | ⚠️ Manual in some places |
| Program rejected | User rejected | ⚠️ Manual in some places |
| Cohort start | Cohort begins | ❌ Missing auto-trigger |
| Deadline reminder | Before deadline | ❌ Missing scheduled trigger |

---

## 4. IN-APP NOTIFICATIONS ⚠️ PARTIAL

### Current Implementation
- Uses `notifications` table
- `createNotification()` helper exists
- Used in: R&D workflows, Resource booking

### Programs Integration
| Event | Notification | Status |
|-------|-------------|--------|
| Application submitted | User notified | ⚠️ Not implemented |
| Application status change | User notified | ⚠️ Not implemented |
| Program launch | Subscribers notified | ⚠️ Not implemented |
| Session reminder | Participants notified | ❌ Missing |

### Events Integration
| Event | Notification | Status |
|-------|-------------|--------|
| Registration confirmed | User notified | ⚠️ Email only |
| Event reminder | Registrants notified | ❌ Missing |
| Event cancelled | Registrants notified | ⚠️ Email only |
| Event updated | Registrants notified | ⚠️ Email only |

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

## 7. SYSTEMS NOT INTEGRATED

### Budget Integration ⚠️ MISSING FOR EVENTS
**Programs:** ✅ Has budget fields and tracking
**Events:** 
- ❌ No `budget` column in events table
- ❌ No budget tracking for events
- ❌ No budget approval in event workflow

### Search/Discovery ⚠️ MISSING FOR EVENTS
**Programs:** ✅ Included in `useVisibilityAwareSearch`
**Events:**
- ❌ Not in global search
- ❌ No embeddings for semantic search
- ❌ Limited to EventCalendar filters only

### Comments System ⚠️ MISSING FOR EVENTS
**Programs:** ✅ Uses `comments` table with `entity_type='program'`
**Events:**
- ❌ No comments on events
- ❌ No discussion threads

### Bookmarks ⚠️ MISSING FOR EVENTS
**Programs:** ✅ Uses `bookmarks` table with `entity_type='program'`
**Events:**
- ❌ No event bookmarking
- ❌ No "save event" feature

### Audit Logging ⚠️ PARTIAL
**Programs:** 
- ✅ Basic created_at/updated_at
- ⚠️ No detailed change tracking
**Events:**
- ✅ Basic created_at/updated_at
- ⚠️ No detailed change tracking

### Realtime Updates ❌ MISSING
**Both Programs and Events:**
- ❌ No Supabase Realtime subscription
- ❌ No live updates in listings
- ❌ No collaborative editing support

---

## 8. INTEGRATION RECOMMENDATIONS

### HIGH PRIORITY
| Item | Effort | Impact |
|------|--------|--------|
| Add program email triggers for all lifecycle events | 2 days | High |
| Add in-app notifications for critical events | 2 days | High |

### MEDIUM PRIORITY
| Item | Effort | Impact |
|------|--------|--------|
| Add events to global search | 1 day | Medium |
| Add budget tracking to events | 1 day | Medium |
| Add comments to events | 0.5 day | Low |
| Add bookmarks to events | 0.5 day | Low |

### LOW PRIORITY (Future Enhancement)
| Item | Effort | Impact |
|------|--------|--------|
| Implement Supabase Realtime for live updates | 2 days | Medium |
| Add event reminder edge function (24h before) | 1 day | Medium |
| Add detailed audit logging | 2 days | Low |

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
| `notifications` | In-app notifications | ⚠️ Not used by P&E |
| `comments` | Discussions | ⚠️ Programs only |
| `bookmarks` | User saves | ⚠️ Programs only |
| `roles` | Permissions | ✅ |
| `user_functional_roles` | Role assignments | ✅ |
| `budgets` | Budget tracking | ⚠️ Programs only |

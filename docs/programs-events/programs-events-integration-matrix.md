# Programs & Events - System Integration Matrix

**Last Updated:** 2025-12-13  
**Scope:** Integration status with platform systems (no architecture or task tracking)

---

## Integration Summary

| # | System | Programs | Events | Status |
|---|--------|----------|--------|--------|
| 1 | Approval Workflow | ✅ Full | ✅ Full | Complete |
| 2 | Permissions (Roles) | ✅ Full | ✅ Full | Complete |
| 3 | Email Templates | ✅ Full | ✅ Full | Complete |
| 4 | Email Triggers | ✅ Full | ✅ Full | Complete |
| 5 | In-App Notifications | ✅ Full | ✅ Full | Complete |
| 6 | Calendar Integration | ✅ Full | ✅ Full | Complete |
| 7 | Campaign Sync | ✅ Full | ✅ Full | Complete |
| 8 | AI Components | ✅ Full | ✅ Full | Complete |
| 9 | Budget Integration | ✅ Full | ✅ Full | Complete |
| 10 | Audit Logging | ✅ Full | ✅ Full | Complete |
| 11 | Media/Storage | ✅ Full | ✅ Full | Complete |
| 12 | Media Management | ✅ Full | ✅ Full | Complete |
| 13 | Expert & Evaluation | ✅ Full | ✅ Full | Complete |
| 14 | Search/Discovery | ✅ Full | ✅ Full | Complete |
| 15 | Comments System | ✅ Full | ✅ Full | Complete |
| 16 | Bookmarks | ✅ Full | ✅ Full | Complete |
| 17 | Analytics/Reporting | ✅ Full | ✅ Full | Complete |

---

## 1. Approval Workflow

### Programs (4 Gates)

| Gate | Type | SLA | Status |
|------|------|-----|--------|
| launch_approval | approval | 5 days | ✅ |
| selection_approval | approval | 7 days | ✅ |
| mid_review | review | 3 days | ✅ |
| completion_review | approval | 10 days | ✅ |

### Events (2 Gates)

| Gate | Type | SLA | Status |
|------|------|-----|--------|
| submission | submission | 2 days | ✅ |
| approval | approval | 3 days | ✅ |

### Key Files

- `src/components/approval/ApprovalGateConfig.jsx`
- `src/pages/ApprovalCenter.jsx`
- `src/hooks/usePrograms.js` (auto-creates approval_requests)
- `src/hooks/useEvents.js` (auto-creates approval_requests)

---

## 2. Permissions (Roles)

### Programs Permissions

| Permission | Used In |
|------------|---------|
| program_view | Programs.jsx, ProgramDetail.jsx |
| program_create | Programs.jsx (Create button) |
| program_edit | ProgramEdit.jsx, ProgramDetail.jsx |
| program_approve | ApprovalCenter.jsx |
| program_manage | ProgramOperatorPortal.jsx |
| program_apply | ProgramApplicationWizard.jsx |
| program_participate | ParticipantDashboard.jsx |

### Events Permissions

| Permission | Used In |
|------------|---------|
| event_view | EventCalendar.jsx, EventDetail.jsx |
| event_create | EventCalendar.jsx (Create button) |
| event_edit | EventEdit.jsx |
| event_manage | EventDetail.jsx |
| event_approve | ApprovalCenter.jsx |
| event_register | EventRegistration.jsx |
| event_evaluate | EventExpertEvaluation |

---

## 3. Email Templates

### Programs (8 Active)

| Template Key | Purpose |
|-------------|---------|
| program_accepted | Application accepted |
| program_announced | New program announcement |
| program_application_received | Application confirmation |
| program_application_reviewed | Application under review |
| program_cohort_start | Cohort starting |
| program_deadline_reminder | Application deadline |
| program_mentorship_assigned | Mentor assigned |
| program_rejected | Application rejected |

### Events (7 Active)

| Template Key | Purpose |
|-------------|---------|
| event_approved | Event approved |
| event_cancelled | Event cancelled |
| event_invitation | Event invitation |
| event_registration_confirmed | Registration confirmed |
| event_reminder | 24h reminder |
| event_submitted | Submitted for approval |
| event_updated | Details updated |

---

## 4. Email Triggers

### usePrograms.js Triggers

| Trigger Key | Lifecycle Event |
|-------------|-----------------|
| program.created | Draft created |
| program.submitted | Submitted for approval |
| program.updated | Data updated |
| program.launched | Status → active |
| program.completed | Status → completed |
| program.cancelled | Status → cancelled |

### useEvents.js Triggers

| Trigger Key | Lifecycle Event |
|-------------|-----------------|
| event.created | Draft created |
| event.submitted | Submitted for approval |
| event.updated | Updated (if registrants > 0) |
| event.cancelled | Cancelled |

---

## 5. In-App Notifications

### Programs (notifyProgramEvent)

| Event Type | Priority |
|------------|----------|
| created | medium |
| submitted | medium |
| approved | high |
| launched | high |
| application_received | medium |
| participant_enrolled | medium |
| session_scheduled | medium |
| milestone_completed | medium |
| completed | medium |

### Events (notifyEventAction)

| Action Type | Priority |
|-------------|----------|
| created | medium |
| submitted | medium |
| approved | medium |
| published | medium |
| registration_opened | medium |
| registration_closed | medium |
| reminder | high |
| cancelled | high |
| completed | medium |

---

## 6. Calendar Integration

| Feature | Programs | Events |
|---------|----------|--------|
| CalendarView.jsx | ✅ Timeline milestones | ✅ Event entries |
| Date filtering | ✅ | ✅ |
| Color coding | ✅ | ✅ |
| Quick actions | ✅ | ✅ |

---

## 7. Campaign Sync

| Feature | Implementation |
|---------|----------------|
| Campaign → Events | `syncEventsToTable()` in eventSyncService.js |
| Auto-create events | On campaign creation |
| Bidirectional tracking | `sync_id` in events |
| Program linkage | `program_id` in events |

---

## 8. AI Components

### Programs (6 Components)

| Component | Purpose | Used In |
|-----------|---------|---------|
| AICurriculumGenerator | Generate curriculum | ProgramDetail, ProgramEdit |
| AIDropoutPredictor | Predict at-risk | ProgramDetail |
| AICohortOptimizerWidget | Optimize cohort | ProgramDetail |
| AIAlumniSuggester | Alumni next steps | ProgramDetail |
| AIProgramBenchmarking | Benchmark | ProgramDetail |
| AIProgramSuccessPredictor | Predict success | ProgramDetail |

### Events (4 Components)

| Component | Purpose | Used In |
|-----------|---------|---------|
| AIProgramEventCorrelator | Correlate programs-events | ProgramsEventsHub |
| AIEventOptimizer | Optimize timing/content | EventCreate, EventDetail |
| AIAttendancePredictor | Predict attendance | EventDetail |
| AIConflictDetector | Detect conflicts | EventCreate |

---

## 9. Budget Integration

| Feature | Programs | Events |
|---------|----------|--------|
| budget_estimate | ✅ In table | ✅ In table |
| budget_actual | - | ✅ In table |
| funding_details | ✅ JSON | - |
| Budget entity link | ✅ Via budgets table | ✅ Via columns |
| Cost analysis | ✅ | ✅ EventsAnalyticsDashboard |

---

## 10. Audit Logging

| Function | Entity | Actions |
|----------|--------|---------|
| logProgramActivity() | Program | created, submitted, updated, launched, completed, cancelled, deleted |
| logEventActivity() | Event | created, submitted, updated, cancelled, deleted |
| logApprovalActivity() | Both | submitted, approved, rejected, escalated |

### Key Files

- `src/hooks/useAuditLog.js`
- `src/components/audit/ProgramEventAuditLog.jsx`

---

## 11. Media/Storage

| Bucket | Entity | Public |
|--------|--------|--------|
| programs | Programs | Yes |
| events | Events | Yes |

| Feature | Programs | Events |
|---------|----------|--------|
| Image upload | ✅ | ✅ |
| Gallery support | ✅ gallery_urls | ✅ gallery_urls |
| Video URL | ✅ video_url | ✅ |

---

## 12. Media Management

| Component | Purpose |
|-----------|---------|
| MediaLibraryPicker | Select from library |
| MediaFieldWithPicker | Unified field wrapper |
| useMediaIntegration | Usage tracking |

| Page | Integration |
|------|-------------|
| ProgramEdit.jsx | ✅ |
| EventEdit.jsx | ✅ |
| ProgramCreateWizard | ✅ (UI only) |
| EventCreate | ✅ (UI only) |

---

## 13. Expert & Evaluation

| Feature | Programs | Events |
|---------|----------|--------|
| Expert assignment | ✅ ExpertMatchingEngine | ✅ entity_type='event' |
| Expert evaluation | ✅ ProgramExpertEvaluation | ✅ EventExpertEvaluation |
| Consensus panel | ✅ EvaluationConsensusPanel | ✅ EvaluationConsensusPanel |
| Mentor matching | ✅ ProgramMentorMatching | - |

---

## 14. Search/Discovery

### Programs

| Feature | Implementation |
|---------|----------------|
| Text search | Programs.jsx filters |
| Advanced search | AdvancedSearch.jsx |
| Filter by type | program_type filter |
| Filter by status | status filter |
| Filter by sector | sector_id filter |

### Events

| Feature | Implementation |
|---------|----------------|
| Text search | EventFilters.jsx |
| Filter by type | event_type filter |
| Filter by status | status filter |
| Filter by mode | is_virtual filter |
| Upcoming filter | start_date >= now |

---

## 15. Comments System

| Feature | Programs | Events |
|---------|----------|--------|
| Comments table | ✅ entity_type='program' | ✅ entity_type='event' |
| UI integration | ✅ ProgramDetail | ✅ EventDetail |
| Threaded replies | ✅ | ✅ |
| Internal comments | ✅ | ✅ |

---

## 16. Bookmarks

| Feature | Programs | Events |
|---------|----------|--------|
| Bookmarks table | ✅ entity_type='program' | ✅ entity_type='event' |
| UI integration | ✅ ProgramDetail | ✅ EventDetail |
| My Bookmarks page | ✅ | ✅ |

---

## 17. Analytics/Reporting

| Feature | Programs | Events |
|---------|----------|--------|
| Dashboard | ✅ ProgramsControlDashboard | ✅ EventsAnalyticsDashboard |
| Metrics | Applications, enrollments, completion | Registrations, attendance, budget |
| Charts | ✅ Recharts | ✅ Recharts |
| Export | ✅ | ✅ |

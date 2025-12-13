# Programs & Events - Approval System Assessment

## Executive Summary

**Overall Status: 85% Complete**

| Area | Status | Score |
|------|--------|-------|
| Gate Configurations | ✅ Complete | 100% |
| Approval Request Integration | ✅ Complete | 95% |
| ApprovalCenter UI | ✅ Complete | 95% |
| Permissions (Roles Table) | ⚠️ Gap | 70% |
| Email Triggers | ⚠️ Partial | 75% |
| Email Templates | ✅ Complete | 100% |

---

## 1. GATE CONFIGURATIONS

### Events ✅ COMPLETE
Located in: `src/components/approval/ApprovalGateConfig.jsx` (lines 711-759)

| Gate | Type | Required Role | SLA |
|------|------|--------------|-----|
| `submission` | submission | event_coordinator | 2 days |
| `approval` | approval | event_approver | 3 days |

**Self-Check Items (Submission):**
- Event title and description complete
- Date and time confirmed
- Venue or virtual link ready
- Target audience defined
- Registration capacity set

**Reviewer Checklist (Approval):**
- Event value justified
- Budget approved (if applicable)
- Communication plan ready
- Approval justified

**AI Assistance:** ✅ Configured for both requester and reviewer

---

### Programs ✅ COMPLETE
Located in: `src/components/approval/ApprovalGateConfig.jsx` (lines 509-608)

| Gate | Type | Required Role | SLA |
|------|------|--------------|-----|
| `launch_approval` | approval | program_approver | 5 days |
| `selection_approval` | approval | program_manager | 7 days |
| `mid_review` | review | program_manager | 3 days |
| `completion_review` | approval | program_approver | 10 days |

**All 4 gates have:**
- ✅ Self-check items (5-6 per gate)
- ✅ Reviewer checklist (4-6 per gate)
- ✅ AI assistance for requester and reviewer

---

## 2. APPROVAL REQUEST INTEGRATION

### Events ✅ INTEGRATED
File: `src/hooks/useEvents.js`

**Implementation:**
- When `is_published=true`, status set to `pending`
- Automatic `approval_request` creation with:
  - `entity_type: 'event'`
  - `request_type: 'event_approval'`
  - `gate_name: 'approval'` in metadata
  - 3-day SLA calculated

### Programs ✅ INTEGRATED
- ProgramCreateWizard creates approval_request on submission
- 4 gates tracked via `workflow_stage` field

---

## 3. APPROVAL CENTER UI

### File: `src/pages/ApprovalCenter.jsx`

**Events Tab:** ✅ COMPLETE
- Fetches from `approval_requests` table (new workflow)
- Falls back to legacy `status='pending'` events
- Uses `InlineApprovalWizard` for workflow approvals
- Simple approve/reject for legacy events
- Count shown in stats bar

**Programs Tab:** ✅ COMPLETE
- Fetches program entity approvals
- Uses `InlineApprovalWizard`
- Integrated with gate configs

**Protected by permissions:**
```javascript
requiredPermissions: ['challenge_approve', 'pilot_approve', 'program_approve', 'rd_proposal_approve', 'solution_approve', 'matchmaker_approve']
```

**ISSUE:** `event_approve` permission NOT in required list!

---

## 4. PERMISSIONS - GAPS IDENTIFIED

### Missing from `roles` table:

| Permission | Status | Notes |
|------------|--------|-------|
| `event_create` | ⚠️ NOT FOUND | No role has this |
| `event_edit` | ⚠️ NOT FOUND | No role has this |
| `event_view` | ⚠️ NOT FOUND | No role has this |
| `event_approve` | ⚠️ NOT FOUND | Not in ApprovalCenter |
| `event_publish` | ⚠️ NOT FOUND | No role has this |
| `program_approve` | ✅ Found | Program Director role |
| `program_create` | ✅ Found | Program Manager, Director |
| `program_edit` | ✅ Found | Program Operator |
| `program_view_all` | ✅ Found | Multiple roles |

### Roles that SHOULD have event permissions:

| Role | Recommended Permissions |
|------|------------------------|
| Municipality Admin | event_create, event_edit, event_approve |
| Municipality Coordinator | event_create, event_edit |
| Program Manager | event_create, event_edit |
| Event Coordinator | event_create, event_edit, event_view |
| GDIBS Operations | event_view, event_approve |

---

## 5. EMAIL TRIGGERS & TEMPLATES

### Templates Configured ✅

| Template Key | Category | Status |
|-------------|----------|--------|
| `event_invitation` | event | ✅ Active |
| `event_reminder` | event | ✅ Active |
| `event_registration_confirmed` | event | ✅ Active |
| `event_cancelled` | event | ✅ Active |
| `event_updated` | event | ✅ Active |
| `campaign_event_invite` | campaign | ✅ Active |
| `program_announced` | program | ✅ Active |
| `program_application_received` | program | ✅ Active |
| `program_application_reviewed` | program | ✅ Active |
| `program_accepted` | program | ✅ Active |
| `program_rejected` | program | ✅ Active |
| `program_deadline_reminder` | program | ✅ Active |
| `program_cohort_start` | program | ✅ Active |
| `program_mentorship_assigned` | program | ✅ Active |

### Triggers Implemented in useEvents.js ✅

| Trigger Key | When Called |
|-------------|-------------|
| `event.created` | Draft event created |
| `event.updated` | Event updated (if registrants exist) |
| `event.cancelled` | Event cancelled |

### MISSING Triggers:

| Trigger Key | Should Be Called When |
|-------------|----------------------|
| `event.approved` | Event approved in ApprovalCenter |
| `event.submitted` | Event submitted for approval |
| `program.approved` | Program launch approved |
| `program.status_changed` | Program workflow advances |

---

## 6. COMMUNICATION INTEGRATION

### Current State:
- ✅ `useEmailTrigger` hook exists and is used in useEvents.js
- ✅ Email templates exist for events and programs
- ✅ InlineApprovalWizard uses `useEmailTrigger`
- ⚠️ ApprovalCenter does NOT trigger emails on event approval

### Gap: ApprovalCenter Event Approval
Line ~841 in ApprovalCenter.jsx updates event but doesn't trigger email:
```javascript
// Current: Just updates status
await supabase.from('events').update({ status: 'scheduled' })...

// Missing:
await triggerEmail('event.approved', { ... });
```

---

## 7. ACTION ITEMS

### HIGH PRIORITY (Security/Functionality)

1. **Add `event_approve` to ApprovalCenter permissions**
   - File: `src/pages/ApprovalCenter.jsx` line 1096
   - Add `'event_approve'` to requiredPermissions array

2. **Add event permissions to roles table**
   - Add `event_create`, `event_edit`, `event_view`, `event_approve` to relevant roles

3. **Trigger email on event approval**
   - In ApprovalCenter legacy event approval, add:
   ```javascript
   await triggerEmail('event.approved', {
     entity_type: 'event',
     entity_id: event.id,
     recipient_email: event.created_by
   });
   ```

### MEDIUM PRIORITY (Polish)

4. **Add `event.submitted` trigger**
   - In useEvents.js createEventMutation, when status='pending':
   ```javascript
   await triggerEmail('event.submitted', { ... });
   ```

5. **Create approval email template**
   - Add `event_approved` template in email_templates table

6. **Program approval triggers**
   - Ensure program workflow transitions trigger emails

### LOW PRIORITY (Enhancement)

7. **Event reminder edge function**
   - Scheduled function to send reminders 24h before events

8. **Approval escalation for events**
   - Auto-escalate if SLA exceeded

---

## 8. FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/pages/ApprovalCenter.jsx` | Add event_approve permission, add email trigger |
| `src/hooks/useEvents.js` | Add event.submitted trigger |
| Database: `roles` table | Add event permissions to roles |
| Database: `email_templates` | Add event_approved template |

---

## 9. TESTING CHECKLIST

- [ ] Create event as Municipality Admin → should succeed
- [ ] Submit event for approval → approval_request created
- [ ] View event in ApprovalCenter → appears in Events tab
- [ ] Approve event → status='scheduled', email sent
- [ ] Reject event → status='rejected', email sent
- [ ] Create program as Program Manager → should succeed
- [ ] Submit program for launch → approval_request created
- [ ] Approve program launch → workflow advances, email sent

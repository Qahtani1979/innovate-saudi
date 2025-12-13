# Email Migration Tracker

## Migration Status: Legacy Calls → useEmailTrigger()

This document tracks the progress of migrating legacy email sending calls to the unified `useEmailTrigger()` hook.

### Legend
- ✅ Migrated
- 🔄 In Progress
- ❌ Not Started
- ⏭️ Skipped (special case)

---

## Files to Migrate

### High Priority (Direct edge function calls)

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| `src/components/ChallengeReviewWorkflow.jsx` | `useEmailTrigger()` | ✅ | Challenge approval email - MIGRATED |
| `src/components/access/RoleRequestApprovalQueue.jsx` | `useEmailTrigger()` | ✅ | Role request approval/rejection - MIGRATED |
| `src/components/communications/EmailTemplateEditorContent.jsx` | `supabase.functions.invoke('send-email')` | ⏭️ | Test email sending - keep direct |
| `src/pages/PublicIdeaSubmission.jsx` | Direct fetch to send-email | ❌ | Idea submission confirmation |
| `src/components/onboarding/OnboardingWizard.jsx` | `supabase.functions.invoke('send-welcome-email')` | ❌ | Welcome email |

### Medium Priority (base44 integration calls)

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| `src/pages/ChallengeSolutionMatching.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Match notification |
| `src/pages/Contact.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Contact form |
| `src/pages/StartupVerificationQueue.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Verification status |
| `src/components/ProgramCompletionWorkflow.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Completion certificate |
| `src/components/access/BulkUserImport.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Welcome email |
| `src/components/LivingLabExpertMatching.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Expert consultation request |
| `src/components/matchmaker/AutomatedMatchNotifier.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Match notification |
| `src/components/rd/RDProposalSubmissionGate.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Proposal submission |
| `src/components/startup/StartupMentorshipMatcher.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Mentorship request |

### Additional Files (found in search)

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| Various components | Mixed methods | ❌ | 47 files total with email references |

---

## Migration Progress Summary

| Category | Total | Migrated | In Progress | Not Started |
|----------|-------|----------|-------------|-------------|
| Direct Supabase calls | 5 | 2 | 0 | 2 |
| base44 integration calls | 9 | 0 | 0 | 9 |
| Other files | ~33 | 0 | 0 | ~33 |
| **Total** | **~47** | **2** | **0** | **~44** |

---

## How to Migrate

### Before (Legacy)

```javascript
// Method 1: Direct supabase call
await supabase.functions.invoke('send-email', {
  body: {
    template_key: 'challenge_approved',
    to: email,
    variables: { name, challengeTitle }
  }
});

// Method 2: base44 integration
await base44.integrations.Core.SendEmail({
  to: email,
  subject: 'Subject here',
  body: '<p>HTML body</p>'
});

// Method 3: Direct fetch
await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
  method: 'POST',
  body: JSON.stringify({ ... })
});
```

### After (Unified)

```javascript
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

// In component
const { triggerEmail } = useEmailTrigger();

// Usage
await triggerEmail('CHALLENGE_APPROVED', {
  entityType: 'challenge',
  entityId: challengeId,
  recipientEmail: email,
  recipientUserId: userId,
  variables: {
    userName: name,
    challengeTitle: title
  }
});
```

---

## Trigger Keys Reference

### Challenge Triggers
- `CHALLENGE_SUBMITTED`
- `CHALLENGE_APPROVED`
- `CHALLENGE_REJECTED`
- `CHALLENGE_ASSIGNED`
- `CHALLENGE_PUBLISHED`
- `CHALLENGE_STATUS_CHANGED`

### Pilot Triggers
- `PILOT_CREATED`
- `PILOT_STARTED`
- `PILOT_COMPLETED`
- `PILOT_INVITATION`
- `PILOT_MILESTONE_COMPLETED`

### Auth Triggers
- `WELCOME`
- `PASSWORD_RESET`
- `EMAIL_VERIFICATION`
- `ROLE_ASSIGNED`
- `ROLE_REQUEST_APPROVED`
- `ROLE_REQUEST_REJECTED`

### Solution Triggers
- `SOLUTION_SUBMITTED`
- `SOLUTION_APPROVED`
- `SOLUTION_MATCHED`

### System Triggers
- `CONTACT_FORM`
- `TASK_REMINDER`
- `DEADLINE_REMINDER`

---

## Migration Checklist per File

- [ ] Import `useEmailTrigger` hook
- [ ] Replace email sending logic with `triggerEmail()`
- [ ] Map old parameters to new format
- [ ] Test email delivery
- [ ] Remove legacy imports if no longer needed
- [ ] Update this tracker

---

## Special Cases

### EmailTemplateEditorContent.jsx
**Status: ⏭️ Skipped**
- This component tests individual templates directly
- Should keep using direct `send-email` for admin testing
- Not a production email flow

### Campaign-related emails
**Status: N/A**
- Campaigns use `campaign-sender` edge function
- Not part of trigger-based system
- Separate workflow

---

## Next Steps

1. Start with high-priority files (direct supabase calls)
2. Create missing trigger configs if needed
3. Test each migration in development
4. Update tracker after each file
5. Final verification of all email flows

---

*Last Updated: 2024-12-13*

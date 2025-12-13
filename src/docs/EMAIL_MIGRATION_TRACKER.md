# Email Migration Tracker

## Migration Status: Legacy Calls → useEmailTrigger()

This document tracks the progress of migrating legacy email sending calls to the unified `useEmailTrigger()` hook and `email-trigger-hub` edge function.

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
| `src/components/ChallengeReviewWorkflow.jsx` | `useEmailTrigger()` | ✅ | Challenge approval email |
| `src/components/access/RoleRequestApprovalQueue.jsx` | `useEmailTrigger()` | ✅ | Role request approval/rejection |
| `src/components/communications/EmailTemplateEditorContent.jsx` | `supabase.functions.invoke('send-email')` | ⏭️ | Test email - keep direct |
| `src/pages/PublicIdeaSubmission.jsx` | `email-trigger-hub` | ✅ | Idea submission confirmation |
| `src/components/onboarding/OnboardingWizard.jsx` | `email-trigger-hub` | ✅ | Welcome email |

### Medium Priority (base44 integration calls)

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| `src/pages/ChallengeSolutionMatching.jsx` | `email-trigger-hub` | ✅ | Match notification |
| `src/pages/Contact.jsx` | `email-trigger-hub` | ✅ | Contact form |
| `src/pages/StartupVerificationQueue.jsx` | `email-trigger-hub` | ✅ | Verification status |
| `src/components/ProgramCompletionWorkflow.jsx` | `email-trigger-hub` | ✅ | Completion certificate |
| `src/components/access/BulkUserImport.jsx` | `email-trigger-hub` | ✅ | Welcome email |
| `src/components/LivingLabExpertMatching.jsx` | `email-trigger-hub` | ✅ | Expert consultation request |
| `src/components/matchmaker/AutomatedMatchNotifier.jsx` | `email-trigger-hub` | ✅ | Match notification |
| `src/components/rd/RDProposalSubmissionGate.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Proposal submission |
| `src/components/startup/StartupMentorshipMatcher.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Mentorship request |

### Additional Files (found in search - remaining ~23 files)

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| `src/components/dashboard/DashboardSharing.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Dashboard sharing |
| `src/components/ProgramSelectionWorkflow.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Program acceptance |
| `src/components/solutions/ExpressInterestButton.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Interest notification |
| `src/components/solutions/SolutionDeprecationWizard.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Deprecation notice |
| `src/components/communications/AnnouncementTargeting.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Announcements |
| `src/components/organizations/PartnershipWorkflow.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Partnership proposal |
| `src/components/programs/WaitlistManager.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Waitlist notification |
| Other files (~18) | Various methods | ❌ | Remaining files |

---

## Migration Progress Summary

| Category | Total | Migrated | In Progress | Not Started |
|----------|-------|----------|-------------|-------------|
| Direct Supabase calls | 5 | 4 | 0 | 0 |
| base44 integration calls | 9 | 7 | 0 | 2 |
| Other files | ~25 | 0 | 0 | ~25 |
| **Total** | **~39** | **11** | **0** | **~27** |

**Progress: ~28% Complete**

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
// Option 1: Using hook (for React components)
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

const { triggerEmail } = useEmailTrigger();

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

// Option 2: Direct edge function call (for non-hook contexts)
await supabase.functions.invoke('email-trigger-hub', {
  body: {
    trigger: 'TRIGGER_KEY',
    recipientEmail: email,
    entityType: 'entity',
    entityId: id,
    variables: { ... }
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

### Startup Triggers
- `STARTUP_VERIFIED`
- `STARTUP_VERIFICATION_UPDATE`

### Program Triggers
- `PROGRAM_COMPLETED`
- `PROGRAM_ACCEPTED`
- `PROGRAM_WAITLIST`

### Expert/Matching Triggers
- `EXPERT_CONSULTATION_REQUEST`
- `MATCHMAKER_MATCH`

### System Triggers
- `CONTACT_FORM`
- `CONTACT_FORM_CONFIRMATION`
- `IDEA_SUBMITTED`
- `TASK_REMINDER`
- `DEADLINE_REMINDER`

---

## Migration Checklist per File

- [ ] Import `supabase` client or `useEmailTrigger` hook
- [ ] Replace email sending logic with `email-trigger-hub` or `triggerEmail()`
- [ ] Map old parameters to new format (trigger key, variables)
- [ ] Test email delivery
- [ ] Remove legacy imports if no longer needed
- [ ] Update this tracker

---

## Migrated Files Log

### Session 1 (2024-12-13)
1. ✅ `ChallengeReviewWorkflow.jsx` - Challenge approval emails
2. ✅ `RoleRequestApprovalQueue.jsx` - Role request approval/rejection

### Session 2 (2024-12-13)
3. ✅ `PublicIdeaSubmission.jsx` - Idea submission confirmation
4. ✅ `OnboardingWizard.jsx` - Welcome email
5. ✅ `ChallengeSolutionMatching.jsx` - Solution match notification
6. ✅ `Contact.jsx` - Contact form emails
7. ✅ `StartupVerificationQueue.jsx` - Startup verification emails

### Session 3 (2024-12-13)
8. ✅ `ProgramCompletionWorkflow.jsx` - Program completion certificate
9. ✅ `BulkUserImport.jsx` - Welcome email for bulk imports
10. ✅ `LivingLabExpertMatching.jsx` - Expert consultation requests
11. ✅ `AutomatedMatchNotifier.jsx` - Matchmaker notifications

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

1. Continue migrating remaining files (~27 remaining)
2. Create missing trigger configs for new triggers
3. Test each migration in development
4. Update tracker after each file
5. Final verification of all email flows

---

*Last Updated: 2024-12-13*

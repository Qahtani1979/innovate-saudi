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
| `src/pages/PublicIdeaSubmission.jsx` | `email-trigger-hub` | ✅ | Idea submission confirmation - MIGRATED |
| `src/components/onboarding/OnboardingWizard.jsx` | `email-trigger-hub` | ✅ | Welcome email - MIGRATED |

### Medium Priority (base44 integration calls)

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| `src/pages/ChallengeSolutionMatching.jsx` | `email-trigger-hub` | ✅ | Match notification - MIGRATED |
| `src/pages/Contact.jsx` | `email-trigger-hub` | ✅ | Contact form - MIGRATED |
| `src/pages/StartupVerificationQueue.jsx` | `email-trigger-hub` | ✅ | Verification status - MIGRATED |
| `src/components/ProgramCompletionWorkflow.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Completion certificate |
| `src/components/access/BulkUserImport.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Welcome email |
| `src/components/LivingLabExpertMatching.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Expert consultation request |
| `src/components/matchmaker/AutomatedMatchNotifier.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Match notification |
| `src/components/rd/RDProposalSubmissionGate.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Proposal submission |
| `src/components/startup/StartupMentorshipMatcher.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Mentorship request |

### Additional Files (found in search - 32 files with base44 SendEmail)

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| `src/components/dashboard/DashboardSharing.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Dashboard sharing |
| `src/components/ProgramSelectionWorkflow.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Program acceptance |
| `src/components/solutions/ExpressInterestButton.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Interest notification |
| `src/components/solutions/SolutionDeprecationWizard.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Deprecation notice |
| `src/components/communications/AnnouncementTargeting.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Announcements |
| `src/components/organizations/PartnershipWorkflow.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Partnership proposal |
| `src/components/programs/WaitlistManager.jsx` | `base44.integrations.Core.SendEmail` | ❌ | Waitlist notification |
| Other files (25+) | Various methods | ❌ | ~25 more files |

---

## Migration Progress Summary

| Category | Total | Migrated | In Progress | Not Started |
|----------|-------|----------|-------------|-------------|
| Direct Supabase calls | 5 | 4 | 0 | 0 |
| base44 integration calls | 9 | 3 | 0 | 6 |
| Other files | ~25 | 0 | 0 | ~25 |
| **Total** | **~39** | **7** | **0** | **~31** |

**Progress: ~18% Complete**

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

## AI Campaign Helpers Integration

The `CampaignAIHelpers` component is now fully integrated with `CampaignManager`:

### Integration Points
1. **Subject Generation** → Applied to `campaign_variables.subject`
2. **Body Generation** → Applied to `campaign_variables.body` and `campaign_variables.content`
3. **Translation** → Copy/paste workflow
4. **Text Improvement** → Copy/paste workflow

### Usage
1. Open the AI Campaign Helpers collapsible panel
2. Generate content using any of the 4 tabs
3. Click "Use" button to apply to current campaign
4. Content is automatically applied to campaign variables

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

## Recent Migrations (2024-12-13)

1. **ChallengeReviewWorkflow.jsx** - Challenge approval emails
2. **RoleRequestApprovalQueue.jsx** - Role request approval/rejection
3. **PublicIdeaSubmission.jsx** - Idea submission confirmation
4. **OnboardingWizard.jsx** - Welcome email
5. **ChallengeSolutionMatching.jsx** - Solution match notification
6. **Contact.jsx** - Contact form emails
7. **StartupVerificationQueue.jsx** - Startup verification emails

---

## Next Steps

1. Continue migrating remaining base44.integrations calls
2. Create any missing trigger configs if needed
3. Test each migration in development
4. Update tracker after each file
5. Final verification of all email flows

---

*Last Updated: 2024-12-13*

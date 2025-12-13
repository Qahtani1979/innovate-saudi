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
| `src/components/ProgramSelectionWorkflow.jsx` | `email-trigger-hub` | ✅ | Program acceptance/rejection |
| `src/components/dashboard/DashboardSharing.jsx` | `email-trigger-hub` | ✅ | Dashboard sharing |
| `src/components/solutions/ExpressInterestButton.jsx` | `email-trigger-hub` | ✅ | Interest notification |
| `src/components/solutions/SolutionDeprecationWizard.jsx` | `email-trigger-hub` | ✅ | Deprecation notice |
| `src/components/communications/AnnouncementTargeting.jsx` | `email-trigger-hub` | ✅ | Announcements |
| `src/components/organizations/PartnershipWorkflow.jsx` | `email-trigger-hub` | ✅ | Partnership proposal |
| `src/components/programs/WaitlistManager.jsx` | `email-trigger-hub` | ✅ | Waitlist notification |

### Session 5 Files (migrated)

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| `src/lib/AuthContext.jsx` | `email-trigger-hub` | ✅ | Welcome email on signup |
| `src/api/base44Client.js` | `email-trigger-hub` | ✅ | Updated SendEmail to support triggers |
| `src/components/RDToPilotTransition.jsx` | `email-trigger-hub` | ✅ | Pilot created from R&D |
| `src/components/programs/ProgramToPilotWorkflow.jsx` | `email-trigger-hub` | ✅ | Pilot created from program |
| `src/components/ChallengeSubmissionWizard.jsx` | `email-trigger-hub` | ✅ | Challenge submission confirmation |
| `src/components/solutions/SolutionToPilotWorkflow.jsx` | `email-trigger-hub` | ✅ | Pilot created from solution |
| `src/components/rd/RDProposalAwardWorkflow.jsx` | `email-trigger-hub` | ✅ | Proposal awarded notification |

### Session 6 Files (migrated)

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| `src/pages/ExpertOnboarding.jsx` | `email-trigger-hub` | ✅ | Expert application notification |
| `src/pages/ExpertMatchingEngine.jsx` | `email-trigger-hub` | ✅ | Expert assignment notification |
| `src/components/rd/RDProposalEscalationAutomation.jsx` | `email-trigger-hub` | ✅ | Escalation notification |
| `src/components/rd/RDProposalSubmissionGate.jsx` | `email-trigger-hub` | ✅ | Proposal submission notification |
| `src/components/startup/StartupMentorshipMatcher.jsx` | `email-trigger-hub` | ✅ | Mentorship request |
| `src/components/ProgramLaunchWorkflow.jsx` | `email-trigger-hub` | ✅ | Program launch notification |
| `src/components/programs/OnboardingWorkflow.jsx` | `email-trigger-hub` | ✅ | Onboarding welcome email |

### Session 7 Files (migrated)

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| `src/components/challenges/CrossCitySolutionSharing.jsx` | `email-trigger-hub` | ✅ | Cross-city sharing |
| `src/components/CommitteeMeetingScheduler.jsx` | `email-trigger-hub` | ✅ | Meeting notifications |
| `src/components/programs/MentorScheduler.jsx` | `email-trigger-hub` | ✅ | Mentor session |
| `src/components/programs/AutomatedCertificateGenerator.jsx` | `email-trigger-hub` | ✅ | Certificate email |
| `src/components/scaling/BudgetApprovalGate.jsx` | `email-trigger-hub` | ✅ | Budget approval/rejection |

### Skipped Files

| File | Current Method | Status | Notes |
|------|---------------|--------|-------|
| `src/pages/MasterDevelopmentPrompt.jsx` | `base44.integrations.Core.SendEmail` | ⏭️ | Documentation only - no runtime |
| `src/components/communications/EmailTemplateEditorContent.jsx` | `supabase.functions.invoke('send-email')` | ⏭️ | Test email - keep direct |

---

## Migration Progress Summary

| Category | Total | Migrated | Skipped | Not Started |
|----------|-------|----------|---------|-------------|
| Direct Supabase calls | 5 | 4 | 1 | 0 |
| base44 integration calls | 14 | 14 | 0 | 0 |
| Session 5 files | 7 | 7 | 0 | 0 |
| Session 6 files | 7 | 7 | 0 | 0 |
| Session 7 files | 5 | 5 | 0 | 0 |
| Documentation files | 1 | 0 | 1 | 0 |
| **Total** | **~39** | **37** | **2** | **0** |

**Progress: 100% Complete ✅**

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
- `SOLUTION_INTEREST_EXPRESSED`
- `SOLUTION_DEPRECATED`

### Startup Triggers
- `STARTUP_VERIFIED`
- `STARTUP_VERIFICATION_UPDATE`

### Program Triggers
- `PROGRAM_COMPLETED`
- `PROGRAM_ACCEPTED`
- `PROGRAM_REJECTED`
- `WAITLIST_PROMOTED`

### Expert/Matching Triggers
- `EXPERT_CONSULTATION_REQUEST`
- `MATCHMAKER_MATCH`

### Dashboard/Sharing Triggers
- `DASHBOARD_SHARED`

### Communication Triggers
- `ANNOUNCEMENT`
- `PARTNERSHIP_PROPOSAL`

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

### Session 4 (2024-12-13)
12. ✅ `ProgramSelectionWorkflow.jsx` - Program acceptance/rejection emails
13. ✅ `DashboardSharing.jsx` - Dashboard sharing emails
14. ✅ `ExpressInterestButton.jsx` - Solution interest notifications
15. ✅ `SolutionDeprecationWizard.jsx` - Solution deprecation notices
16. ✅ `AnnouncementTargeting.jsx` - Announcement emails
17. ✅ `PartnershipWorkflow.jsx` - Partnership proposal emails
18. ✅ `WaitlistManager.jsx` - Waitlist promotion emails

### Session 5 (2024-12-13)
19. ✅ `AuthContext.jsx` - Welcome email on signup
20. ✅ `base44Client.js` - Updated SendEmail to support triggers
21. ✅ `RDToPilotTransition.jsx` - Pilot created from R&D
22. ✅ `ProgramToPilotWorkflow.jsx` - Pilot created from program
23. ✅ `ChallengeSubmissionWizard.jsx` - Challenge submission confirmation
24. ✅ `SolutionToPilotWorkflow.jsx` - Pilot created from solution
25. ✅ `RDProposalAwardWorkflow.jsx` - Proposal awarded notification

### Session 6 (2024-12-13)
26. ✅ `ExpertOnboarding.jsx` - Expert application notification
27. ✅ `ExpertMatchingEngine.jsx` - Expert assignment notification
28. ✅ `RDProposalEscalationAutomation.jsx` - Escalation notification
29. ✅ `RDProposalSubmissionGate.jsx` - Proposal submission notification
30. ✅ `StartupMentorshipMatcher.jsx` - Mentorship request
31. ✅ `ProgramLaunchWorkflow.jsx` - Program launch notification
32. ✅ `OnboardingWorkflow.jsx` - Onboarding welcome email

### Session 7 (2024-12-13)
33. ✅ `CrossCitySolutionSharing.jsx` - Cross-city solution sharing
34. ✅ `CommitteeMeetingScheduler.jsx` - Committee meeting notifications
35. ✅ `MentorScheduler.jsx` - Mentor session scheduling
36. ✅ `AutomatedCertificateGenerator.jsx` - Certificate email
37. ✅ `BudgetApprovalGate.jsx` - Budget approval/rejection

---

## Special Cases

### EmailTemplateEditorContent.jsx
**Status: ⏭️ Skipped**
- This component tests individual templates directly
- Should keep using direct `send-email` for admin testing
- Not a production email flow

### MasterDevelopmentPrompt.jsx
**Status: ⏭️ Skipped**
- This is documentation/prompt file, not runtime code
- Contains example code snippets for development reference
- Not actual production email calls

### Campaign-related emails
**Status: N/A**
- Campaigns use `campaign-sender` edge function
- Not part of trigger-based system
- Separate workflow

---

## Migration Complete ✅

All production email calls have been migrated to use the unified `email-trigger-hub` edge function.

### Summary
- **37 files migrated** to use `email-trigger-hub`
- **2 files skipped** (testing/documentation purposes)
- **All production email flows** now use the unified trigger system

### Benefits Achieved
1. ✅ Centralized email sending through single edge function
2. ✅ Template management via database
3. ✅ User notification preferences respected
4. ✅ Email queue support for delayed sending
5. ✅ Consistent logging and tracking
6. ✅ Easy trigger-based email configuration

---

*Migration Completed: 2024-12-13*

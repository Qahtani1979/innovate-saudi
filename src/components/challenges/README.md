# Challenges Components

## Overview
Components for the Challenges system - creating, viewing, and managing municipal challenges in the innovation platform.

## Directory Structure

```
src/components/challenges/
├── detail/                      # Challenge detail page components
│   ├── tabs/                    # Tab content components
│   │   ├── ChallengeAITab.jsx
│   │   ├── ChallengeDataTab.jsx
│   │   ├── ChallengeKPIsTab.jsx
│   │   ├── ChallengeOverviewTab.jsx
│   │   ├── ChallengePilotsTab.jsx
│   │   ├── ChallengeProblemTab.jsx
│   │   ├── ChallengeRDTab.jsx
│   │   ├── ChallengeSolutionsTab.jsx
│   │   ├── ChallengeStakeholdersTab.jsx
│   │   └── index.js
│   ├── ChallengeHero.jsx        # Hero section with actions
│   ├── ChallengeSidebar.jsx     # Sidebar with metadata
│   ├── ChallengeStatsCards.jsx  # Key metrics cards
│   ├── ChallengeWorkflowModals.jsx  # Workflow dialogs
│   └── index.js
├── AIChallengeIntakeWizard.jsx  # AI-powered challenge creation
├── ChallengeActivityLog.jsx     # Activity timeline
├── ChallengeComparisonTool.jsx  # Compare multiple challenges
├── ChallengeFollowButton.jsx    # Follow/unfollow challenge
├── ChallengeHealthScore.jsx     # Health score visualization
├── InnovationFramingGenerator.jsx # AI innovation framing
├── ProposalSubmissionForm.jsx   # Submit solution proposals
├── StrategicAlignmentSelector.jsx # Strategic alignment picker
└── README.md
```

## Key Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `ChallengeHero` | Hero section with title, status, and action buttons | `challenge`, `onShow*` callbacks |
| `ChallengeWorkflowModals` | All workflow modals (submit, review, resolve, etc.) | `challenge`, `show*`, `onClose*` |
| `ChallengeActivityLog` | Activity timeline for a challenge | `challengeId` |
| `ChallengeFollowButton` | Follow/unfollow a challenge | `challengeId` |
| `InnovationFramingGenerator` | AI-generated innovation framing | `challenge`, `onFramingGenerated` |
| `ProposalSubmissionForm` | Submit solution proposals | `challengeId`, `onSubmit` |

## Usage Examples

### Challenge Hero with Actions
```jsx
import { ChallengeHero } from '@/components/challenges/detail';

<ChallengeHero 
  challenge={challenge}
  challengeId={challengeId}
  onShowSubmission={() => setShowSubmission(true)}
  onShowReview={() => setShowReview(true)}
  onShowTreatment={() => setShowTreatment(true)}
  onShowResolution={() => setShowResolution(true)}
  onShowArchive={() => setShowArchive(true)}
/>
```

### Follow Button
```jsx
import { ChallengeFollowButton } from '@/components/challenges/ChallengeFollowButton';

<ChallengeFollowButton challengeId={challenge.id} />
```

### Activity Log
```jsx
import { ChallengeActivityLog } from '@/components/challenges/ChallengeActivityLog';

<ChallengeActivityLog challengeId={challenge.id} />
```

## Related Hooks

| Hook | Purpose |
|------|---------|
| `useChallengesWithVisibility` | Visibility-aware challenge data fetching |
| `useAIWithFallback` | AI features with rate limiting fallback |
| `useEntityAccessCheck` | Check if user can access a challenge |

## Related Pages

| Page | Route | Description |
|------|-------|-------------|
| Challenges List | `/challenges` | Browse all challenges |
| Challenge Detail | `/challenge-detail?id=xxx` | View challenge details |
| Challenge Create | `/challenge-create` | Create new challenge |
| Challenge Edit | `/challenge-edit?id=xxx` | Edit existing challenge |

## Workflow States

Challenges follow this workflow:
1. **draft** → Initial state, can be edited
2. **submitted** → Awaiting review
3. **under_review** → Being reviewed
4. **approved** → Ready for treatment
5. **in_treatment** → Being addressed
6. **resolved** → Successfully resolved
7. **archived** → No longer active

## Database Tables

- `challenges` - Main challenge data
- `challenge_activities` - Activity log
- `challenge_attachments` - File attachments
- `challenge_proposals` - Solution proposals
- `challenge_interests` - User interests/follows
- `challenge_solution_matches` - AI-matched solutions

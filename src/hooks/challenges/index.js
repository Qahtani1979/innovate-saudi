/**
 * Challenge Hooks Index
 * Centralized exports for all challenge-related hooks
 * 
 * @version 2.0
 * @updated 2026-01-03
 */

// ============================================================================
// CORE CRUD & DATA HOOKS
// ============================================================================

// Primary data hooks
export { useChallenges, useChallenge, useTopChallenges, useStrategicChallenges } from '../useChallenges';
export { useChallengesWithVisibility, useChallenge as useChallengeWithVisibility } from '../useChallengesWithVisibility';
export { useMyChallenges } from '../useMyChallenges';
export { useChallengesHubData } from '../useChallengesHubData';

// Mutation hooks
export { useChallengeMutations, useChallengeFollow, useChallengeInterest } from '../useChallengeMutations';
export { useChallengeCreateForm } from '../useChallengeCreateForm';
export { useChallengeConversionMutations, useChallengeToRDConversion } from '../useChallengeConversionMutations';

// ============================================================================
// ACTIVITY & METRICS HOOKS
// ============================================================================
export { useChallengeActivities } from '../useChallengeActivities';
export { useChallengeMetrics } from '../useChallengeMetrics';
export { useChallengeTeamStats } from '../useChallengeTeamStats';
export { useChallengeVoting } from '../useChallengeVoting';
export { useChallengeGamification } from '../useChallengeGamification';

// ============================================================================
// PROPOSALS & MATCHING HOOKS
// ============================================================================
export { useChallengeProposals, useChallengeProposalMutations } from '../useChallengeProposals';
export { useChallengeProposalMutations as useChallengeProposalMutationsAlt } from '../useChallengeProposalMutations';
export { useChallengeMatches, useChallengeMatchingMutations } from '../useChallengeMatches';
export { useChallengeInterests } from '../useChallengeInterests';

// ============================================================================
// LINKED DATA & INTEGRATIONS
// ============================================================================
export { useChallengeLinkedData } from '../useChallengeLinkedData';
export { useChallengeIntegrations } from '../useChallengeIntegrations';
export { useChallengeResolutionTracker } from '../useChallengeResolutionTracker';

// ============================================================================
// REALTIME & NOTIFICATIONS
// ============================================================================
export {
  useChallengeRealtime,
  useChallengeListRealtime,
  useChallengeDetailRealtime
} from '../useChallengeRealtime';

export { useChallengeNotifications } from '../useChallengeNotifications';

// ============================================================================
// DELEGATION & PERMISSIONS
// ============================================================================
export {
  useChallengeDelegation,
  CHALLENGE_PERMISSIONS
} from '../useChallengeDelegation';

/**
 * Challenge Hooks Index
 * Centralized exports for all challenge-related hooks
 */

// Core CRUD & Data Hooks
export { useChallengesWithVisibility } from '../useChallengesWithVisibility';
export { useChallengeMutations } from '../useChallengeMutations';
export { useChallengeCreateForm } from '../useChallengeCreateForm';
// Integration Hooks
export { useChallengeIntegrations } from '../useChallengeIntegrations';
export { useChallengeNotifications } from '../useChallengeNotifications';

// Realtime & Delegation
export {
  useChallengeRealtime,
  useChallengeListRealtime,
  useChallengeDetailRealtime
} from '../useChallengeRealtime';

export {
  useChallengeDelegation,
  CHALLENGE_PERMISSIONS
} from '../useChallengeDelegation';

/**
 * Challenge Hooks Index
 * Centralized exports for all challenge-related hooks
 */

// Core CRUD & Data Hooks
export { useChallengesWithVisibility } from './useChallengesWithVisibility';
export { useChallengeMutations } from './useChallengeMutations';
export { useChallengeCreateForm } from './useChallengeCreateForm';
export { useChallengeStorage } from './useChallengeStorage';

// Integration Hooks
export { useChallengeIntegrations } from './useChallengeIntegrations';
export { useChallengeNotifications } from './useChallengeNotifications';

// Realtime & Delegation (NEW)
export { 
  useChallengeRealtime, 
  useChallengeListRealtime, 
  useChallengeDetailRealtime 
} from './useChallengeRealtime';

export { 
  useChallengeDelegation,
  CHALLENGE_PERMISSIONS 
} from './useChallengeDelegation';

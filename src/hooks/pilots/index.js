/**
 * Pilot Hooks Index
 * Centralized exports for all pilot-related hooks
 * 
 * @version 1.0
 * @updated 2026-01-03
 */

// ============================================================================
// CORE CRUD & DATA HOOKS
// ============================================================================

// Primary data hooks
export { 
  usePilot as usePilotBase, 
  usePilotApprovals, 
  usePilotComments, 
  usePilotsList, 
  usePilotKPIs, 
  usePilotStakeholders 
} from '../usePilots';

export { 
  usePilotsWithVisibility, 
  usePilot 
} from '../usePilotsWithVisibility';

export { useMyPilots } from '../useMyPilots';
export { usePublicPilot } from '../usePublicPilot';

// Mutation hooks
export { usePilotMutations } from '../usePilotMutations';

// ============================================================================
// ACTIVITY & AUDIT HOOKS
// ============================================================================
export { usePilotAuditLogger } from '../usePilotAuditLogger';

// ============================================================================
// COLLABORATION & INTEGRATIONS
// ============================================================================
export { usePilotCollaborations } from '../usePilotCollaborations';
export { usePilotIntegrations } from '../usePilotIntegrations';

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export { usePilotNotifications } from '../usePilotNotifications';

// ============================================================================
// CITIZEN ENGAGEMENT
// ============================================================================
export { usePilotEnrollments } from '../useCitizenParticipation';

// ============================================================================
// EXPENSES
// ============================================================================
export { usePilotExpenses } from '../useExpenseMutations';

// ============================================================================
// SCALING
// ============================================================================
export { usePilotScaling } from '../usePilotScaling';
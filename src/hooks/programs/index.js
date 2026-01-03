/**
 * Program Hooks Index
 * Centralized exports for all program-related hooks
 * 
 * @version 1.0
 * @updated 2026-01-03
 */

// ============================================================================
// CORE CRUD & DATA HOOKS
// ============================================================================

// Primary data hooks
export { 
  usePrograms,
  useProgram,
  useProgramApplications,
  useProgramComments,
  useProgramExperts,
  useMyProgramApplications,
  useMyProgramEvents,
  useApplicationsForPrograms,
  useSubmitProgramApplication,
  useSubmitInnovationProposal
} from '../usePrograms';

export { 
  useProgramsWithVisibility 
} from '../useProgramsWithVisibility';

// Single program and details hooks
export { 
  useProgram as useProgramDetail,
  useProgramApplications as useProgramApps,
  useProgramApplication,
  useProgramComments as useProgramCommentsDetail,
  useProgramExperts as useProgramMentors,
  useAllProgramApplications
} from '../useProgramDetails';

// Mutation hooks
export { useProgramMutations } from '../useProgramMutations';

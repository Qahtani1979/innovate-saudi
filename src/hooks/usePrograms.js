import { useProgramsWithVisibility } from './useProgramsWithVisibility';
import {
  useProgram,
  useProgramApplications,
  useProgramComments,
  useProgramExperts,
  useMyProgramApplications,
  useMyProgramEvents,
  useApplicationsForPrograms
} from './useProgramDetails';
import { useProgramMutations } from './useProgramMutations';

/**
 * @deprecated Use useProgramsWithVisibility, useProgramDetails, or useProgramMutations instead.
 * This hook is maintained for backward compatibility during the refactoring process.
 */
export function usePrograms(options = {}) {
  const {
    programs,
    isLoading,
    error,
    refetch
  } = useProgramsWithVisibility(options);

  const mutations = useProgramMutations();

  return {
    // Query
    programs,
    isLoading,
    error,
    refetch,

    // Single program hook
    useProgram,
    useProgramApplications,

    // Mutations (Mapped to legacy names)
    createProgram: mutations.createProgram,
    updateProgram: mutations.updateProgram,
    launchProgram: mutations.startProgram,
    completeProgram: mutations.completeProgram,
    cancelProgram: mutations.cancelProgram,
    deleteProgram: mutations.deleteProgram,
    approveProgram: mutations.approveProgram,
    rejectProgram: mutations.rejectProgram,

    // Mutation states
    isCreating: mutations.isCreating,
    isUpdating: mutations.isUpdating,
    isLaunching: mutations.isStarting,
    isCompleting: mutations.isCompleting,
    isCancelling: mutations.isCancelling,
    isDeleting: mutations.isDeleting
  };
}

// Re-export specific hooks for direct use
export {
  useProgram,
  useProgramApplications,
  useProgramComments,
  useProgramExperts,
  useMyProgramApplications,
  useMyProgramEvents,
  useApplicationsForPrograms
};

// These were specifically in usePrograms.js, keeping them here if not moved yet
// Actually, I'll move them to useProgramDetails.js if they are not there already.
// I'll check useProgramDetails.js first.

export default usePrograms;
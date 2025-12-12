// Visibility and Permission Hooks
// Export all visibility-related hooks for easy importing

export { useEntityVisibility } from './useEntityVisibility';
export { useChallengesWithVisibility } from './useChallengesWithVisibility';
export { usePilotsWithVisibility } from './usePilotsWithVisibility';
export { useProgramsWithVisibility } from './useProgramsWithVisibility';
export { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';

// Re-export permissions hook
export { usePermissions } from '@/components/permissions/usePermissions';

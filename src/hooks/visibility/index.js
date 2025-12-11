// Visibility and Permission Hooks
// Export all visibility-related hooks for easy importing

export { useEntityVisibility } from './useEntityVisibility';
export { useChallengesWithVisibility } from './useChallengesWithVisibility';
export { usePilotsWithVisibility } from './usePilotsWithVisibility';
export { useProgramsWithVisibility } from './useProgramsWithVisibility';

// Note: Import usePermissions directly from '@/components/permissions/usePermissions'
// to avoid circular dependency issues

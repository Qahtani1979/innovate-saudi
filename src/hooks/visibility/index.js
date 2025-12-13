// Visibility and Permission Hooks
// Export all visibility-related hooks for easy importing

// Core visibility system
export { useVisibilitySystem } from './useVisibilitySystem';
export { createVisibilityHook } from './createVisibilityHook';

// Single entity access check
export { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';
export { withEntityAccess } from '@/components/permissions/withEntityAccess';

// Entity-specific hooks (from parent hooks folder)
export { useEntityVisibility } from '@/hooks/useEntityVisibility';
export { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
export { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
export { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
export { usePrograms } from '@/hooks/usePrograms';
export { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';
export { useLivingLabsWithVisibility } from '@/hooks/useLivingLabsWithVisibility';
export { useContractsWithVisibility } from '@/hooks/useContractsWithVisibility';
export { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';
export { useKnowledgeWithVisibility } from '@/hooks/useKnowledgeWithVisibility';
export { useCaseStudiesWithVisibility } from '@/hooks/useCaseStudiesWithVisibility';
export { useBudgetsWithVisibility } from '@/hooks/useBudgetsWithVisibility';
export { useProposalsWithVisibility } from '@/hooks/useProposalsWithVisibility';

// Additional visibility-aware hooks
export { useUsersWithVisibility } from '@/hooks/useUsersWithVisibility';
export { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';
export { useOrganizationsWithVisibility } from '@/hooks/useOrganizationsWithVisibility';
export { useVisibilityAwareSearch } from '@/hooks/useVisibilityAwareSearch';

// Re-export permissions hook
export { usePermissions } from '@/components/permissions/usePermissions';

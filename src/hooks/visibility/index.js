// Visibility and Permission Hooks
// Export all visibility-related hooks for easy importing

// Core visibility system
export { useVisibilitySystem } from './useVisibilitySystem';
export { createVisibilityHook } from './createVisibilityHook';

// Entity-specific hooks (from parent hooks folder)
export { useEntityVisibility } from '@/hooks/useEntityVisibility';
export { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
export { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
export { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
export { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';
export { useLivingLabsWithVisibility } from '@/hooks/useLivingLabsWithVisibility';
export { useContractsWithVisibility } from '@/hooks/useContractsWithVisibility';
export { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';
export { useKnowledgeWithVisibility } from '@/hooks/useKnowledgeWithVisibility';
export { useCaseStudiesWithVisibility } from '@/hooks/useCaseStudiesWithVisibility';
export { useBudgetsWithVisibility } from '@/hooks/useBudgetsWithVisibility';
export { useProposalsWithVisibility } from '@/hooks/useProposalsWithVisibility';

// Re-export permissions hook
export { usePermissions } from '@/components/permissions/usePermissions';

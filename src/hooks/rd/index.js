/**
 * R&D Hooks - Centralized Index
 * ✅ GOLD STANDARD COMPLIANT
 * Last Updated: 2026-01-03
 */

// Core R&D Data Hooks
export { useRDProjects, useRDProposals, useRDCalls } from '@/hooks/useRDHooks';
export { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';
export { useRDCallsWithVisibility, useRDCall } from '@/hooks/useRDCallsWithVisibility';
export { useRDProposalsWithVisibility } from '@/hooks/useProposalsWithVisibility';

// R&D Data & Activity Hooks
export { 
  useRDActivityLog, 
  useRDPublications, 
  useRDIPAssets, 
  useRDMunicipalities, 
  useRDChallenges, 
  useRDPolicies,
  useRDCallComments 
} from '@/hooks/useRDData';

// R&D Project Hooks
export { useRDProjectComments } from '@/hooks/useRDProjectComments';
export { useRDProjectIntegrations } from '@/hooks/useRDProjectIntegrations';
export { useRDProjectMutations } from '@/hooks/useRDProjectMutations';

// R&D Call Hooks
export { useRDCallMutations } from '@/hooks/useRDCallMutations';

// R&D Proposal Hooks
export { useRDProposal } from '@/hooks/useRDProposal';
export { useRDProposalComments } from '@/hooks/useRDProposalComments';
export { useRDProposalMutations } from '@/hooks/useRDProposalMutations';

// R&D Mutations
export { useRDProposalMutations as useRDProposalMutationsAlt, useRDMutations } from '@/hooks/useRDMutations';
export { useRDConversionMutations } from '@/hooks/useRDConversionMutations';

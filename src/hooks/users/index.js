/**
 * User & Organization Hooks Index
 * Centralized exports for all user and organization-related hooks
 * 
 * @version 1.0
 * @updated 2026-01-03
 */

// ============================================================================
// USER PROFILE HOOKS
// ============================================================================
export { 
  useUserProfile, 
  useAllUserProfiles, 
  useUserProfileById 
} from '../useUserProfiles';

// ============================================================================
// USER ROLES & RBAC HOOKS
// ============================================================================
export { useUserRoles } from '../useRBACManager';
export { useUserRoleMutations } from '../useUserRoleMutations';
export { useRoles } from '../useRoles';
export { useRoleMutations } from '../useRoleMutations';
export { useRolePermissions } from '../useRolePermissions';
export { useRoleRequests } from '../useRoleRequests';

// ============================================================================
// USER ACTIVITY & PREFERENCES
// ============================================================================
export { useUserFollows } from '../useUserFollows';
export { useMyDelegation } from '../useMyDelegation';
export { useMyBookmarks } from '../useMyBookmarks';
export { useMyWork } from '../useMyWork';
export { useMyWorkload } from '../useMyWorkload';

// ============================================================================
// ORGANIZATION HOOKS
// ============================================================================
export { 
  useOrganization, 
  useOrganizationSolutions, 
  useOrganizationPilots, 
  useOrganizationRDProjects, 
  useOrganizationPrograms 
} from '../useOrganization';

export { 
  useOrganizations, 
  useOrganizationsList, 
  useOrganizationLeaderboard, 
  useOrganizationByOwner, 
  useOrganizationById, 
  useOrganizationPartnerships 
} from '../useOrganizations';

export { useOrganizationsWithVisibility } from '../useOrganizationsWithVisibility';
export { useOrganizationMutations } from '../useOrganizationMutations';
export { useOrganizationActivity } from '../useOrganizationActivity';
export { useOrganizationReputation } from '../useOrganizationReputation';
export { useOrganizationVerificationData } from '../useOrganizationVerificationData';

// ============================================================================
// MUNICIPALITY HOOKS
// ============================================================================
export { useMunicipalities } from '../useMunicipalities';
export { useMunicipalitiesWithVisibility } from '../useMunicipalitiesWithVisibility';
export { useMunicipalityMutations } from '../useMunicipalityMutations';
export { useMunicipalityProfileData } from '../useMunicipalityProfileData';
export { useMunicipalAnalysis } from '../useMunicipalAnalysis';
export { useMunicipalImpact } from '../useMunicipalImpact';

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================
export { useAuthMutations } from '../useAuthMutations';
export { useAuthQueries } from '../useAuthQueries';

// ============================================================================
// SESSION & ACCESS HOOKS
// ============================================================================
export { useSessionManagement } from '../useSessionManagement';
export { useAccessControl } from '../useAccessControl';
export { useEntityAccessCheck } from '../useEntityAccessCheck';

/**
 * Hook to check if the current user can access a specific entity
 * Used for detail pages to verify visibility before showing content
 */

import { useMemo } from 'react';
import { usePermissions } from '@/components/permissions/usePermissions';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';

/**
 * Check if user can access a specific entity based on visibility rules
 * 
 * @param {object} entity - The entity to check access for
 * @param {object} options - Configuration options
 * @param {string} options.municipalityColumn - Column name for municipality_id (default: 'municipality_id')
 * @param {string} options.sectorColumn - Column name for sector_id (default: 'sector_id')
 * @param {string} options.ownerColumn - Column name for owner (default: 'created_by')
 * @param {string} options.publishedColumn - Column name for published status (default: 'is_published')
 * @param {string} options.statusColumn - Column name for status (default: 'status')
 * @param {array} options.publicStatuses - Status values considered public (default: ['published', 'active', 'completed'])
 * @returns {object} - Access check result
 */
export function useEntityAccessCheck(entity, options = {}) {
  const {
    municipalityColumn = 'municipality_id',
    sectorColumn = 'sector_id',
    ownerColumn = 'created_by',
    publishedColumn = 'is_published',
    statusColumn = 'status',
    publicStatuses = ['published', 'active', 'completed'],
    providerColumn = 'provider_id'
  } = options;

  const { isAdmin, userId } = usePermissions();
  const {
    isLoading: visibilityLoading,
    hasFullVisibility,
    isNational,
    sectorIds,
    userMunicipalityId,
    nationalMunicipalityIds,
    visibilityLevel
  } = useVisibilitySystem();
  
  // Get provider ID from user roles
  const userProviderId = null; // Provider ID comes from organization linkage if needed

  const accessCheck = useMemo(() => {
    // Still loading visibility data
    if (visibilityLoading || !entity) {
      return {
        canAccess: false,
        isLoading: true,
        reason: 'loading',
        visibilityLevel
      };
    }

    // Admin/Global visibility - can access everything
    if (isAdmin || hasFullVisibility) {
      return {
        canAccess: true,
        isLoading: false,
        reason: 'admin_access',
        visibilityLevel: 'global'
      };
    }

    // Check if entity is published/public
    const isPublished = entity[publishedColumn] === true;
    const isPublicStatus = publicStatuses.includes(entity[statusColumn]);

    // Provider access - can see own entities
    if (userProviderId && entity[providerColumn] === userProviderId) {
      return {
        canAccess: true,
        isLoading: false,
        reason: 'owner_access',
        visibilityLevel: 'organizational'
      };
    }

    // Creator access - can see own entities
    if (userId && entity[ownerColumn] === userId) {
      return {
        canAccess: true,
        isLoading: false,
        reason: 'creator_access',
        visibilityLevel: 'organizational'
      };
    }

    // National/Sectoral visibility - check sector match
    if (isNational && sectorIds?.length > 0) {
      const entitySectorId = entity[sectorColumn];
      if (entitySectorId && sectorIds.includes(entitySectorId)) {
        return {
          canAccess: true,
          isLoading: false,
          reason: 'sectoral_access',
          visibilityLevel: 'sectoral'
        };
      }
    }

    // Geographic visibility - check municipality match
    if (userMunicipalityId) {
      const entityMunicipalityId = entity[municipalityColumn];
      
      // Own municipality access
      if (entityMunicipalityId === userMunicipalityId) {
        return {
          canAccess: true,
          isLoading: false,
          reason: 'municipality_access',
          visibilityLevel: 'geographic'
        };
      }

      // National entity access
      if (nationalMunicipalityIds?.includes(entityMunicipalityId)) {
        return {
          canAccess: true,
          isLoading: false,
          reason: 'national_entity_access',
          visibilityLevel: 'geographic'
        };
      }
    }

    // Public access - only if published
    if (isPublished || isPublicStatus) {
      return {
        canAccess: true,
        isLoading: false,
        reason: 'public_access',
        visibilityLevel: 'public'
      };
    }

    // No access
    return {
      canAccess: false,
      isLoading: false,
      reason: 'no_access',
      visibilityLevel: 'none'
    };
  }, [
    entity,
    visibilityLoading,
    isAdmin,
    hasFullVisibility,
    isNational,
    sectorIds,
    userMunicipalityId,
    nationalMunicipalityIds,
    userId,
    userProviderId,
    municipalityColumn,
    sectorColumn,
    ownerColumn,
    publishedColumn,
    statusColumn,
    publicStatuses,
    providerColumn,
    visibilityLevel
  ]);

  return accessCheck;
}

export default useEntityAccessCheck;

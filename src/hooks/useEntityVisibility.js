import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/components/permissions/usePermissions';

/**
 * Hook for entity visibility filtering based on user's organizational scope.
 * 
 * Visibility Rules:
 * - Platform Admin: See all records
 * - National Deputyship: See all records in their sector(s) across all municipalities
 * - Geographic Municipality: See own records + all national-level records
 * - Other roles (Provider, Expert, etc.): Use entity-specific rules
 */
export function useEntityVisibility() {
  const { userId, isAdmin, hasRole } = usePermissions();

  // Get user's visibility scope from database
  const { data: visibilityScope, isLoading } = useQuery({
    queryKey: ['user-visibility-scope', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_visibility_scope', { p_user_id: userId });
      
      if (error) {
        console.error('Error fetching visibility scope:', error);
        return null;
      }
      
      return data?.[0] || null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get the National region ID for queries
  const { data: nationalRegion } = useQuery({
    queryKey: ['national-region'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('id')
        .eq('code', 'NATIONAL')
        .single();
      
      if (error) return null;
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const isNational = visibilityScope?.is_national || false;
  const scopeType = isAdmin ? 'global' : (visibilityScope?.scope_type || 'none');
  const sectorIds = visibilityScope?.sector_ids || [];
  const userMunicipalityId = visibilityScope?.municipality_id;

  /**
   * Check if user can view a specific entity
   */
  const canViewEntity = async (entityMunicipalityId, entitySectorId) => {
    if (isAdmin) return true;
    if (!userId) return false;

    const { data, error } = await supabase
      .rpc('can_view_entity', {
        p_user_id: userId,
        p_entity_municipality_id: entityMunicipalityId,
        p_entity_sector_id: entitySectorId
      });

    if (error) {
      console.error('Error checking entity visibility:', error);
      return false;
    }

    return data;
  };

  /**
   * Build a Supabase query with visibility filters applied
   * @param {Object} query - Supabase query builder
   * @param {Object} options - Configuration options
   * @param {string} options.municipalityColumn - Column name for municipality_id (default: 'municipality_id')
   * @param {string} options.sectorColumn - Column name for sector_id (default: 'sector_id')
   */
  const applyVisibilityFilter = (query, options = {}) => {
    const { 
      municipalityColumn = 'municipality_id',
      sectorColumn = 'sector_id'
    } = options;

    // Admin sees everything
    if (isAdmin) {
      return query;
    }

    // No visibility scope means no access to scoped data
    if (!visibilityScope) {
      return query.eq(municipalityColumn, '00000000-0000-0000-0000-000000000000'); // Return nothing
    }

    // National deputyship: Filter by sector
    if (isNational && sectorIds.length > 0) {
      return query.in(sectorColumn, sectorIds);
    }

    // Geographic municipality: Own + national
    if (userMunicipalityId) {
      // This requires a more complex query - we need to check if municipality is national
      // For now, we return own municipality and let the component handle national separately
      return query.or(`${municipalityColumn}.eq.${userMunicipalityId}`);
    }

    return query;
  };

  /**
   * Get filter parameters for manual query building
   */
  const getVisibilityParams = () => {
    if (isAdmin) {
      return { type: 'all' };
    }

    if (!visibilityScope) {
      return { type: 'none' };
    }

    if (isNational) {
      return {
        type: 'sectoral',
        sectorIds: sectorIds
      };
    }

    return {
      type: 'geographic',
      municipalityId: userMunicipalityId,
      nationalRegionId: nationalRegion?.id
    };
  };

  /**
   * Check if user is a deputyship user
   */
  const isDeputyship = isNational || hasRole('deputyship_admin') || hasRole('deputyship_staff');

  /**
   * Check if user is a municipality user
   */
  const isMunicipality = !isNational && (
    hasRole('municipality_admin') || 
    hasRole('municipality_staff') || 
    hasRole('municipality_coordinator')
  );

  return {
    // State
    isLoading,
    visibilityScope,
    
    // Derived values
    isNational,
    isDeputyship,
    isMunicipality,
    scopeType,
    sectorIds,
    userMunicipalityId,
    nationalRegionId: nationalRegion?.id,
    
    // Functions
    canViewEntity,
    applyVisibilityFilter,
    getVisibilityParams,
  };
}

export default useEntityVisibility;

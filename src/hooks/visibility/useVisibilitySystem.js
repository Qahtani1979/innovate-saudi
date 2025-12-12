/**
 * COMPREHENSIVE VISIBILITY SYSTEM
 * ================================
 * 
 * This system provides consistent visibility control across all entity types
 * (challenges, pilots, programs, solutions, living labs, contracts, budgets, etc.)
 * 
 * VISIBILITY LEVELS:
 * ==================
 * 1. GLOBAL (Admin)
 *    - Platform admins see everything
 *    - Users with visibility_all_municipalities permission
 *    - Users with visibility_all_sectors permission
 * 
 * 2. SECTORAL (National Deputyship)
 *    - See all entities within their assigned sector(s) across ALL municipalities
 *    - See national-level entities
 *    - Can see cross-municipality data within their sector domain
 * 
 * 3. GEOGRAPHIC (Municipality Staff)
 *    - See their own municipality's entities
 *    - See national-level entities (entities from NATIONAL region)
 *    - Cannot see other municipalities' entities
 * 
 * 4. ORGANIZATIONAL (Providers/Organizations)
 *    - See entities they own/created
 *    - See entities linked to their organization
 *    - See public/published entities
 * 
 * 5. PUBLIC (Unauthenticated/Basic Users)
 *    - Only see published/public entities
 *    - Limited to active/approved content
 * 
 * ENTITY TYPES COVERED:
 * ====================
 * - Challenges
 * - Pilots
 * - Programs
 * - Solutions
 * - Living Labs
 * - R&D Projects
 * - Contracts
 * - Budgets
 * - Case Studies
 * - Knowledge Documents
 * - Proposals
 * 
 * DATABASE FUNCTIONS:
 * ==================
 * - get_user_visibility_scope(p_user_id) - Returns user's scope type, municipality, sectors
 * - can_view_entity(p_user_id, p_entity_municipality_id, p_entity_sector_id) - Check access
 * - is_national_entity(p_municipality_id) - Check if municipality is in NATIONAL region
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/components/permissions/usePermissions';

/**
 * Core visibility hook that provides all visibility context
 */
export function useVisibilitySystem() {
  const { 
    userId, 
    isAdmin, 
    hasRole, 
    hasPermission,
    isDeputyship,
    isMunicipality,
    isStaffUser,
    userMunicipality
  } = usePermissions();

  // Check for full-visibility permissions
  const hasFullMunicipalityVisibility = hasPermission('visibility_all_municipalities');
  const hasFullSectorVisibility = hasPermission('visibility_all_sectors');
  const hasNationalVisibility = hasPermission('visibility_national');
  
  // Full visibility if admin or has full visibility permissions
  const hasFullVisibility = isAdmin || hasFullMunicipalityVisibility || hasFullSectorVisibility;

  // Get user's visibility scope from database
  const { data: visibilityScope, isLoading: scopeLoading } = useQuery({
    queryKey: ['visibility-scope', userId],
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
  const { data: nationalRegion, isLoading: regionLoading } = useQuery({
    queryKey: ['national-region-id'],
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

  // Get national municipalities for filtering
  const { data: nationalMunicipalities = [] } = useQuery({
    queryKey: ['national-municipalities', nationalRegion?.id],
    queryFn: async () => {
      if (!nationalRegion?.id) return [];
      
      const { data, error } = await supabase
        .from('municipalities')
        .select('id')
        .eq('region_id', nationalRegion.id);
      
      if (error) return [];
      return data || [];
    },
    enabled: !!nationalRegion?.id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const nationalMunicipalityIds = nationalMunicipalities.map(m => m.id);

  // Derived values
  const isNational = visibilityScope?.is_national || false;
  const sectorIds = visibilityScope?.sector_ids || [];
  const userMunicipalityId = visibilityScope?.municipality_id || userMunicipality?.id;
  const scopeType = hasFullVisibility ? 'global' : 
                    isNational ? 'sectoral' : 
                    userMunicipalityId ? 'geographic' : 'public';

  const isLoading = scopeLoading || regionLoading;

  /**
   * Determine visibility level for current user
   */
  const getVisibilityLevel = () => {
    if (hasFullVisibility) return 'global';
    if (isDeputyship || isNational) return 'sectoral';
    if (isMunicipality || userMunicipalityId) return 'geographic';
    if (hasRole('provider') || hasRole('startup') || hasRole('academia')) return 'organizational';
    return 'public';
  };

  /**
   * Get visibility parameters for query building
   */
  const getVisibilityParams = () => {
    const level = getVisibilityLevel();
    
    return {
      level,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      nationalMunicipalityIds,
      nationalRegionId: nationalRegion?.id
    };
  };

  /**
   * Build entity query with visibility filters
   * @param {string} tableName - The Supabase table name
   * @param {string} selectClause - The select clause
   * @param {object} options - Query options
   */
  const buildVisibilityQuery = (tableName, selectClause, options = {}) => {
    const {
      municipalityColumn = 'municipality_id',
      sectorColumn = 'sector_id',
      publishedColumn = 'is_published',
      deletedColumn = 'is_deleted',
      includeDeleted = false,
      publishedOnly = false,
      additionalFilters = {}
    } = options;

    let query = supabase
      .from(tableName)
      .select(selectClause);

    // Apply deleted filter
    if (!includeDeleted && deletedColumn) {
      query = query.eq(deletedColumn, false);
    }

    // Apply additional filters
    Object.entries(additionalFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        query = query.eq(key, value);
      }
    });

    return query;
  };

  /**
   * Fetch entities with visibility applied
   * Generic function for any entity type
   */
  const fetchWithVisibility = async (tableName, selectClause, options = {}) => {
    const {
      municipalityColumn = 'municipality_id',
      sectorColumn = 'sector_id',
      publishedColumn = 'is_published',
      deletedColumn = 'is_deleted',
      includeDeleted = false,
      limit = 100,
      orderBy = 'created_at',
      orderAscending = false,
      additionalFilters = {}
    } = options;

    const params = getVisibilityParams();

    // Build base query
    let query = supabase
      .from(tableName)
      .select(selectClause)
      .order(orderBy, { ascending: orderAscending })
      .limit(limit);

    // Apply deleted filter
    if (!includeDeleted && deletedColumn) {
      query = query.eq(deletedColumn, false);
    }

    // Apply additional filters
    Object.entries(additionalFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // GLOBAL visibility - return all
    if (params.hasFullVisibility) {
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    // SECTORAL visibility (National Deputyship)
    if (params.level === 'sectoral' && params.sectorIds?.length > 0) {
      query = query.in(sectorColumn, params.sectorIds);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    // GEOGRAPHIC visibility (Municipality Staff)
    if (params.level === 'geographic' && params.userMunicipalityId) {
      // Get own municipality entities
      const ownQuery = supabase
        .from(tableName)
        .select(selectClause)
        .eq(municipalityColumn, params.userMunicipalityId)
        .order(orderBy, { ascending: orderAscending });
      
      if (!includeDeleted && deletedColumn) {
        ownQuery.eq(deletedColumn, false);
      }

      const { data: ownData, error: ownError } = await ownQuery;
      if (ownError) throw ownError;

      // Get national entities
      let nationalData = [];
      if (params.nationalMunicipalityIds?.length > 0) {
        const nationalQuery = supabase
          .from(tableName)
          .select(selectClause)
          .in(municipalityColumn, params.nationalMunicipalityIds)
          .order(orderBy, { ascending: orderAscending });
        
        if (!includeDeleted && deletedColumn) {
          nationalQuery.eq(deletedColumn, false);
        }

        const { data: natData, error: natError } = await nationalQuery;
        if (!natError) {
          nationalData = natData || [];
        }
      }

      // Combine and deduplicate
      const allData = [...(ownData || []), ...nationalData];
      const uniqueData = allData.filter((item, index, self) =>
        index === self.findIndex(i => i.id === item.id)
      );

      // Apply additional filters client-side
      let filtered = uniqueData;
      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'all') {
          filtered = filtered.filter(item => item[key] === value);
        }
      });

      return filtered.slice(0, limit);
    }

    // PUBLIC visibility - only published
    if (publishedColumn) {
      query = query.eq(publishedColumn, true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  return {
    // Loading state
    isLoading,
    
    // Visibility context
    visibilityLevel: getVisibilityLevel(),
    scopeType,
    hasFullVisibility,
    isNational,
    isDeputyship,
    isMunicipality,
    
    // Scope data
    sectorIds,
    userMunicipalityId,
    nationalMunicipalityIds,
    nationalRegionId: nationalRegion?.id,
    
    // Functions
    getVisibilityLevel,
    getVisibilityParams,
    buildVisibilityQuery,
    fetchWithVisibility
  };
}

export default useVisibilitySystem;

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

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Core visibility hook that provides all visibility context
 */
export function useVisibilitySystem() {
  // Get permissions data first - this hook handles auth state gracefully
  const permissionsData = usePermissions();

  const {
    userId = null,
    isAdmin = false,
    hasRole = () => false,
    hasPermission = () => false,
    isDeputyship = false,
    isMunicipality = false,
    isStaffUser = false,
    userMunicipality = null
  } = permissionsData || {};

  // Check for full-visibility permissions
  const hasFullMunicipalityVisibility = hasPermission('visibility_all_municipalities');
  const hasFullSectorVisibility = hasPermission('visibility_all_sectors');
  const hasNationalVisibility = hasPermission('visibility_national');

  // Full visibility if admin or has full visibility permissions
  const hasFullVisibility = isAdmin || hasFullMunicipalityVisibility || hasFullSectorVisibility;

  // User's visibility scope from database
  const [visibilityScope, setVisibilityScope] = useState(null);
  const [scopeLoading, setScopeLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadScope = async () => {
      if (!userId) {
        if (isMounted) {
          setVisibilityScope(null);
          setScopeLoading(false);
        }
        return;
      }

      setScopeLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_user_visibility_scope', { p_user_id: userId });

        if (!isMounted) return;

        if (error) {
          console.error('Error fetching visibility scope:', error);
          setVisibilityScope(null);
        } else {
          setVisibilityScope(data?.[0] || null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching visibility scope:', err);
          setVisibilityScope(null);
        }
      } finally {
        if (isMounted) {
          setScopeLoading(false);
        }
      }
    };

    loadScope();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // National region ID for queries
  const [nationalRegion, setNationalRegion] = useState(null);
  const [regionLoading, setRegionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRegion = async () => {
      setRegionLoading(true);
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('id')
          .eq('code', 'NATIONAL')
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error('Error fetching national region:', error);
          setNationalRegion(null);
        } else {
          setNationalRegion(data || null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching national region:', err);
          setNationalRegion(null);
        }
      } finally {
        if (isMounted) {
          setRegionLoading(false);
        }
      }
    };

    loadRegion();

    return () => {
      isMounted = false;
    };
  }, []);

  // National municipalities for filtering
  const [nationalMunicipalities, setNationalMunicipalities] = useState([]);
  const [nationalMunicipalitiesLoading, setNationalMunicipalitiesLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadMunicipalities = async () => {
      if (!nationalRegion?.id) {
        if (isMounted) {
          setNationalMunicipalities([]);
          setNationalMunicipalitiesLoading(false);
        }
        return;
      }

      setNationalMunicipalitiesLoading(true);
      try {
        const { data, error } = await supabase
          .from('municipalities')
          .select('id')
          .eq('region_id', nationalRegion.id);

        if (!isMounted) return;

        if (error) {
          console.error('Error fetching national municipalities:', error);
          setNationalMunicipalities([]);
        } else {
          setNationalMunicipalities(data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching national municipalities:', err);
          setNationalMunicipalities([]);
        }
      } finally {
        if (isMounted) {
          setNationalMunicipalitiesLoading(false);
        }
      }
    };

    loadMunicipalities();

    return () => {
      isMounted = false;
    };
  }, [nationalRegion?.id]);

  const nationalMunicipalityIds = nationalMunicipalities.map(m => m.id);

  // Derived values
  const isNational = visibilityScope?.is_national || false;
  const sectorIds = visibilityScope?.sector_ids || [];
  const userMunicipalityId = visibilityScope?.municipality_id || userMunicipality?.id;
  const scopeType = hasFullVisibility ? 'global' :
    isNational ? 'sectoral' :
      userMunicipalityId ? 'geographic' : 'public';

  const isLoading = scopeLoading || regionLoading || nationalMunicipalitiesLoading;

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
        if (typeof value === 'object' && value !== null && 'operator' in value && 'value' in value) {
          query = query.filter(key, value.operator, value.value);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
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
      additionalFilters = {},
      // Pagination Options
      range = null, // { start: 0, end: 9 }
      count = null  // 'exact', 'planned', or 'estimated'
    } = options;

    const params = getVisibilityParams();

    // Prepare Count Option
    const countOption = count ? { count } : {};

    // Build base query
    let query = supabase
      .from(tableName)
      .select(selectClause, countOption);

    // Apply Range (Pagination) OR Limit
    if (range && typeof range.start === 'number' && typeof range.end === 'number') {
      query = query.range(range.start, range.end);
    } else {
      query = query.limit(limit);
    }

    // Always apply Order
    query = query.order(orderBy, { ascending: orderAscending });

    // Apply deleted filter
    if (!includeDeleted && deletedColumn) {
      query = query.eq(deletedColumn, false);
    }

    // Apply additional filters
    Object.entries(additionalFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        if (typeof value === 'object' && value !== null && 'operator' in value && 'value' in value) {
          query = query.filter(key, value.operator, value.value);
        } else if (Array.isArray(value)) {
          // Handle array range filters (e.g. for dates or numbers) if needed, 
          // but standard strict equality is default
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // GLOBAL visibility - return all (filtered)
    if (params.hasFullVisibility) {
      const { data, error, count: totalCount } = await query;
      if (error) throw error;
      return count ? { data: data || [], count: totalCount } : (data || []);
    }

    // SECTORAL visibility (National Deputyship)
    if (params.level === 'sectoral' && params.sectorIds?.length > 0) {
      query = query.in(sectorColumn, params.sectorIds);
      const { data, error, count: totalCount } = await query;
      if (error) throw error;
      return count ? { data: data || [], count: totalCount } : (data || []);
    }

    // GEOGRAPHIC visibility (Municipality Staff)
    if (params.level === 'geographic' && params.userMunicipalityId) {
      // NOTE: Complex OR queries (Own OR National) are hard to paginate deeply 
      // perfectly on the server without a View or RPC. 
      // For now, we apply the OR logic using Supabase's 'or' filter syntax if possible,
      // OR we fallback to client-side logic (which breaks deep pagination).

      // STRATEGY: Use Supabase OR syntax to keep it server-side for pagination 
      // scope = (municipality_id = X) OR (municipality_id IN [Nationals])

      let orConditions = `${municipalityColumn}.eq.${params.userMunicipalityId}`;

      if (params.nationalMunicipalityIds?.length > 0) {
        const nationalIdsString = `(${params.nationalMunicipalityIds.join(',')})`;
        orConditions += `,${municipalityColumn}.in.${nationalIdsString}`;
      }

      query = query.or(orConditions);

      const { data, error, count: totalCount } = await query;
      if (error) throw error;
      return count ? { data: data || [], count: totalCount } : (data || []);
    }

    // PUBLIC visibility
    if (publishedColumn) {
      query = query.eq(publishedColumn, true);
    }

    const { data, error, count: totalCount } = await query;
    if (error) throw error;

    return count ? { data: data || [], count: totalCount } : (data || []);
  };

  /**
   * Filter entities by strategic plan IDs (client-side helper)
   * @param {Array} entities - Array of entities to filter
   * @param {Array} strategicPlanIds - Strategic plan IDs to filter by
   * @param {string} columnName - Column name containing strategic plan IDs
   */
  const filterByStrategicPlan = (entities, strategicPlanIds, columnName = 'strategic_plan_ids') => {
    if (!strategicPlanIds?.length) return entities;
    return entities.filter(entity => {
      const entityPlanIds = entity[columnName] || [];
      return strategicPlanIds.some(id => entityPlanIds.includes(id));
    });
  };

  /**
   * Filter entities by strategic objective IDs (client-side helper)
   * @param {Array} entities - Array of entities to filter
   * @param {Array} objectiveIds - Strategic objective IDs to filter by
   * @param {string} columnName - Column name containing objective IDs
   */
  const filterByStrategicObjective = (entities, objectiveIds, columnName = 'strategic_objective_ids') => {
    if (!objectiveIds?.length) return entities;
    return entities.filter(entity => {
      const entityObjectiveIds = entity[columnName] || [];
      return objectiveIds.some(id => entityObjectiveIds.includes(id));
    });
  };

  /**
   * Filter to only strategy-derived entities (client-side helper)
   * @param {Array} entities - Array of entities to filter
   * @param {string} columnName - Column name for is_strategy_derived flag
   */
  const filterStrategyDerived = (entities, columnName = 'is_strategy_derived') => {
    return entities.filter(entity => entity[columnName] === true);
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
    fetchWithVisibility,

    // Strategic filtering helpers
    filterByStrategicPlan,
    filterByStrategicObjective,
    filterStrategyDerived
  };
}

export default useVisibilitySystem;

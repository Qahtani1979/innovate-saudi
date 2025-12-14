/**
 * VISIBILITY SYSTEM WITH STRATEGIC PLAN FILTERING
 * ================================================
 * 
 * Extends the core visibility system with strategic plan awareness.
 * Allows filtering entities by strategic plan alignment.
 * 
 * FEATURES:
 * - Filter entities by strategic plan IDs
 * - Filter by strategic objective IDs
 * - Filter strategy-derived entities only
 * - Combine with geographic/sectoral visibility
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './useVisibilitySystem';

/**
 * Visibility hook with strategic plan filtering
 */
export function useVisibilityWithStrategy() {
  const visibilitySystem = useVisibilitySystem();
  
  const {
    hasFullVisibility,
    userMunicipalityId,
    nationalMunicipalityIds,
    sectorIds,
    isNational,
    getVisibilityParams
  } = visibilitySystem;

  /**
   * Fetch entities filtered by strategic plan
   * @param {string} tableName - The Supabase table name
   * @param {string} selectClause - The select clause
   * @param {object} options - Query options including strategic filters
   */
  const fetchWithStrategyFilter = useCallback(async (tableName, selectClause, options = {}) => {
    const {
      strategicPlanIds = [],
      strategicObjectiveIds = [],
      onlyStrategyDerived = false,
      municipalityColumn = 'municipality_id',
      sectorColumn = 'sector_id',
      strategicPlanColumn = 'strategic_plan_ids',
      strategicObjectiveColumn = 'strategic_objective_ids',
      strategyDerivedColumn = 'is_strategy_derived',
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

    // Apply strategy-derived filter
    if (onlyStrategyDerived && strategyDerivedColumn) {
      query = query.eq(strategyDerivedColumn, true);
    }

    // Apply strategic plan filter using overlaps (for array columns)
    if (strategicPlanIds.length > 0 && strategicPlanColumn) {
      query = query.overlaps(strategicPlanColumn, strategicPlanIds);
    }

    // Apply strategic objective filter
    if (strategicObjectiveIds.length > 0 && strategicObjectiveColumn) {
      query = query.overlaps(strategicObjectiveColumn, strategicObjectiveIds);
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

    // GLOBAL visibility - return all with strategy filters
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
      // Build own municipality query with strategy filters
      let ownQuery = supabase
        .from(tableName)
        .select(selectClause)
        .eq(municipalityColumn, params.userMunicipalityId)
        .order(orderBy, { ascending: orderAscending });
      
      if (!includeDeleted && deletedColumn) {
        ownQuery = ownQuery.eq(deletedColumn, false);
      }

      if (onlyStrategyDerived && strategyDerivedColumn) {
        ownQuery = ownQuery.eq(strategyDerivedColumn, true);
      }

      if (strategicPlanIds.length > 0 && strategicPlanColumn) {
        ownQuery = ownQuery.overlaps(strategicPlanColumn, strategicPlanIds);
      }

      if (strategicObjectiveIds.length > 0 && strategicObjectiveColumn) {
        ownQuery = ownQuery.overlaps(strategicObjectiveColumn, strategicObjectiveIds);
      }

      const { data: ownData, error: ownError } = await ownQuery;
      if (ownError) throw ownError;

      // Get national entities with same strategy filters
      let nationalData = [];
      if (params.nationalMunicipalityIds?.length > 0) {
        let nationalQuery = supabase
          .from(tableName)
          .select(selectClause)
          .in(municipalityColumn, params.nationalMunicipalityIds)
          .order(orderBy, { ascending: orderAscending });
        
        if (!includeDeleted && deletedColumn) {
          nationalQuery = nationalQuery.eq(deletedColumn, false);
        }

        if (onlyStrategyDerived && strategyDerivedColumn) {
          nationalQuery = nationalQuery.eq(strategyDerivedColumn, true);
        }

        if (strategicPlanIds.length > 0 && strategicPlanColumn) {
          nationalQuery = nationalQuery.overlaps(strategicPlanColumn, strategicPlanIds);
        }

        if (strategicObjectiveIds.length > 0 && strategicObjectiveColumn) {
          nationalQuery = nationalQuery.overlaps(strategicObjectiveColumn, strategicObjectiveIds);
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

      return uniqueData.slice(0, limit);
    }

    // PUBLIC visibility - only published with strategy filters
    if (publishedColumn) {
      query = query.eq(publishedColumn, true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }, [getVisibilityParams]);

  /**
   * Get entities aligned to a specific strategic plan
   * @param {string} tableName - The table to query
   * @param {string} planId - The strategic plan ID
   * @param {object} options - Additional query options
   */
  const getEntitiesForPlan = useCallback(async (tableName, planId, options = {}) => {
    return fetchWithStrategyFilter(tableName, options.selectClause || '*', {
      ...options,
      strategicPlanIds: [planId]
    });
  }, [fetchWithStrategyFilter]);

  /**
   * Get entities aligned to a specific strategic objective
   * @param {string} tableName - The table to query
   * @param {string} objectiveId - The strategic objective ID
   * @param {object} options - Additional query options
   */
  const getEntitiesForObjective = useCallback(async (tableName, objectiveId, options = {}) => {
    return fetchWithStrategyFilter(tableName, options.selectClause || '*', {
      ...options,
      strategicObjectiveIds: [objectiveId]
    });
  }, [fetchWithStrategyFilter]);

  /**
   * Get all strategy-derived entities
   * @param {string} tableName - The table to query
   * @param {object} options - Additional query options
   */
  const getStrategyDerivedEntities = useCallback(async (tableName, options = {}) => {
    return fetchWithStrategyFilter(tableName, options.selectClause || '*', {
      ...options,
      onlyStrategyDerived: true
    });
  }, [fetchWithStrategyFilter]);

  /**
   * Calculate strategy coverage for a set of entities
   * @param {Array} entities - Array of entities to analyze
   * @param {Array} allStrategicPlans - All strategic plans for comparison
   */
  const calculateStrategyCoverage = useCallback((entities, allStrategicPlans) => {
    if (!entities?.length || !allStrategicPlans?.length) {
      return {
        totalEntities: entities?.length || 0,
        alignedEntities: 0,
        alignmentPercentage: 0,
        plansCovered: 0,
        totalPlans: allStrategicPlans?.length || 0,
        planCoveragePercentage: 0
      };
    }

    const alignedEntities = entities.filter(e => 
      (e.strategic_plan_ids?.length > 0) || 
      (e.strategic_objective_ids?.length > 0) ||
      e.is_strategy_derived
    );

    const coveredPlanIds = new Set();
    entities.forEach(e => {
      (e.strategic_plan_ids || []).forEach(id => coveredPlanIds.add(id));
    });

    return {
      totalEntities: entities.length,
      alignedEntities: alignedEntities.length,
      alignmentPercentage: Math.round((alignedEntities.length / entities.length) * 100),
      plansCovered: coveredPlanIds.size,
      totalPlans: allStrategicPlans.length,
      planCoveragePercentage: Math.round((coveredPlanIds.size / allStrategicPlans.length) * 100)
    };
  }, []);

  return {
    // Inherit from base visibility system
    ...visibilitySystem,
    
    // Strategic filtering functions
    fetchWithStrategyFilter,
    getEntitiesForPlan,
    getEntitiesForObjective,
    getStrategyDerivedEntities,
    calculateStrategyCoverage
  };
}

export default useVisibilityWithStrategy;

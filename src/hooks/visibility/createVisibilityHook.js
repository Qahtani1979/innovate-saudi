/**
 * Factory function to create visibility-aware data hooks
 * 
 * This creates consistent visibility hooks for any entity type
 * following the same patterns for challenges, pilots, programs, etc.
 */

import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './useVisibilitySystem';

/**
 * Create a visibility-aware hook for any entity type
 * 
 * @param {object} config - Hook configuration
 * @param {string} config.entityName - Name of the entity (e.g., 'challenges', 'pilots')
 * @param {string} config.tableName - Supabase table name
 * @param {string} config.selectClause - Select clause for the query
 * @param {object} config.columns - Column name mappings
 * @param {array} config.publicStatuses - Status values considered public
 */
export function createVisibilityHook(config) {
  const {
    entityName,
    tableName,
    selectClause = '*',
    columns = {},
    publicStatuses = ['active', 'published', 'completed']
  } = config;

  const {
    municipalityColumn = 'municipality_id',
    sectorColumn = 'sector_id',
    statusColumn = 'status',
    publishedColumn = 'is_published',
    deletedColumn = 'is_deleted'
  } = columns;

  return function useEntityWithVisibility(options = {}) {
    const {
      status,
      sectorId,
      limit = 100,
      includeDeleted = false,
      publishedOnly = false,
      ...additionalFilters
    } = options;

    const {
      isLoading: visibilityLoading,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      nationalMunicipalityIds,
      visibilityLevel
    } = useVisibilitySystem();

    return useQuery({
      queryKey: [`${entityName}-with-visibility`, {
        hasFullVisibility,
        visibilityLevel,
        isNational,
        sectorIds,
        userMunicipalityId,
        status,
        sectorId,
        limit,
        ...additionalFilters
      }],
      queryFn: async () => {
        // Build base query
        let query = supabase
          .from(tableName)
          .select(selectClause)
          .order('created_at', { ascending: false })
          .limit(limit);

        // Apply deleted filter
        if (!includeDeleted && deletedColumn) {
          query = query.eq(deletedColumn, false);
        }

        // Apply status filter
        if (status) {
          query = query.eq(statusColumn, status);
        }

        // Apply sector filter
        if (sectorId) {
          query = query.eq(sectorColumn, sectorId);
        }

        // Apply additional filters
        Object.entries(additionalFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });

        // GLOBAL visibility
        if (hasFullVisibility) {
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }

        // SECTORAL visibility (National Deputyship)
        if (isNational && sectorIds?.length > 0) {
          query = query.in(sectorColumn, sectorIds);
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }

        // GEOGRAPHIC visibility (Municipality Staff)
        if (userMunicipalityId) {
          // Get own municipality entities
          const { data: ownData, error: ownError } = await supabase
            .from(tableName)
            .select(selectClause)
            .eq(municipalityColumn, userMunicipalityId)
            .eq(deletedColumn, false)
            .order('created_at', { ascending: false });

          if (ownError) throw ownError;

          // Get national entities
          let nationalData = [];
          if (nationalMunicipalityIds?.length > 0) {
            const { data: natData, error: natError } = await supabase
              .from(tableName)
              .select(selectClause)
              .in(municipalityColumn, nationalMunicipalityIds)
              .eq(deletedColumn, false)
              .order('created_at', { ascending: false });

            if (!natError) {
              nationalData = natData || [];
            }
          }

          // Combine and deduplicate
          const allData = [...(ownData || []), ...nationalData];
          const uniqueData = allData.filter((item, index, self) =>
            index === self.findIndex(i => i.id === item.id)
          );

          // Apply filters
          let filtered = uniqueData;
          if (status) {
            filtered = filtered.filter(item => item[statusColumn] === status);
          }
          if (sectorId) {
            filtered = filtered.filter(item => item[sectorColumn] === sectorId);
          }

          return filtered.slice(0, limit);
        }

        // PUBLIC visibility - only published/active
        if (publishedColumn) {
          query = query.eq(publishedColumn, true);
        } else if (statusColumn && publicStatuses.length > 0) {
          query = query.in(statusColumn, publicStatuses);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      enabled: !visibilityLoading,
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  };
}

export default createVisibilityHook;


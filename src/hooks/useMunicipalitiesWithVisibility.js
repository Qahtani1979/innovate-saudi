/**
 * Municipalities with Visibility Hook
 * 
 * Fetches municipalities that the current user can see
 * based on their visibility level.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/components/permissions/usePermissions';

export function useMunicipalitiesWithVisibility(options = {}) {
  const { includeNational = true, limit = 100, filterIds = null } = options;

  const {
    hasFullVisibility,
    isNational,
    userMunicipalityId,
    nationalMunicipalityIds,
    isLoading: visibilityLoading
  } = useVisibilitySystem();

  const { isAdmin } = usePermissions();

  return useQuery({
    queryKey: ['municipalities-with-visibility', {
      hasFullVisibility,
      isNational,
      userMunicipalityId,
      includeNational,
      limit,
      filterIds
    }],
    queryFn: async () => {
      let query = supabase
        .from('municipalities')
        .select('*')
        .order('name_en', { ascending: true })
        .limit(limit);

      if (filterIds && filterIds.length > 0) {
        query = query.in('id', filterIds);
      } else if (filterIds && filterIds.length === 0) {
        // If strict filter provided but empty, return empty
        return [];
      }

      // Apply visibility filters
      if (isAdmin || hasFullVisibility) {
        // No additional filters needed beyond filterIds
      } else if (isNational) {
        // National sees all
      } else if (userMunicipalityId) {
        // Staff: Own + National
        const allowedIds = [userMunicipalityId];
        if (includeNational && nationalMunicipalityIds?.length > 0) {
          allowedIds.push(...nationalMunicipalityIds);
        }
        query = query.in('id', allowedIds);
      } else if (includeNational && nationalMunicipalityIds?.length > 0) {
        // Public/Other: National only
        query = query.in('id', nationalMunicipalityIds);
      } else {
        return []; // No access
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export default useMunicipalitiesWithVisibility;

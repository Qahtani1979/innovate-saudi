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
  const { includeNational = true, limit = 100 } = options;

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
      limit
    }],
    queryFn: async () => {
      // Admin or full visibility - all municipalities
      if (isAdmin || hasFullVisibility) {
        const { data, error } = await supabase
          .from('municipalities')
          .select('*')
          .order('name_en', { ascending: true })
          .limit(limit);
        
        if (error) throw error;
        return data || [];
      }

      // National deputyship - all municipalities (for oversight)
      if (isNational) {
        const { data, error } = await supabase
          .from('municipalities')
          .select('*')
          .order('name_en', { ascending: true })
          .limit(limit);
        
        if (error) throw error;
        return data || [];
      }

      // Municipality staff - own municipality + national
      if (userMunicipalityId) {
        const municipalityIds = [userMunicipalityId];
        
        if (includeNational && nationalMunicipalityIds?.length > 0) {
          municipalityIds.push(...nationalMunicipalityIds);
        }

        const { data, error } = await supabase
          .from('municipalities')
          .select('*')
          .in('id', municipalityIds)
          .order('name_en', { ascending: true });
        
        if (error) throw error;
        return data || [];
      }

      // Public - only national municipalities (if any are public)
      if (includeNational && nationalMunicipalityIds?.length > 0) {
        const { data, error } = await supabase
          .from('municipalities')
          .select('*')
          .in('id', nationalMunicipalityIds)
          .order('name_en', { ascending: true });
        
        if (error) throw error;
        return data || [];
      }

      return [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export default useMunicipalitiesWithVisibility;

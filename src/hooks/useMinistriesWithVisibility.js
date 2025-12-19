/**
 * Ministries with Visibility Hook
 * 
 * Fetches ministries that the current user can see
 * based on their visibility level.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/components/permissions/usePermissions';

export function useMinistriesWithVisibility(options = {}) {
  const { limit = 100 } = options;

  const {
    hasFullVisibility,
    isNational,
    isLoading: visibilityLoading
  } = useVisibilitySystem();

  const { isAdmin } = usePermissions();

  return useQuery({
    queryKey: ['ministries-with-visibility', {
      hasFullVisibility,
      isNational,
      limit
    }],
    queryFn: async () => {
      // All users can see active ministries (it's reference data)
      const { data, error } = await supabase
        .from('ministries')
        .select('*')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('name_en', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 10, // 10 minutes - reference data
  });
}

export default useMinistriesWithVisibility;

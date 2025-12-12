import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEntityVisibility } from './useEntityVisibility';
import { usePermissions } from '@/components/permissions/usePermissions';

/**
 * Hook for fetching solutions with visibility rules applied.
 * 
 * Visibility:
 * - Admin / Full Visibility Users: All solutions
 * - National Deputyship: All solutions in their sector(s)
 * - Municipality Staff: Own + national solutions
 * - Others: Published/approved solutions only
 */
export function useSolutionsWithVisibility(options = {}) {
  const { 
    sectorId,
    maturityLevel,
    limit = 100,
    includeDeleted = false,
    publishedOnly = false
  } = options;

  const { isAdmin, hasRole, userId } = usePermissions();
  const { 
    isNational, 
    sectorIds, 
    userMunicipalityId, 
    nationalRegionId,
    hasFullVisibility,
    isLoading: visibilityLoading 
  } = useEntityVisibility();

  const isStaffUser = hasRole('municipality_staff') || 
                      hasRole('municipality_admin') || 
                      hasRole('deputyship_staff') || 
                      hasRole('deputyship_admin');

  return useQuery({
    queryKey: ['solutions-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      sectorId,
      maturityLevel,
      limit,
      publishedOnly
    }],
    queryFn: async () => {
      let query = supabase
        .from('solutions')
        .select(`
          *,
          provider:providers(id, name_en, name_ar),
          sector:sectors(id, name_en, name_ar, code)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply deleted filter
      if (!includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      // Apply sector filter if provided
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      // Apply maturity filter if provided
      if (maturityLevel) {
        query = query.eq('maturity_level', maturityLevel);
      }

      // Non-staff users only see published/approved solutions
      if (publishedOnly || !isStaffUser) {
        query = query.eq('is_published', true);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // National deputyship: Filter by sector
      if (isNational && sectorIds?.length > 0) {
        query = query.in('sector_id', sectorIds);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // All staff users can see all solutions (solutions are typically shared across the platform)
      if (isStaffUser) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Fallback: published only
      query = query.eq('is_published', true);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export default useSolutionsWithVisibility;

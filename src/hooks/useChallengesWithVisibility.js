import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/components/permissions/usePermissions';

/**
 * Hook for fetching challenges with visibility rules applied.
 * 
 * Visibility:
 * - Admin / Full Visibility Users: All challenges
 * - National Deputyship: All challenges in their sector(s)
 * - Municipality Staff: Own + national challenges
 * - Others: Published challenges only
 */
export function useChallengesWithVisibility(options = {}) {
  const { 
    status,
    sectorId,
    limit = 100,
    includeDeleted = false,
    publishedOnly = false
  } = options;

  const permissionsData = usePermissions();
  const { isAdmin = false, hasRole = () => false, userId = null } = permissionsData || {};
  
  const visibilityData = useVisibilitySystem();
  const { 
    isNational = false, 
    sectorIds = [], 
    userMunicipalityId = null, 
    nationalMunicipalityIds = [],
    hasFullVisibility = false,
    isLoading: visibilityLoading = true 
  } = visibilityData || {};

  const isStaffUser = hasRole('municipality_staff') || 
                      hasRole('municipality_admin') || 
                      hasRole('deputyship_staff') || 
                      hasRole('deputyship_admin');

  return useQuery({
    queryKey: ['challenges-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      status,
      sectorId,
      limit,
      publishedOnly
    }],
    queryFn: async () => {
      let query = supabase
        .from('challenges')
        .select(`
          *,
          municipality:municipalities(id, name_en, name_ar, region_id, region:regions(id, code, name_en)),
          sector:sectors(id, name_en, name_ar, code)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply deleted filter
      if (!includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Apply sector filter if provided
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      // Non-staff users only see published
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

      // Geographic municipality: Own + national
      if (userMunicipalityId) {
        // First get own municipality challenges
        const { data: ownChallenges, error: ownError } = await supabase
          .from('challenges')
          .select(`
            *,
            municipality:municipalities(id, name_en, name_ar, region_id, region:regions(id, code, name_en)),
            sector:sectors(id, name_en, name_ar, code)
          `)
          .eq('municipality_id', userMunicipalityId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (ownError) throw ownError;

        // Then get national challenges (from national region)
        let nationalChallenges = [];
        if (nationalMunicipalityIds?.length > 0) {
          const { data: natChallenges, error: natError } = await supabase
            .from('challenges')
            .select(`
              *,
              municipality:municipalities(id, name_en, name_ar, region_id, region:regions(id, code, name_en)),
              sector:sectors(id, name_en, name_ar, code)
            `)
            .in('municipality_id', nationalMunicipalityIds)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

          if (!natError) {
            nationalChallenges = natChallenges || [];
          }
        }

        // Combine and deduplicate
        const allChallenges = [...(ownChallenges || []), ...nationalChallenges];
        const uniqueChallenges = allChallenges.filter((challenge, index, self) =>
          index === self.findIndex(c => c.id === challenge.id)
        );

        // Apply additional filters
        let filtered = uniqueChallenges;
        if (status) {
          filtered = filtered.filter(c => c.status === status);
        }
        if (sectorId) {
          filtered = filtered.filter(c => c.sector_id === sectorId);
        }

        return filtered.slice(0, limit);
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

export default useChallengesWithVisibility;

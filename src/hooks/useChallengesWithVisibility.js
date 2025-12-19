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
      // Base select with related entities
      const selectQuery = `
        *,
        municipality:municipalities(id, name_en, name_ar, region_id, region:regions(id, code, name_en)),
        sector:sectors(id, name_en, name_ar, code)
      `;

      // Non-staff users only see published
      if (publishedOnly || !isStaffUser) {
        let query = supabase
          .from('challenges')
          .select(selectQuery)
          .eq('is_published', true)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (status) query = query.eq('status', status);
        if (sectorId) query = query.eq('sector_id', sectorId);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        let query = supabase
          .from('challenges')
          .select(selectQuery)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!includeDeleted) query = query.eq('is_deleted', false);
        if (status) query = query.eq('status', status);
        if (sectorId) query = query.eq('sector_id', sectorId);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // National deputyship: Filter by sector
      if (isNational && sectorIds?.length > 0) {
        let query = supabase
          .from('challenges')
          .select(selectQuery)
          .in('sector_id', sectorIds)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (status) query = query.eq('status', status);
        if (sectorId) query = query.eq('sector_id', sectorId);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Geographic municipality: Own + national challenges
      if (userMunicipalityId) {
        // Use Promise.all for parallel fetching
        const [ownResult, nationalResult] = await Promise.all([
          // Own municipality challenges
          supabase
            .from('challenges')
            .select(selectQuery)
            .eq('municipality_id', userMunicipalityId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false }),
          
          // National challenges (if national municipality IDs exist)
          nationalMunicipalityIds?.length > 0
            ? supabase
                .from('challenges')
                .select(selectQuery)
                .in('municipality_id', nationalMunicipalityIds)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })
            : Promise.resolve({ data: [], error: null })
        ]);

        if (ownResult.error) throw ownResult.error;

        const ownChallenges = ownResult.data || [];
        const nationalChallenges = nationalResult.error ? [] : (nationalResult.data || []);

        // Combine and deduplicate using Map for O(n) performance
        const challengeMap = new Map();
        [...ownChallenges, ...nationalChallenges].forEach(challenge => {
          if (!challengeMap.has(challenge.id)) {
            challengeMap.set(challenge.id, challenge);
          }
        });

        let filtered = Array.from(challengeMap.values());

        // Apply additional filters
        if (status) {
          filtered = filtered.filter(c => c.status === status);
        }
        if (sectorId) {
          filtered = filtered.filter(c => c.sector_id === sectorId);
        }

        // Sort by created_at descending and apply limit
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return filtered.slice(0, limit);
      }

      // Fallback: published only
      let query = supabase
        .from('challenges')
        .select(selectQuery)
        .eq('is_published', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) query = query.eq('status', status);
      if (sectorId) query = query.eq('sector_id', sectorId);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export default useChallengesWithVisibility;

import { useQuery, keepPreviousData } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

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
    sectorsOverlap,
    limit = 100,
    includeDeleted = false,
    publishedOnly = false,
    strategicPlanId,
    municipalityId,
    tracks,
    // Pagination Options
    page,
    pageSize,
    paginate = false,
    // Sorting Options
    sortBy = 'created_at',
    sortOrder = 'desc'
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
    isLoading: visibilityLoading = true,
    scopeType // global, sectoral, geographic, public
  } = visibilityData || {};

  // Staff Check
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
      sectorsOverlap,
      limit,
      publishedOnly,
      strategicPlanId,
      municipalityId,
      page,
      pageSize,
      paginate,
      sortBy,
      sortOrder,
      tracks
    }],
    queryFn: async () => {
      // 1. Base Select
      const selectQuery = `
        *,
        municipality:municipalities(id, name_en, name_ar),
        sector:sectors(id, name_en, name_ar, code)
      `;

      const countOption = paginate ? { count: 'exact' } : {};

      let query = supabase.from('challenges').select(selectQuery, countOption);

      // 2. Common Filters (Status, Sector, Overlaps, Plans)
      if (status) {
        if (Array.isArray(status)) query = query.in('status', status);
        else query = query.eq('status', status);
      }
      if (sectorId) query = query.eq('sector_id', sectorId);
      if (sectorsOverlap?.length > 0) query = query.overlaps('sectors', sectorsOverlap);
      if (strategicPlanId) query = query.contains('strategic_plan_ids', [strategicPlanId]);
      if (municipalityId) query = query.eq('municipality_id', municipalityId);
      if (tracks) {
        if (Array.isArray(tracks)) query = query.contains('tracks', tracks);
        else query = query.contains('tracks', [tracks]);
      }

      // 3. Visibility Logic (Unified)

      // A. Public / Non-Staff (Strict)
      if (publishedOnly || !isStaffUser) {
        query = query.eq('is_published', true).eq('is_deleted', false);
      }
      // B. Global / Admin (Full Access)
      else if (hasFullVisibility) {
        if (!includeDeleted) query = query.eq('is_deleted', false);
      }
      // C. Sectoral (National Deputyship)
      else if (isNational && sectorIds?.length > 0) {
        query = query.in('sector_id', sectorIds).eq('is_deleted', false);
      }
      // D. Geographic (Municipality Staff - Own OR National)
      else if (userMunicipalityId) {
        let orCondition = `municipality_id.eq.${userMunicipalityId}`;
        if (nationalMunicipalityIds?.length > 0) {
          orCondition += `,municipality_id.in.(${nationalMunicipalityIds.join(',')})`;
        }
        query = query.or(orCondition).eq('is_deleted', false);
      }
      // Fallback: Public only if no specific rights
      else {
        query = query.eq('is_published', true).eq('is_deleted', false);
      }

      // 4. Sorting & Pagination
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      if (paginate && page && pageSize) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      } else {
        query = query.limit(limit);
      }

      // 5. Execution
      const { data, error, count } = await query;
      if (error) throw error;

      if (paginate) {
        return {
          data: data || [],
          totalCount: count || 0,
          totalPages: count ? Math.ceil(count / (pageSize || 10)) : 0
        };
      }

      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes (Gold Standard)
    placeholderData: paginate ? keepPreviousData : undefined
  });
}

/**
 * Hook to fetch a single challenge with visibility check.
 */
export function useChallenge(challengeId) {
  const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

  return useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      if (!challengeId) return null;
      const data = await fetchWithVisibility('challenges', `
        *,
        municipality:municipalities(id, name_en, name_ar, region_id),
        sector:sectors(id, name_en, name_ar, code)
      `, {
        additionalFilters: { id: challengeId }
      });
      return data?.[0] || null;
    },
    enabled: !!challengeId && !isVisibilityLoading,
    staleTime: 1000 * 60 * 5
  });
}

export default useChallengesWithVisibility;



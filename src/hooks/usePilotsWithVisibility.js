import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook for fetching pilots with visibility rules applied.
 * 
 * Visibility:
 * - Admin / Full Visibility Users: All pilots
 * - National Deputyship: All pilots in their sector(s)
 * - Municipality Staff: Own + national pilots
 * - Provider: Own pilots (as solution provider)
 * - Others: Published/public pilots only
 */
export function usePilotsWithVisibility(options = {}) {
  const {
    status,
    sectorId,
    includeDeleted = false,
    providerId = null,
    municipalityId, // New option
    stage, // New option
    limit = 50
  } = options;

  const { isAdmin, hasRole, userId, profile } = usePermissions();
  const {
    isNational,
    sectorIds,
    userMunicipalityId,
    nationalRegionId,
    nationalMunicipalityIds,
    hasFullVisibility,
    isLoading: visibilityLoading
  } = useVisibilitySystem();

  const isStaffUser = hasRole('municipality_staff') ||
    hasRole('municipality_admin') ||
    hasRole('deputyship_staff') ||
    hasRole('deputyship_admin');

  const isProvider = hasRole('provider');

  return useQuery({
    queryKey: ['pilots-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      status,
      sectorId,
      limit,
      providerId,
      municipalityId,
      stage
    }],
    queryFn: async () => {
      let baseSelect = `
        *,
        municipality:municipalities(id, name_en, name_ar),
        sector:sectors(id, name_en, name_ar, code),
        solution:solutions(id, name_en, name_ar, provider_id)
      `;

      // Provider sees their own pilots
      if (isProvider && !isStaffUser && !isAdmin) {
        const userProviderId = providerId || profile?.provider_id;
        if (!userProviderId) {
          return [];
        }

        const { data, error } = await supabase
          .from('pilots')
          .select(baseSelect)
          // .eq('is_deleted', false) // Column likely doesn't exist
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        // Filter by provider through solution relationship
        return (data || []).filter(pilot =>
          pilot.solution?.provider_id === userProviderId
        );
      }

      let query = supabase
        .from('pilots')
        .select(baseSelect)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply deleted filter
      if (!includeDeleted) {
        // query = query.eq('is_deleted', false); // Column likely doesn't exist
      }

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Apply sector filter if provided
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      // Apply municipality filter if provided
      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
      }

      // Apply stage filter if provided
      if (stage) {
        query = query.eq('stage', stage);
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Non-staff users only see active/completed pilots
      if (!isStaffUser) {
        query = query.in('status', ['active', 'completed', 'scaling']);
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
        // First get own municipality pilots
        const { data: ownPilots, error: ownError } = await supabase
          .from('pilots')
          .select(baseSelect)
          .eq('municipality_id', userMunicipalityId)
          // .eq('is_deleted', false) // Column likely doesn't exist
          .order('created_at', { ascending: false });

        if (ownError) throw ownError;

        // Then get national pilots
        let nationalPilots = [];
        if (nationalMunicipalityIds?.length > 0) {
          const { data: natPilots, error: natError } = await supabase
            .from('pilots')
            .select(baseSelect)
            .in('municipality_id', nationalMunicipalityIds)
            // .eq('is_deleted', false) // Column likely doesn't exist
            .order('created_at', { ascending: false });

          if (!natError) {
            nationalPilots = natPilots || [];
          }
        }

        // Combine and deduplicate
        const allPilots = [...(ownPilots || []), ...nationalPilots];
        const uniquePilots = allPilots.filter((pilot, index, self) =>
          index === self.findIndex(p => p.id === pilot.id)
        );

        // Apply additional filters
        let filtered = uniquePilots;
        if (status) {
          filtered = filtered.filter(p => p.status === status);
        }
        if (sectorId) {
          filtered = filtered.filter(p => p.sector_id === sectorId);
        }
        if (municipalityId) {
          filtered = filtered.filter(p => p.municipality_id === municipalityId);
        }
        if (stage) {
          filtered = filtered.filter(p => p.stage === stage);
        }

        return filtered.slice(0, limit);
      }

      // Fallback: active/completed only
      query = query.in('status', ['active', 'completed', 'scaling']);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function usePilot(pilotId) {
  const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

  return useQuery({
    queryKey: ['pilot', pilotId],
    queryFn: async () => {
      return fetchWithVisibility('pilots', `
        *,
        municipality:municipalities(id, name_en, name_ar),
        sector:sectors(id, name_en, name_ar, code),
        solution:solutions(id, name_en, name_ar, provider_id)
      `, { id: pilotId, single: true });
    },
    enabled: !!pilotId && !isVisibilityLoading
  });
}

export default usePilotsWithVisibility;


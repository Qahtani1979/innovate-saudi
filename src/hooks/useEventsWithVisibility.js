import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook for fetching events with visibility rules applied.
 * 
 * Visibility:
 * - Admin / Full Visibility Users: All events
 * - National Deputyship: All events in their sector(s)
 * - Municipality Staff: Own + national municipality events
 * - Program Manager: Events linked to their managed programs + published events
 * - Others: Published events only
 */
export function useEventsWithVisibility(options = {}) {
  const {
    status,
    eventType,
    programId,
    sectorId,
    limit = 100,
    includeDeleted = false,
    upcoming = false,
    strategicPlanId
  } = options;

  const { isAdmin, hasRole, userId, profile } = usePermissions();
  const {
    isNational,
    sectorIds,
    userMunicipalityId,
    nationalMunicipalityIds,
    hasFullVisibility,
    isLoading: visibilityLoading
  } = useVisibilitySystem();

  const isStaffUser = hasRole('municipality_staff') ||
    hasRole('municipality_admin') ||
    hasRole('deputyship_staff') ||
    hasRole('deputyship_admin');

  return useQuery({
    queryKey: ['events-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      status,
      eventType,
      programId,
      sectorId,
      limit,
      upcoming,
      strategicPlanId
    }],
    queryFn: async () => {
      let baseSelect = `
        *,
        municipality:municipalities(id, name_en, name_ar),
        program:programs(id, name_en, name_ar, sector_id)
      `;

      let query = supabase
        .from('events')
        .select(baseSelect)
        .order('start_date', { ascending: upcoming })
        .limit(limit);

      // Apply deleted filter
      if (!includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Apply event type filter if provided
      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      // Apply program filter if provided
      if (programId) {
        query = query.eq('program_id', programId);
      }

      // Apply sector filter if provided
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      // Apply upcoming filter
      if (upcoming) {
        query = query.gte('start_date', new Date().toISOString());
      }

      // Apply strategic plan filter
      if (strategicPlanId) {
        query = query.contains('strategic_plan_ids', [strategicPlanId]);
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Non-staff users only see published events
      if (!isStaffUser) {
        query = query.eq('is_published', true);
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
        // Get own municipality events
        const { data: ownEvents, error: ownError } = await supabase
          .from('events')
          .select(baseSelect)
          .eq('municipality_id', userMunicipalityId)
          .eq('is_deleted', false)
          .order('start_date', { ascending: upcoming });

        if (ownError) throw ownError;

        // Get national events
        let nationalEvents = [];
        if (nationalMunicipalityIds?.length > 0) {
          const { data: natEvents, error: natError } = await supabase
            .from('events')
            .select(baseSelect)
            .in('municipality_id', nationalMunicipalityIds)
            .eq('is_deleted', false)
            .order('start_date', { ascending: upcoming });

          if (!natError) {
            nationalEvents = natEvents || [];
          }
        }

        // Combine and deduplicate
        const allEvents = [...(ownEvents || []), ...nationalEvents];
        const uniqueEvents = allEvents.filter((event, index, self) =>
          index === self.findIndex(e => e.id === event.id)
        );

        // Apply additional filters
        let filtered = uniqueEvents;
        if (status) {
          filtered = filtered.filter(e => e.status === status);
        }
        if (eventType) {
          filtered = filtered.filter(e => e.event_type === eventType);
        }
        if (programId) {
          filtered = filtered.filter(e => e.program_id === programId);
        }
        if (upcoming) {
          filtered = filtered.filter(e => new Date(e.start_date) >= new Date());
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

export default useEventsWithVisibility;


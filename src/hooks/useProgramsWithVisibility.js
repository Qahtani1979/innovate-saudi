import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEntityVisibility } from './useEntityVisibility';
import { usePermissions } from '@/components/permissions/usePermissions';

/**
 * Hook for fetching programs with visibility rules applied.
 * 
 * Visibility:
 * - Admin / Full Visibility Users: All programs
 * - National Deputyship: All programs in their sector(s)
 * - Municipality Staff: Own + national programs
 * - Provider: Programs they've applied to
 * - Others: Published/active programs only
 */
export function useProgramsWithVisibility(options = {}) {
  const { 
    status,
    programType,
    sectorId,
    limit = 100,
    includeDeleted = false
  } = options;

  const { isAdmin, hasRole, userId, profile } = usePermissions();
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
    queryKey: ['programs-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      status,
      programType,
      sectorId,
      limit
    }],
    queryFn: async () => {
      let baseSelect = `
        *,
        municipality:municipalities(id, name_en, name_ar, region_id, region:regions(id, code, name_en)),
        sector:sectors(id, name_en, name_ar, code)
      `;

      let query = supabase
        .from('programs')
        .select(baseSelect)
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

      // Apply program type filter if provided
      if (programType) {
        query = query.eq('program_type', programType);
      }

      // Apply sector filter if provided
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Non-staff users only see active programs
      if (!isStaffUser) {
        query = query.in('status', ['active', 'open', 'completed']);
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
        // Get own municipality programs
        const { data: ownPrograms, error: ownError } = await supabase
          .from('programs')
          .select(baseSelect)
          .eq('municipality_id', userMunicipalityId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (ownError) throw ownError;

        // Get national programs
        let nationalPrograms = [];
        if (nationalRegionId) {
          const { data: nationalMunicipalities } = await supabase
            .from('municipalities')
            .select('id')
            .eq('region_id', nationalRegionId);

          if (nationalMunicipalities?.length > 0) {
            const nationalMunicipalityIds = nationalMunicipalities.map(m => m.id);
            const { data: natPrograms, error: natError } = await supabase
              .from('programs')
              .select(baseSelect)
              .in('municipality_id', nationalMunicipalityIds)
              .eq('is_deleted', false)
              .order('created_at', { ascending: false });

            if (!natError) {
              nationalPrograms = natPrograms || [];
            }
          }
        }

        // Combine and deduplicate
        const allPrograms = [...(ownPrograms || []), ...nationalPrograms];
        const uniquePrograms = allPrograms.filter((program, index, self) =>
          index === self.findIndex(p => p.id === program.id)
        );

        // Apply additional filters
        let filtered = uniquePrograms;
        if (status) {
          filtered = filtered.filter(p => p.status === status);
        }
        if (programType) {
          filtered = filtered.filter(p => p.program_type === programType);
        }

        return filtered.slice(0, limit);
      }

      // Fallback: active only
      query = query.in('status', ['active', 'open', 'completed']);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export default useProgramsWithVisibility;

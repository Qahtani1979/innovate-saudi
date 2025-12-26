import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook for fetching living labs with visibility rules applied.
 * 
 * Visibility:
 * - Admin / Full Visibility Users: All living labs
 * - National Deputyship: All living labs in their sector(s)
 * - Municipality Staff: Own + national living labs
 * - Others: Published/active living labs only
 */
export function useLivingLabsWithVisibility(options = {}) {
  const { 
    status,
    sectorId,
    limit = 100,
    includeDeleted = false
  } = options;

  const { isAdmin, hasRole, userId } = usePermissions();
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
    queryKey: ['living-labs-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      status,
      sectorId,
      limit
    }],
    queryFn: async () => {
      const baseSelect = `
        *,
        municipality:municipalities(id, name_en, name_ar, region_id, region:regions(id, code, name_en)),
        sector:sectors(id, name_en, name_ar, code)
      `;

      let query = supabase
        .from('living_labs')
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

      // Non-staff users only see active living labs
      if (!isStaffUser) {
        query = query.in('status', ['active', 'operational']);
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
        // Get own municipality living labs
        const { data: ownLabs, error: ownError } = await supabase
          .from('living_labs')
          .select(baseSelect)
          .eq('municipality_id', userMunicipalityId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (ownError) throw ownError;

        // Get national living labs
        let nationalLabs = [];
        if (nationalMunicipalityIds?.length > 0) {
          const { data: natLabs, error: natError } = await supabase
            .from('living_labs')
            .select(baseSelect)
            .in('municipality_id', nationalMunicipalityIds)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

          if (!natError) {
            nationalLabs = natLabs || [];
          }
        }

        // Combine and deduplicate
        const allLabs = [...(ownLabs || []), ...nationalLabs];
        const uniqueLabs = allLabs.filter((lab, index, self) =>
          index === self.findIndex(l => l.id === lab.id)
        );

        // Apply additional filters
        let filtered = uniqueLabs;
        if (status) {
          filtered = filtered.filter(l => l.status === status);
        }
        if (sectorId) {
          filtered = filtered.filter(l => l.sector_id === sectorId);
        }

        return filtered.slice(0, limit);
      }

      // Fallback: active only
      query = query.in('status', ['active', 'operational']);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export default useLivingLabsWithVisibility;

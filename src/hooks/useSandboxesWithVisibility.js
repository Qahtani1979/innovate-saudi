/**
 * Sandboxes With Visibility Hook
 * 
 * Fetches sandboxes respecting the visibility system.
 * - Admin: All sandboxes
 * - National Deputyship: All sandboxes in their sector(s)
 * - Municipality Staff: Own + national sandboxes
 * - Others: Active/operational sandboxes only
 */

import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

export function useSandboxesWithVisibility(options = {}) {
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
    queryKey: ['sandboxes-with-visibility', {
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
        .from('sandboxes')
        .select(baseSelect)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply deleted filter
      if (!includeDeleted) {
        query = query.or('is_deleted.eq.false,is_deleted.is.null');
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

      // Non-staff users only see active sandboxes
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
        // Get own municipality sandboxes
        const { data: ownSandboxes, error: ownError } = await supabase
          .from('sandboxes')
          .select(baseSelect)
          .eq('municipality_id', userMunicipalityId)
          .or('is_deleted.eq.false,is_deleted.is.null')
          .order('created_at', { ascending: false });

        if (ownError) throw ownError;

        // Get national sandboxes
        let nationalSandboxes = [];
        if (nationalMunicipalityIds?.length > 0) {
          const { data: natSandboxes, error: natError } = await supabase
            .from('sandboxes')
            .select(baseSelect)
            .in('municipality_id', nationalMunicipalityIds)
            .or('is_deleted.eq.false,is_deleted.is.null')
            .order('created_at', { ascending: false });

          if (!natError) {
            nationalSandboxes = natSandboxes || [];
          }
        }

        // Combine and deduplicate
        const allSandboxes = [...(ownSandboxes || []), ...nationalSandboxes];
        const uniqueSandboxes = allSandboxes.filter((sandbox, index, self) =>
          index === self.findIndex(s => s.id === sandbox.id)
        );

        // Apply additional filters
        let filtered = uniqueSandboxes;
        if (status) {
          filtered = filtered.filter(s => s.status === status);
        }
        if (sectorId) {
          filtered = filtered.filter(s => s.sector_id === sectorId);
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

export default useSandboxesWithVisibility;


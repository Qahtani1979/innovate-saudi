import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/components/permissions/usePermissions';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook for fetching R&D Calls with visibility rules applied.
 */
export function useRDCallsWithVisibility(options = {}) {
  const { status, sectorId, limit = 100, includeDeleted = false } = options;

  const { isAdmin, hasRole, userId } = usePermissions();
  const {
    isNational, sectorIds, hasFullVisibility,
    isLoading: visibilityLoading
  } = useVisibilitySystem();

  const isStaffUser = hasRole('municipality_staff') || hasRole('municipality_admin') ||
    hasRole('deputyship_staff') || hasRole('deputyship_admin');
  const isResearcher = hasRole('academia') || hasRole('researcher');

  return useQuery({
    queryKey: ['rd-calls-with-visibility', { userId, isAdmin, hasFullVisibility, isNational, sectorIds, status, sectorId, limit }],
    queryFn: async () => {
      const baseSelect = `*, sector:sectors(id, name_en, name_ar, code), program:programs(id, name_en, name_ar)`;

      let query = supabase.from('rd_calls').select(baseSelect)
        .order('created_at', { ascending: false }).limit(limit);

      if (!includeDeleted) query = query.or('is_deleted.eq.false,is_deleted.is.null');
      if (status) query = query.eq('status', status);
      if (options.approvalStatus) query = query.eq('approval_status', options.approvalStatus);
      if (sectorId) query = query.eq('sector_id', sectorId);

      // Cast to any to avoid recursion depth issues with Supabase types
      const safeQuery = /** @type {any} */(query);

      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      if (!isStaffUser && !isResearcher) {
        query = query.eq('is_published', true);
      }

      if (isNational && sectorIds?.length > 0) {
        query = query.in('sector_id', sectorIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2,
  });
}

// ... (previous code)

export function useRDCall(callId) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['rd-call', callId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_calls')
        .select('*, program:programs(*), sector:sectors(*), rd_proposals(count)')
        .eq('id', callId)
        .maybeSingle();

      if (error) throw error;

      // Map proposals count
      if (data) {
        return {
          ...data,
          proposals_count: data.rd_proposals?.[0]?.count || 0
        };
      }
      return data;
    },
    enabled: !!callId
  });
}

export default useRDCallsWithVisibility;

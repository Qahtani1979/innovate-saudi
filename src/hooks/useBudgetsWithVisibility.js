import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook for fetching budgets with visibility rules applied.
 */
export function useBudgetsWithVisibility(options = {}) {
  const {
    status,
    fiscalYear,
    entityType,
    limit = 100
  } = options;

  const { isAdmin, hasRole, userId } = usePermissions();
  const {
    isNational,
    userMunicipalityId,
    hasFullVisibility,
    isLoading: visibilityLoading
  } = useVisibilitySystem();

  const isStaffUser = hasRole('municipality_staff') ||
    hasRole('municipality_admin') ||
    hasRole('deputyship_staff') ||
    hasRole('deputyship_admin');

  return useQuery({
    queryKey: ['budgets-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      userMunicipalityId,
      status,
      fiscalYear,
      entityType,
      strategicPlanId: options.strategicPlanId,
      limit
    }],
    queryFn: async () => {
      const baseSelect = '*';

      let query = supabase
        .from('budgets')
        .select(baseSelect)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Apply fiscal year filter
      if (fiscalYear) {
        query = query.eq('fiscal_year', fiscalYear);
      }

      // Apply entity type filter
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      // Apply strategic plan filter
      if (options.strategicPlanId) {
        query = query.eq('strategic_plan_id', options.strategicPlanId);
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // National deputyship: See all budgets for oversight
      if (isNational) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Non-staff users: no access to budgets
      if (!isStaffUser) {
        return [];
      }

      // Municipality staff: See budgets for their municipality entities
      // This requires filtering by entity_id matching municipality entities
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2,
  });
}

export default useBudgetsWithVisibility;


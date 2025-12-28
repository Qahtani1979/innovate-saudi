import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook for fetching contracts with visibility rules applied.
 * 
 * Visibility:
 * - Admin / Full Visibility Users: All contracts
 * - National Deputyship: All contracts (national oversight)
 * - Municipality Staff: Own municipality contracts
 * - Provider: Contracts they are party to
 * - Others: No access
 */
export function useContractsWithVisibility(options = {}) {
  const { 
    status,
    contractType,
    limit = 100,
    includeDeleted = false
  } = options;

  const { isAdmin, hasRole, userId, profile } = usePermissions();
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

  const isProvider = hasRole('provider');

  return useQuery({
    queryKey: ['contracts-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      userMunicipalityId,
      status,
      contractType,
      limit
    }],
    queryFn: async () => {
      const baseSelect = `
        *,
        municipality:municipalities(id, name_en, name_ar),
        provider:providers(id, name_en, name_ar),
        pilot:pilots(id, name_en, name_ar),
        solution:solutions(id, name_en, name_ar)
      `;

      let query = supabase
        .from('contracts')
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

      // Apply contract type filter if provided
      if (contractType) {
        query = query.eq('contract_type', contractType);
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // National deputyship: See all contracts for oversight
      if (isNational) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Provider: See own contracts
      if (isProvider && !isStaffUser) {
        const providerId = profile?.provider_id;
        if (providerId) {
          query = query.eq('provider_id', providerId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Municipality staff: See own municipality contracts
      if (userMunicipalityId) {
        query = query.eq('municipality_id', userMunicipalityId);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // No access for others
      return [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export default useContractsWithVisibility;


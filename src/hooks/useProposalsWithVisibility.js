import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook for fetching proposals with visibility rules applied.
 */
export function useProposalsWithVisibility(options = {}) {
  const { 
    status,
    challengeId,
    limit = 100
  } = options;

  const { isAdmin, hasRole, userId, profile } = usePermissions();
  const { 
    isNational, 
    sectorIds,
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
    queryKey: ['proposals-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      status,
      challengeId,
      limit
    }],
    queryFn: async () => {
      const baseSelect = `
        *,
        challenge:challenges(id, title_en, title_ar, municipality_id, sector_id),
        organization:organizations(id, name_en, name_ar),
        provider:providers(id, name_en, name_ar)
      `;

      let query = supabase
        .from('challenge_proposals')
        .select(baseSelect)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Apply challenge filter if provided
      if (challengeId) {
        query = query.eq('challenge_id', challengeId);
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Provider: See own proposals only
      if (isProvider && !isStaffUser) {
        const providerId = profile?.provider_id;
        if (providerId) {
          query = query.eq('provider_id', providerId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // National deputyship: See proposals for challenges in their sectors
      if (isNational && sectorIds?.length > 0) {
        const { data, error } = await query;
        if (error) throw error;
        // Filter by sector through challenge relationship
        return (data || []).filter(p => 
          p.challenge?.sector_id && sectorIds.includes(p.challenge.sector_id)
        );
      }

      // Municipality staff: See proposals for their municipality's challenges
      if (userMunicipalityId) {
        const { data, error } = await query;
        if (error) throw error;
        // Filter by municipality through challenge relationship
        return (data || []).filter(p => 
          p.challenge?.municipality_id === userMunicipalityId
        );
      }

      // No access for others
      return [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2,
  });
}

export default useProposalsWithVisibility;

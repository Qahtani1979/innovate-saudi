/**
 * Innovation Proposals With Visibility Hook
 * 
 * Fetches innovation proposals respecting the visibility system.
 * - Admin: All proposals
 * - Deputyship: All proposals in their sector(s)
 * - Municipality Staff: Proposals for their municipality
 * - Submitter: Own proposals
 * - Others: No access (proposals are internal)
 */

import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

export function useInnovationProposalsWithVisibility(options = {}) {
  const { 
    status,
    sectorId,
    proposalType,
    limit = 100,
    includeDeleted = false
  } = options;

  const { isAdmin, hasRole, userId, userEmail } = usePermissions();
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

  return useQuery({
    queryKey: ['innovation-proposals-with-visibility', {
      userId,
      userEmail,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      status,
      sectorId,
      proposalType,
      limit
    }],
    queryFn: async () => {
      const baseSelect = `
        *,
        sector:sectors(id, name_en, name_ar, code),
        organization:organizations(id, name_en, name_ar),
        municipality:municipalities(id, name_en, name_ar)
      `;

      let query = supabase
        .from('innovation_proposals')
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

      // Apply proposal type filter if provided
      if (proposalType) {
        query = query.eq('proposal_type', proposalType);
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Staff users can see all proposals in their scope
      if (isStaffUser) {
        // National deputyship: Filter by sector
        if (isNational && sectorIds?.length > 0) {
          query = query.in('sector_id', sectorIds);
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }

        // Municipality staff: Municipality proposals
        if (userMunicipalityId) {
          query = query.eq('municipality_id', userMunicipalityId);
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        }

        // General staff: All proposals
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Non-staff users: Only their own proposals
      if (userId || userEmail) {
        let ownQuery = supabase
          .from('innovation_proposals')
          .select(baseSelect)
          .or('is_deleted.eq.false,is_deleted.is.null')
          .order('created_at', { ascending: false })
          .limit(limit);

        // Filter by submitter
        if (userId) {
          ownQuery = ownQuery.eq('submitter_id', userId);
        } else if (userEmail) {
          ownQuery = ownQuery.eq('submitter_email', userEmail);
        }

        if (status) ownQuery = ownQuery.eq('status', status);
        if (sectorId) ownQuery = ownQuery.eq('sector_id', sectorId);
        if (proposalType) ownQuery = ownQuery.eq('proposal_type', proposalType);

        const { data, error } = await ownQuery;
        if (error) throw error;
        return data || [];
      }

      // No access for anonymous users
      return [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export default useInnovationProposalsWithVisibility;


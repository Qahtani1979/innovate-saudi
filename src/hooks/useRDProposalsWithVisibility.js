import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

export function useRDProposalsWithVisibility(options = {}) {
    const {
        status,
        rdCallId,
        limit = 100
    } = options;

    const { isAdmin, hasRole, userId } = usePermissions();
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
        queryKey: ['rd-proposals-with-visibility', {
            userId,
            isAdmin,
            hasFullVisibility,
            isNational,
            sectorIds,
            userMunicipalityId,
            status,
            rdCallId,
            limit
        }],
        queryFn: async () => {
            const baseSelect = `
        *,
        rd_call:rd_calls(id, title_en, title_ar, sector_id)
      `;

            let query = supabase
                .from('rd_proposals')
                .select(baseSelect)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (status) {
                query = query.eq('status', status);
            }

            if (rdCallId) {
                query = query.eq('rd_call_id', rdCallId);
            }

            // Admin or full visibility users see everything
            if (hasFullVisibility) {
                const { data, error } = await query;
                if (error) throw error;
                return data || [];
            }

            // National deputyship: Filter by sector
            if (isNational && sectorIds?.length > 0) {
                const { data, error } = await query;
                if (error) throw error;
                return (data || []).filter(p =>
                    p.rd_call?.sector_id && sectorIds.includes(p.rd_call.sector_id)
                );
            }

            // Municipality staff: Specific access (might need more logic depending on R&D scope)
            // For now, allow if related to their municipality
            if (userMunicipalityId) {
                const { data, error } = await query;
                if (error) throw error;
                return data || []; // Placeholder: R&D usually national, but municipalities might view their parts
            }

            // Proposer: See own proposals
            if (userId) {
                let proposerQuery = supabase
                    .from('rd_proposals')
                    .select(baseSelect)
                    .eq('submitter_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                const { data, error } = await proposerQuery;
                if (error) throw error;
                return data || [];
            }

            return [];
        },
        enabled: !visibilityLoading,
        staleTime: 1000 * 60 * 2,
    });
}

export default useRDProposalsWithVisibility;


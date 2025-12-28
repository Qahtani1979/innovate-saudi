import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

export function usePartnershipsWithVisibility(options = {}) {
    const {
        status,
        partnershipType,
        limit = 100
    } = options;

    const { isAdmin, hasRole, userId } = usePermissions();
    const {
        isNational,
        sectorIds,
        hasFullVisibility,
        isLoading: visibilityLoading
    } = useVisibilitySystem();

    return useQuery({
        queryKey: ['partnerships-with-visibility', {
            userId,
            isAdmin,
            hasFullVisibility,
            isNational,
            sectorIds,
            status,
            partnershipType,
            limit
        }],
        queryFn: async () => {
            let query = supabase
                .from('partnerships')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (status) {
                query = query.eq('status', status);
            }

            if (partnershipType) {
                query = query.eq('partnership_type', partnershipType);
            }

            // Visibility logic: Partnerships are usually strategic and shared
            // For now, simpler than pilots/challenges but can be refined.
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !visibilityLoading,
        staleTime: 1000 * 60 * 5,
    });
}

export default usePartnershipsWithVisibility;


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

export const useMilestones = ({ entityId, entityType } = {}) => {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['milestones', { entityId, entityType }],
        queryFn: async () => {
            let query = supabase
                .from('milestones')
                .select('*')
                .or('is_deleted.is.null,is_deleted.eq.false')
                .order('due_date', { ascending: false });

            query = applyVisibilityRules(query, 'milestone');

            if (entityId) {
                query = query.eq('entity_id', entityId);
            }
            if (entityType) {
                query = query.eq('entity_type', entityType);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5,
    });
};

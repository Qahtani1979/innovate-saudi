import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useEntityVisibility } from '@/hooks/useEntityVisibility';

export function useTeamsWithVisibility(options = {}) {
    const { limit, activeOnly = false, includeMembers = false } = options;
    // useEntityVisibility can be used if we implement strict RLS via policies, 
    // currently we just fetch based on generic options.

    return useQuery({
        queryKey: ['teams-visibility', limit, activeOnly, includeMembers],
        queryFn: async () => {
            let query = supabase
                .from('teams')
                .select(includeMembers ? '*, team_members(*)' : '*')
                .order('created_at', { ascending: false });

            if (activeOnly) {
                query = query.eq('status', 'active');
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}


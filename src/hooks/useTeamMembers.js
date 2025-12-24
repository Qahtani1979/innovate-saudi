import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTeamMembers(options = {}) {
    const { teamId } = options;

    return useQuery({
        queryKey: ['team-members', teamId],
        queryFn: async () => {
            let query = supabase
                .from('team_members')
                .select('*');

            if (teamId) {
                query = query.eq('team_id', teamId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5,
    });
}

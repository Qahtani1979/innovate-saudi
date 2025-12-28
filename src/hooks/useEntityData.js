import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useEntity(entityType, entityId) {
    return useQuery({
        queryKey: ['entity', entityType, entityId],
        queryFn: async () => {
            if (!entityType || !entityId) return null;

            const tableMap = {
                challenge: 'challenges',
                pilot: 'pilots',
                solution: 'solutions',
                rd_proposal: 'rd_proposals',
                rd_project: 'rd_projects',
                program_application: 'program_applications',
                matchmaker_application: 'matchmaker_applications',
                scaling_plan: 'scaling_plans',
                citizen_idea: 'citizen_ideas'
            };

            const table = tableMap[entityType];
            if (!table) return null;

            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', entityId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!entityType && !!entityId,
        staleTime: 5 * 60 * 1000
    });
}


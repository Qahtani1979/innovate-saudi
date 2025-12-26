import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePolicyRecommendations(options = {}) {
    const { challengeId, entityType, entityId } = options;

    // Determine filter based on arguments
    let filterField = null;
    let filterValue = null;

    if (challengeId) {
        filterField = 'challenge_id';
        filterValue = challengeId;
    } else if (entityType && entityId) {
        const fieldMap = {
            challenge: 'challenge_id',
            pilot: 'pilot_id',
            rd_project: 'rd_project_id',
            program: 'program_id'
        };
        filterField = fieldMap[entityType];
        filterValue = entityId;
    }

    return useQuery({
        queryKey: ['policy-recommendations', filterField, filterValue],
        queryFn: async () => {
            let query = supabase.from('policy_recommendations').select('*');

            if (filterField && filterValue) {
                query = query.eq(filterField, filterValue);
            } else {
                // Fallback or fetch all? Original client side logic fetched all then filtered.
                // Better to fetch all if no filter provided? Or generic list?
                // Given the usage in PolicyTabWidget was: list() then filter. 
                // If we provide entityType/Id we filter server side. 
                // If not, we fetch all.
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: true // Always enabled? Or only if filter present? list() implies all.
    });
}

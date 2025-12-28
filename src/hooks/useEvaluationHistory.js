import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useEvaluationHistory({ entityType, entityId, filterEntityType, filterEvaluator, filterRecommendation, textSearch }) {
    return useQuery({
        queryKey: ['all-evaluations-history', entityType, entityId, filterEntityType, filterEvaluator, filterRecommendation, textSearch],
        queryFn: async () => {
            let query = supabase
                .from('expert_evaluations')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply base entity type filter (from URL params usually)
            // Note: The original component Logic handled 'all' in state but URL params 'all' was default.
            // We will handle 'all' check here.

            if (filterEntityType && filterEntityType !== 'all') {
                query = query.eq('entity_type', filterEntityType);
            }

            // If entityId is provided in URL
            if (entityId) {
                query = query.eq('entity_id', entityId);
            }

            // Additional filters are mostly done in-memory in the component (search, evaluator, rec), 
            // BUT the component fetches *limited to 200* then filters in memory.
            // Wait, looking at original code:
            // It applied `filterEntityType` and `entityId` to the supabase query.
            // `filterEvaluator` and `filterRecommendation` and `searchQuery` were used to filter `evaluations` array in memory (lines 75-83).
            // So the hook should return the data based on `filterEntityType` and `entityId` + limit 200.
            // Use same logic as original QueryFn.

            const { data, error } = await query.limit(200);
            if (error) throw error;

            return data || [];
        },
        // Only re-fetch if these change. The in-memory filtering will handle the rest.
        staleTime: 5 * 60 * 1000
    });
}


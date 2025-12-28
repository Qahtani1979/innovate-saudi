import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

export function useResearchers(options = {}) {
    const { limit = 50, institutionId, expertise } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['researcher-profiles', { limit, institutionId, expertise }],
        queryFn: async () => {
            let query = supabase
                .from('researcher_profiles')
                .select('*')
                .eq('is_active', true)
                .limit(limit);

            query = applyVisibilityRules(query, 'researcher');

            if (institutionId) {
                query = query.eq('institution_id', institutionId);
            }
            if (expertise) {
                query = query.contains('expertise_areas', [expertise]);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useResearcher(id) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['researcher-profile', id],
        queryFn: async () => {
            if (!id) return null;

            let query = supabase
                .from('researcher_profiles')
                .select('*')
                .eq('id', id)
                .single();

            query = applyVisibilityRules(query, 'researcher');

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}

export function useResearchersByInstitution(institutionId) {
    return useResearchers({ institutionId });
}


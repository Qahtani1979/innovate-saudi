import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSolutions({ publishedOnly = true, limit = 100 } = {}) {
    const queryClient = useQueryClient();

    const { data: solutions = [], isLoading, error } = useQuery({
        queryKey: ['solutions', { publishedOnly, limit }],
        queryFn: async () => {
            let query = supabase
                .from('solutions')
                .select('*')
                .limit(limit);

            if (publishedOnly) {
                query = query.eq('is_published', true);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    return {
        solutions,
        isLoading,
        error
    };
}

export function useSimilarSolutions({ solutionId, sectors = [], limit = 5 }) {
    return useQuery({
        queryKey: ['similar-solutions', solutionId, sectors, limit],
        queryFn: async () => {
            if (!solutionId || sectors.length === 0) return [];

            const { data, error } = await supabase
                .from('solutions')
                .select('*')
                .neq('id', solutionId)
                .overlaps('sectors', sectors)
                .order('rating', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionId && sectors.length > 0,
        staleTime: 1000 * 60 * 10 // 10 minutes
    });
}

export function useSolutionVersions(solutionId) {
    return useQuery({
        queryKey: ['solution-versions', solutionId],
        queryFn: async () => {
            const { data: current, error } = await supabase.from('solutions').select('*').eq('id', solutionId).single();
            if (error) throw error;
            if (!current) return [];

            const allVersions = [];
            let currentVersion = current;

            // Limit depth to prevent infinite loops
            while (currentVersion?.previous_version_id && allVersions.length < 20) {
                const { data: prev } = await supabase.from('solutions').select('*')
                    .eq('id', currentVersion.previous_version_id).single();
                if (prev) {
                    allVersions.push(prev);
                    currentVersion = prev;
                } else {
                    break;
                }
            }

            return [current, ...allVersions];
        },
        enabled: !!solutionId
    });
}

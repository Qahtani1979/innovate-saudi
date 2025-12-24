import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';

/**
 * Standardized solution details hook.
 * Uses visibility system for pilots and solution data.
 */
export function useSolutionDetails(solutionId) {
    const queryClient = useQueryClient();
    const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

    const useSolution = () => useQuery({
        queryKey: ['solution', solutionId],
        queryFn: async () => {
            const data = await fetchWithVisibility('solutions', '*', {
                additionalFilters: { id: solutionId }
            });
            return data?.[0] || null;
        },
        enabled: !!solutionId && !isVisibilityLoading
    });

    const useSolutionPilots = () => useQuery({
        queryKey: ['pilots-for-solution', solutionId],
        queryFn: async () => {
            return fetchWithVisibility('pilots', '*, stage', {
                additionalFilters: { solution_id: solutionId }
            });
        },
        enabled: !!solutionId && !isVisibilityLoading
    });

    const useSolutionComments = () => useQuery({
        queryKey: ['solution-comments', solutionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('solution_comments')
                .select('*')
                .eq('solution_id', solutionId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionId
    });

    const useExpertEvaluations = () => useQuery({
        queryKey: ['solution-expert-evaluations', solutionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', 'solution')
                .eq('entity_id', solutionId)
                .order('evaluation_date', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionId
    });

    const useAddComment = () => useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('solution_comments').insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId] });
            toast.success('Comment added');
        },
        onError: (error) => {
            toast.error('Failed to add comment: ' + error.message);
        }
    });

    const refreshSolution = () => {
        queryClient.invalidateQueries({ queryKey: ['solution', solutionId] });
    };

    return {
        useSolution,
        useSolutionPilots,
        useSolutionComments,
        useExpertEvaluations,
        useAddComment,
        refreshSolution
    };
}

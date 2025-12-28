import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useSolutionVerificationData() {
    const queryClient = useAppQueryClient();

    // 1. Fetch solutions
    const { data: solutions = [], isLoading: solutionsLoading } = useQuery({
        queryKey: ['solutions-verification'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('solutions')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });

    // 2. Fetch providers
    const { data: providers = [], isLoading: providersLoading } = useQuery({
        queryKey: ['providers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('providers')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });

    // 3. Fetch expert assignments
    const { data: expertAssignments = [], isLoading: assignmentsLoading } = useQuery({
        queryKey: ['expert-assignments-solutions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_assignments')
                .select('*')
                .eq('entity_type', 'Solution');
            if (error) throw error;
            return data || [];
        }
    });

    // 4. Mutation/Action for generic edge function invoke (or specifically checking consensus)
    // Since it was "handleEvaluationComplete", let's call it checkConsensus
    const checkConsensus = useMutation({
        mutationFn: async (solutionId) => {
            // This invoke pattern is specific to edge functions
            const { data, error } = await supabase.functions.invoke('check-consensus', {
                body: {
                    entity_type: 'solution',
                    entity_id: solutionId
                }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solutions-verification'] });
        }
    });

    return {
        solutions,
        providers,
        expertAssignments,
        isLoading: solutionsLoading || providersLoading || assignmentsLoading,
        checkConsensus
    };
}




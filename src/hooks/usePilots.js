import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to fetch a single pilot by ID with all related entities joined.
 * Replaces multiple individual queries in PilotDetail.jsx
 */
export function usePilot(pilotId) {
    return useQuery({
        queryKey: ['pilot', pilotId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select(`
          *,
          municipality:municipalities(*),
          region:regions(*),
          city:cities(*),
          sector:sectors(*),
          living_lab:living_labs(*),
          sandbox:sandboxes(*),
          challenge:challenges(*),
          solution:solutions(*)
        `)
                .eq('id', pilotId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!pilotId
    });
}

/**
 * Hook to fetch pilot approvals
 */
export function usePilotApprovals(pilotId) {
    return useQuery({
        queryKey: ['pilot-approvals', pilotId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilot_approvals')
                .select('*')
                .eq('pilot_id', pilotId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!pilotId
    });
}

/**
 * Hook for pilot comments with add mutation
 */
export function usePilotComments(pilotId) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['pilot-comments', pilotId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilot_comments')
                .select('*')
                .eq('pilot_id', pilotId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!pilotId
    });

    const addComment = useMutation({
        mutationFn: async (commentData) => {
            const { error } = await supabase.from('pilot_comments').insert(commentData);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pilot-comments', pilotId]);
            toast.success('Comment added');
        }
    });

    return {
        comments: query.data || [],
        isLoading: query.isLoading,
        addComment: addComment.mutate,
        isAdding: addComment.isPending
    };
}

/**
 * Hook to fetch expert evaluations for a pilot
 */
export function usePilotExpertEvaluations(pilotId) {
    return useQuery({
        queryKey: ['pilot-expert-evaluations', pilotId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', 'pilot')
                .eq('entity_id', pilotId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!pilotId
    });
}


/**
 * Hook to fetch pilots requiring iteration
 */
export function useIterationPilots() {
    return useQuery({
        queryKey: ['iteration-pilots'],
        queryFn: async () => {
            const { data, error } = await supabase.from('pilots').select('*').eq('recommendation', 'iterate');
            if (error) throw error;
            return data || [];
        }
    });
}


/**
 * Hook to fetch a list of pilots with optional filters
 */
export function usePilotsList({ stage } = {}) {
    return useQuery({
        queryKey: ['pilots-list', { stage }],
        queryFn: async () => {
            let query = supabase.from('pilots').select('*').eq('is_deleted', false);

            if (stage) {
                query = query.eq('stage', stage);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

export default usePilot;

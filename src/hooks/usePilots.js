import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
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
    const queryClient = useAppQueryClient();

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
export function usePilotsList({ stage, sector, recommendation, searchCode, excludeId, createdBy } = {}) {
    return useQuery({
        queryKey: ['pilots-list', { stage, sector, recommendation, searchCode, excludeId, createdBy }],
        queryFn: async () => {
            let query = supabase.from('pilots').select('*').eq('is_deleted', false);

            if (stage) {
                if (Array.isArray(stage)) {
                    query = query.in('stage', stage);
                } else {
                    query = query.eq('stage', stage);
                }
            }

            if (sector) {
                query = query.eq('sector', sector);
            }

            if (recommendation) {
                query = query.eq('recommendation', recommendation);
            }

            if (searchCode) {
                query = query.ilike('code', `%${searchCode}%`);
            }

            if (excludeId) {
                query = query.neq('id', excludeId);
            }

            if (createdBy) {
                query = query.eq('created_by', createdBy);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

export const usePilots = usePilotsList;

export default usePilot;


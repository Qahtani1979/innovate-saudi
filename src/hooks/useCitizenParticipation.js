import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePublicIdeas(options = {}) {
    const { limit, status, ...queryOptions } = options;
    return useQuery({
        queryKey: ['public-ideas', limit, status],
        queryFn: async () => {
            let query = supabase
                .from('citizen_ideas')
                .select('*')
                .order('created_at', { ascending: false });

            if (status && Array.isArray(status)) {
                query = query.in('status', status);
            } else if (status) {
                query = query.eq('status', status);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        ...queryOptions
    });
}

export function useIdeaVotes(userId) {
    return useQuery({
        queryKey: ['idea-votes', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data } = await supabase
                .from('citizen_votes')
                .select('entity_id')
                .eq('user_id', userId)
                .eq('entity_type', 'idea');
            return data?.map(v => v.entity_id) || [];
        },
        enabled: !!userId,
    });
}

export function useIdeaVoteMutation(userId, userEmail) {
    const queryClient = useAppQueryClient();
    const { data: userVotes = [] } = useIdeaVotes(userId);

    return useMutation({
        mutationFn: async (ideaId) => {
            if (!userId) throw new Error('Not logged in');

            // Need to fetch latest ideas manually or pass it in, but commonly we invalidate queries. 
            // Optimized optimistic update usually handled in component or we just refetch.
            // Here just handling DB logic.

            const isVoted = userVotes.includes(ideaId);

            if (isVoted) {
                await supabase.from('citizen_votes').delete()
                    .eq('user_id', userId)
                    .eq('entity_id', ideaId)
                    .eq('entity_type', 'idea');
            } else {
                await supabase.from('citizen_votes').insert({
                    user_id: userId,
                    user_email: userEmail,
                    entity_id: ideaId,
                    entity_type: 'idea',
                    vote_type: 'upvote'
                });
            }

            // We need to trigger the trigger or increment manually if no backend trigger
            // Assuming naive increment for now as in original code
            const { data: idea } = await supabase.from('citizen_ideas').select('votes_count').eq('id', ideaId).single();
            const currentCount = idea?.votes_count || 0;
            const newCount = isVoted ? Math.max(0, currentCount - 1) : currentCount + 1;

            await supabase.from('citizen_ideas').update({ votes_count: newCount }).eq('id', ideaId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['public-ideas'] });
            queryClient.invalidateQueries({ queryKey: ['idea-votes'] });

            // We can toast here or let component do it, but hook is better place for logic
            // However the component had specific toast messages. We'll simplify.
        }
    });
}

export function usePilotEnrollments(userEmail) {
    return useQuery({
        queryKey: ['my-enrollments', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data } = await supabase.from('citizen_pilot_enrollments').select('*').eq('citizen_email', userEmail);
            return data || [];
        },
        enabled: !!userEmail
    });
}


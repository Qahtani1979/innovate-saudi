import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch all user activity data including activities, votes, comments, and ideas
 */
export function useUserActivity(userEmail, userId) {
    const { data: activities = [], isLoading: activitiesLoading } = useQuery({
        queryKey: ['my-activities', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data } = await supabase
                .from('user_activities')
                .select('*')
                .eq('user_email', userEmail)
                .order('created_at', { ascending: false })
                .limit(100);
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: votes = [], isLoading: votesLoading } = useQuery({
        queryKey: ['my-votes', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data } = await supabase
                .from('citizen_votes')
                .select('*')
                .eq('user_email', userEmail);
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: comments = [], isLoading: commentsLoading } = useQuery({
        queryKey: ['my-comments', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data } = await supabase
                .from('comments')
                .select('*')
                .eq('user_email', userEmail)
                .eq('is_deleted', false);
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: ideas = [], isLoading: ideasLoading } = useQuery({
        queryKey: ['my-ideas', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data } = await supabase
                .from('citizen_ideas')
                .select('*')
                .eq('user_id', userId);
            return data || [];
        },
        enabled: !!userId
    });

    return {
        activities,
        votes,
        comments,
        ideas,
        isLoading: activitiesLoading || votesLoading || commentsLoading || ideasLoading
    };
}

/**
 * Hook to log user activity
 */
export function useLogActivity() {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async (activityData) => {
            const { error } = await supabase.from('user_activities').insert(activityData);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-activities'] });
        }
    });
}

/**
 * Hook to fetch activities for a specific entity (e.g., startup)
 */
export function useEntityActivity(entityId) {
    return useQuery({
        queryKey: ['entity-activities', entityId],
        queryFn: async () => {
            if (!entityId) return [];
            const { data, error } = await supabase
                .from('user_activities')
                .select('*')
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!entityId
    });
}

export default useUserActivity;


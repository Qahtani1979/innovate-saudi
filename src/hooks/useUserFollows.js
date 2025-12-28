import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useQuery, useMutation } from '@/hooks/useAppQueryClient';

export function useUserFollows(userEmail) {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();

    const useFollowers = () => useQuery({
        queryKey: ['user-followers', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_follows')
                .select('*')
                .eq('following_email', userEmail);
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    const useFollowing = () => useQuery({
        queryKey: ['user-following', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_follows')
                .select('*')
                .eq('follower_email', userEmail);
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    const followMutation = useMutation({
        mutationFn: async ({ targetEmail }) => {
            const { data, error } = await supabase
                .from('user_follows')
                .insert({
                    follower_email: userEmail,
                    following_email: targetEmail
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, { targetEmail }) => {
            queryClient.invalidateQueries(['user-following']);
            notify.success('User followed successfully');

            // Notify the user being followed
            notify({
                type: 'user_follow',
                entityType: 'user',
                entityId: userEmail, // The follower
                recipientEmails: [targetEmail],
                title: 'New Follower',
                message: `You have a new follower.`,
                sendEmail: true
            });
        }
    });

    const unfollowMutation = useMutation({
        mutationFn: async ({ targetEmail }) => {
            const { error } = await supabase
                .from('user_follows')
                .delete()
                .eq('follower_email', userEmail)
                .eq('following_email', targetEmail);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user-following']);
            notify.success('User unfollowed successfully');
        }
    });

    const useEntityFollowers = (entityType, entityId) => useQuery({
        queryKey: ['entity-followers', entityType, entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_follows')
                .select('*')
                .eq('followed_entity_type', entityType)
                .eq('followed_entity_id', entityId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!entityType && !!entityId
    });

    return {
        useFollowers,
        useFollowing,
        useEntityFollowers,
        followMutation,
        unfollowMutation
    };
}

export function useEntityFollowersData(entityType, entityId) {
    return useQuery({
        queryKey: ['entity-followers', entityType, entityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_follows')
                .select('*')
                .eq('followed_entity_type', entityType)
                .eq('followed_entity_id', entityId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!entityType && !!entityId
    });
}



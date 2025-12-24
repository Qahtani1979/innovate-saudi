import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUserFollows(userEmail) {
    const queryClient = useQueryClient();

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
        onSuccess: () => {
            queryClient.invalidateQueries(['user-following']);
            toast.success('User followed successfully');
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
            toast.success('User unfollowed successfully');
        }
    });

    return {
        useFollowers,
        useFollowing,
        followMutation,
        unfollowMutation
    };
}

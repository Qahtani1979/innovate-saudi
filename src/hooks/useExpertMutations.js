import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useExpertMutations() {
    const queryClient = useQueryClient();

    const updateExpertProfile = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase.from('expert_profiles').update(data).eq('id', id);
            if (error) throw error;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['expert-profile']);
            // Invalidate specific profile query if needed, but 'expert-profile' key covers both ID and UserId usually if invalidating array.
            // But queryKeys are ['expert-profile', id] or ['expert-profile', userId].
            // Simple invalidation of 'expert-profile' works for all variants if used as prefix or we can be specific.
            // For now, invalidating prefix 'expert-profile' is safe.
            toast.success('Profile updated');
        }
    });

    const createExpertProfile = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase.from('expert_profiles').insert(data).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expert-profiles']);
            queryClient.invalidateQueries(['expert-profile']);
            toast.success('Profile created');
        }
    });

    return {
        updateExpertProfile,
        createExpertProfile
    };
}

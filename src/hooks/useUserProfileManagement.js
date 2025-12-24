import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

/**
 * Hook to manage user profile data and mutations
 */
export function useUserProfileManagement(userId) {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['user-profile', userId],
        queryFn: async () => {
            if (!userId) return null;
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        },
        enabled: !!userId
    });

    const updateProfile = useMutation({
        mutationFn: async (data) => {
            if (!userId) throw new Error('Not authenticated');
            const { error } = await supabase
                .from('user_profiles')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('user_id', userId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user-profile']);
            toast.success(t({ en: 'Profile updated', ar: 'تم تحديث الملف' }));
        },
        onError: () => {
            toast.error(t({ en: 'Failed to update profile', ar: 'فشل في تحديث الملف' }));
        }
    });

    return {
        profile,
        isLoading,
        updateProfile
    };
}

export default useUserProfileManagement;

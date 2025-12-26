import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook for managing Researcher Profiles
 * Supports fetching and updating profile data with new schema fields.
 */
export function useResearcherProfiles(userId = null) {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();

    // Default to current user if no ID provided
    const targetUserId = userId || user?.id;

    // 1. FETCH PROFILE
    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['researcher-profile', targetUserId],
        queryFn: async () => {
            if (!targetUserId) return null;

            const { data, error } = await supabase
                .from('researcher_profiles')
                .select('*')
                .eq('user_id', targetUserId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!targetUserId,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    // 2. CREATE/UPDATE PROFILE
    const updateProfile = useMutation({
        mutationFn: async (profileData) => {
            if (!user) throw new Error('User must be logged in');

            // Upsert based on user_id
            const { data, error } = await supabase
                .from('researcher_profiles')
                .upsert({
                    user_id: user.id,
                    updated_at: new Date().toISOString(),
                    ...profileData
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['researcher-profile', user.id] });
            toast.success(t({ en: 'Profile updated successfully', ar: 'تم تحديث الملف الشخصي بنجاح' }));
        },
        onError: (error) => {
            console.error('Error updating researcher profile:', error);
            toast.error(t({ en: 'Failed to update profile', ar: 'فشل تحديث الملف الشخصي' }));
        }
    });

    return {
        profile,
        isLoading,
        error,
        updateProfile,
        isUpdating: updateProfile.isPending
    };
}


import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useUserProfile(email) {
    return useQuery({
        queryKey: ['user-profile', email],
        queryFn: async () => {
            if (!email) return null;
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('email', email)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!email,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

export function useAllUserProfiles() {
    return useQuery({
        queryKey: ['all-user-profiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5
    });
}
export function useUserProfileById(userId) {
    return useQuery({
        queryKey: ['user-profile-by-id', userId],
        queryFn: async () => {
            if (!userId) return null;
            const { data, error } = await supabase
                .from('user_profiles')
                .select('user_id, full_name, full_name_en, avatar_url, is_public, verified')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5
    });
}


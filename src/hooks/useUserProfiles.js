/**
 * User Profiles Hook
 * 
 * Fetches user profile data by email address
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch a user profile by email
 * @param {string} email - The email address of the user
 * @param {object} options - Additional query options
 * @returns {object} React Query result with user profile data
 */
export function useUserProfiles(email, options = {}) {
    return useQuery({
        queryKey: ['user-profile-by-email', email],
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
        staleTime: 1000 * 60 * 5, // 5 minutes
        ...options
    });
}

export function useAllUserProfiles() {
    return useQuery({
        queryKey: ['all-user-profiles'],
        queryFn: async () => {
            const { data, error } = await supabase.from('user_profiles').select('user_id, user_email, full_name, created_at');
            if (error) throw error;
            return data || [];
        }
    });
}

export default useUserProfiles;

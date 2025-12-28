import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useOnboardingStats() {
    const { data: users = [], isLoading: loadingUsers } = useQuery({
        queryKey: ['onboarding-users-stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('id, user_email, onboarding_completed, created_at')
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        }
    });

    const { data: challenges = [], isLoading: loadingChallenges } = useQuery({
        queryKey: ['onboarding-challenges-stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('id, created_by, created_at')
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        }
    });

    const { data: solutions = [], isLoading: loadingSolutions } = useQuery({
        queryKey: ['onboarding-solutions-stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('solutions')
                .select('id, created_by, created_at')
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        }
    });

    return {
        users,
        challenges,
        solutions,
        isLoading: loadingUsers || loadingChallenges || loadingSolutions
    };
}


import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

/**
 * Hook for fetching engagements for a specific match.
 */
export function useMatchEngagements(matchId) {
    return useQuery({
        queryKey: ['match-engagements', matchId],
        queryFn: async () => {
            if (!matchId) return [];
            const { data, error } = await supabase
                .from('matchmaker_engagements')
                .select('*')
                .eq('match_id', matchId)
                .order('date_occurred', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!matchId
    });
}

/**
 * Hook for logging new engagements.
 */
export function useMatchEngagementMutations(matchId) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();

    const logEngagement = useMutation({
        mutationFn: async (engagementData) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('matchmaker_engagements')
                .insert([
                    {
                        match_id: matchId,
                        ...engagementData,
                        logged_by: user.id
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['match-engagements', matchId] });
            toast.success('Engagement logged successfully');
        },
        onError: (error) => {
            console.error('Failed to log engagement:', error);
            toast.error('Failed to log engagement');
        }
    });

    return { logEngagement };
}




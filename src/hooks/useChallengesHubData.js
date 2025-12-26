import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useChallengesHubData() {
    const pendingApprovals = useQuery({
        queryKey: ['pending-challenge-approvals'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('approval_requests')
                .select('*')
                .eq('entity_type', 'challenge')
                .eq('approval_status', 'pending')
                .limit(5);
            if (error) throw error;
            return data || [];
        }
    });

    const recentProposals = useQuery({
        queryKey: ['recent-challenge-proposals'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenge_proposals')
                .select('*, challenges(title_en, code)')
                .order('created_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            return data || [];
        }
    });

    return {
        pendingApprovals: pendingApprovals.data || [],
        recentProposals: recentProposals.data || [],
        isLoading: pendingApprovals.isLoading || recentProposals.isLoading
    };
}

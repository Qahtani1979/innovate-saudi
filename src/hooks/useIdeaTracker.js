import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook for tracking user ideas and their conversion to challenges.
 */
export function useIdeaTracker() {
    const { user } = useAuth();
    const userEmail = user?.email;

    const useMyIdeas = () => useQuery({
        queryKey: ['my-ideas', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('citizen_ideas')
                .select('*')
                .eq('created_by', userEmail)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail,
        staleTime: 1000 * 60 * 5
    });

    const useChallengesFromMyIdeas = (myIdeaIds) => useQuery({
        queryKey: ['challenges-from-my-ideas', myIdeaIds],
        queryFn: async () => {
            if (!myIdeaIds || myIdeaIds.length === 0) return [];

            const { data, error } = await supabase
                .from('challenges')
                .select('id, code, title_en, description_en, status, sector, linked_pilot_ids, citizen_origin_idea_id')
                .eq('is_deleted', false)
                .in('citizen_origin_idea_id', myIdeaIds);

            if (error) throw error;
            return data || [];
        },
        enabled: !!myIdeaIds && myIdeaIds.length > 0,
        staleTime: 1000 * 60 * 5
    });

    return {
        useMyIdeas,
        useChallengesFromMyIdeas
    };
}

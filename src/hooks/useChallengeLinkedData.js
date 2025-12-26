import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useChallengeLinkedEvents(challengeId) {
    const query = useQuery({
        queryKey: ['challenge-events', challengeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('challenge_id', challengeId)
                .order('event_date', { ascending: true });

            if (error) {
                console.warn("Events fetch error:", error);
                return [];
            }
            return data || [];
        },
        enabled: !!challengeId
    });

    return {
        events: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError
    };
}

export function useChallengeExpertEvaluations(challengeId) {
    const query = useQuery({
        queryKey: ['challenge-expert-evaluations', challengeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', 'challenge')
                .eq('entity_id', challengeId);

            if (error) {
                console.warn("Expert evaluations fetch error:", error);
                return [];
            }
            return data || [];
        },
        enabled: !!challengeId
    });

    return {
        expertEvaluations: query.data || [],
        isLoading: query.isLoading
    };
}

export function useChallengeProposals(challengeId) {
    const query = useQuery({
        queryKey: ['challenge-proposals', challengeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenge_proposals')
                .select('*')
                .eq('challenge_id', challengeId)
                .eq('is_deleted', false);

            if (error) {
                console.warn("Proposals fetch error:", error);
                return [];
            }
            return data || [];
        },
        enabled: !!challengeId
    });

    return {
        proposals: query.data || [],
        isLoading: query.isLoading
    };
}

export function useChallengeLinkedRD(challenge, challengeId) {
    const linkedIds = challenge?.linked_rd_ids || [];

    const query = useQuery({
        queryKey: ['challenge-rd', challengeId || challenge?.id],
        queryFn: async () => {
            if (linkedIds.length === 0) return [];

            const { data, error } = await supabase
                .from('rd_projects')
                .select('*')
                .in('id', linkedIds)
                .eq('is_deleted', false);

            if (error) {
                console.warn("RD projects fetch error:", error);
                return [];
            }

            return data || [];
        },
        enabled: linkedIds.length > 0
    });

    return {
        relatedRD: query.data || [],
        isLoading: query.isLoading
    };
}

export function useChallengeActivities(challengeId) {
    const query = useQuery({
        queryKey: ['challenge-activities', challengeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('entity_id', challengeId)
                .eq('entity_type', 'challenge')
                .order('timestamp', { ascending: false });

            if (error) {
                console.warn("Activities fetch error:", error);
                throw error;
            }
            return data || [];
        },
        enabled: !!challengeId
    });

    return {
        activities: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError
    };
}

export function useChallengeLinkedPrograms(challenge) {
    const linkedIds = challenge?.linked_program_ids || [];

    const query = useQuery({
        queryKey: ['challenge-programs', challenge?.id],
        queryFn: async () => {
            if (linkedIds.length === 0) return [];

            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .in('id', linkedIds)
                .eq('is_deleted', false);

            if (error) {
                console.warn("Programs fetch error:", error);
                return [];
            }

            return data || [];
        },
        enabled: linkedIds.length > 0
    });

    return {
        linkedPrograms: query.data || [],
        isLoading: query.isLoading
    };
}

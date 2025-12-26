import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProviderSolutions(providerId, providerEmail) {
    return useQuery({
        queryKey: ['provider-solutions', providerId, providerEmail],
        queryFn: async () => {
            if (!providerId && !providerEmail) return [];

            let query = supabase.from('solutions').select('*');

            if (providerId && providerEmail) {
                query = query.or(`provider_id.eq.${providerId},created_by.eq.${providerEmail}`);
            } else if (providerId) {
                query = query.eq('provider_id', providerId);
            } else {
                query = query.eq('created_by', providerEmail);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!providerId || !!providerEmail
    });
}

export function useProviderMatches(solutionIds) {
    return useQuery({
        queryKey: ['provider-matches', solutionIds],
        queryFn: async () => {
            if (!solutionIds || solutionIds.length === 0) return [];

            const { data, error } = await supabase
                .from('challenge_solution_matches')
                .select('*')
                .in('solution_id', solutionIds);

            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionIds && solutionIds.length > 0
    });
}

export function useProviderInterests(solutionIds) {
    return useQuery({
        queryKey: ['provider-interests', solutionIds],
        queryFn: async () => {
            if (!solutionIds || solutionIds.length === 0) return [];

            const { data, error } = await supabase
                .from('solution_interests')
                .select('*')
                .in('solution_id', solutionIds);

            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionIds && solutionIds.length > 0
    });
}

export function useProviderDemoRequests(solutionIds) {
    return useQuery({
        queryKey: ['provider-demo-requests', solutionIds],
        queryFn: async () => {
            if (!solutionIds || solutionIds.length === 0) return [];

            const { data, error } = await supabase
                .from('demo_requests')
                .select('*')
                .in('solution_id', solutionIds);

            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionIds && solutionIds.length > 0
    });
}

export function useProviderProposals(providerEmail, providerId) {
    return useQuery({
        queryKey: ['provider-proposals', providerEmail, providerId],
        queryFn: async () => {
            if (!providerEmail && !providerId) return [];

            let query = supabase.from('challenge_proposals').select('*');

            if (providerEmail && providerId) {
                query = query.or(`proposer_email.eq.${providerEmail},provider_id.eq.${providerId}`);
            } else if (providerEmail) {
                query = query.eq('proposer_email', providerEmail);
            } else {
                query = query.eq('provider_id', providerId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!providerEmail || !!providerId
    });
}

export function useProviderPilots(solutionIds) {
    return useQuery({
        queryKey: ['provider-pilots', solutionIds],
        queryFn: async () => {
            if (!solutionIds || solutionIds.length === 0) return [];

            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .in('solution_id', solutionIds);

            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionIds && solutionIds.length > 0
    });
}

export function useProviderScalingPlans(solutionIds) {
    return useQuery({
        queryKey: ['provider-scaling-plans', solutionIds],
        queryFn: async () => {
            if (!solutionIds || solutionIds.length === 0) return [];

            const { data, error } = await supabase
                .from('scaling_plans')
                .select('*')
                .in('validated_solution_id', solutionIds);

            if (error) throw error;
            return data || [];
        },
        enabled: !!solutionIds && solutionIds.length > 0
    });
}

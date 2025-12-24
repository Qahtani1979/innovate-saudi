import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch a single organization by ID.
 */
export function useOrganization(orgId) {
    return useQuery({
        queryKey: ['organization', orgId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', orgId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000
    });
}

/**
 * Hook to fetch solutions provided by an organization.
 * Uses provider_id instead of name matching for better reliability.
 */
export function useOrganizationSolutions(orgId) {
    return useQuery({
        queryKey: ['solutions-by-org', orgId],
        queryFn: async () => {
            // Try to fetch by provider_id first (more reliable)
            const { data, error } = await supabase
                .from('solutions')
                .select('*')
                .eq('provider_id', orgId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000
    });
}

/**
 * Hook to fetch pilots related to an organization's solutions.
 * Uses inner join on solution to filter by provider_id.
 */
export function useOrganizationPilots(orgId) {
    return useQuery({
        queryKey: ['pilots-by-org', orgId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*, solution:solutions!inner(provider_id)')
                .eq('solution.provider_id', orgId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!orgId,
        staleTime: 5 * 60 * 1000
    });
}

/**
 * Hook to fetch a simple list of organizations for dropdowns/selection.
 */
export function useOrganizationsList(limit = 100) {
    return useQuery({
        queryKey: ['organizations-list', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('id, name_en, name_ar')
                .eq('is_deleted', false)
                .limit(limit);
            if (error) throw error;
            return data || [];
        },
        staleTime: 10 * 60 * 1000 // 10 minutes
    });
}

export default useOrganization;


/**
 * Hook to fetch an organization by its owner email.
 */
export function useOrganizationByOwner(email) {
    return useQuery({
        queryKey: ['organization-by-owner', email],
        queryFn: async () => {
            if (!email) return null;
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .or(`created_by.eq.${email},contact_email.eq.${email}`)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!email,
        staleTime: 5 * 60 * 1000
    });
}
export function useOrganizationLeaderboard() {
    return useQuery({
        queryKey: ['org-leaderboard'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('is_deleted', false)
                .gt('reputation_score', 0)
                .order('reputation_score', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        staleTime: 60 * 60 * 1000 // 1 hour
    });
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * useRDProjects
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useRDProjects(userEmail) {
    return useQuery({
        queryKey: ['rd-projects', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).filter(p =>
                p.principal_investigator?.email === userEmail ||
                p.team_members?.some(m => m.email === userEmail) ||
                p.created_by === userEmail
            );
        },
        enabled: !!userEmail,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * useRDProposals
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useRDProposals(userEmail) {
    return useQuery({
        queryKey: ['rd-proposals', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_proposals')
                .select('*')
                .eq('created_by', userEmail)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * useRDCalls
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useRDCalls(options = {}) {
    const { status = 'open' } = options;
    return useQuery({
        queryKey: ['rd-calls', { status }],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_calls')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5
    });
}

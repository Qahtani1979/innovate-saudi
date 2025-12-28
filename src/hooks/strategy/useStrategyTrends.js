import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch global trends
 */
export function useGlobalTrends(limit = 5) {
    return useQuery({
        queryKey: ['global-trends', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('global_trends')
                .select('*')
                .limit(limit)
                .order('impact_score', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 15 // 15 minutes
    });
}

/**
 * Hook to fetch policy documents
 */
export function usePolicyDocuments(limit = 5) {
    return useQuery({
        queryKey: ['policy-documents', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('policy_documents')
                .select('*')
                .limit(limit)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 15 // 15 minutes
    });
}


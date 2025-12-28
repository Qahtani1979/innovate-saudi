import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useInnovationProposal(id) {
    return useQuery({
        queryKey: ['innovation-proposal', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('innovation_proposals')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}


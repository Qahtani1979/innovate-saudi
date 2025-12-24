import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePartnershipDetail(partnershipId) {
    const { data: partnership, isLoading } = useQuery({
        queryKey: ['partnership', partnershipId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('partnerships')
                .select('*')
                .eq('id', partnershipId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!partnershipId
    });

    return {
        partnership,
        isLoading
    };
}

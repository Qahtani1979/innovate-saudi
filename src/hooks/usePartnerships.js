import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function usePartnerships() {
    return useQuery({
        queryKey: ['partnerships'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('partnerships')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    });
}

export function usePartnershipById(id) {
    return useQuery({
        queryKey: ['partnership', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('partnerships')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}


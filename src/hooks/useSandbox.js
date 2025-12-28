import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for fetching a single sandbox by ID.
 */
export function useSandbox(id) {
    return useQuery({
        queryKey: ['sandbox', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sandboxes')
                .select(`
          *,
          municipality:municipalities(id, name_en, name_ar, region_id, region:regions(id, code, name_en)),
          sector:sectors(id, name_en, name_ar, code),
          living_lab:living_labs(*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export default useSandbox;


import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useCities(options = {}) {
    const {
        ids = null,
        municipalityId = null,
        includeInactive = false
    } = options;

    return useQuery({
        queryKey: ['cities', { ids, municipalityId, includeInactive }],
        queryFn: async () => {
            let query = supabase
                .from('cities')
                .select('id, name_en, name_ar, municipality_id')
                .order('name_en');

            if (!includeInactive) {
                query = query.eq('is_active', true);
            }

            if (ids && ids.length > 0) {
                query = query.in('id', ids);
            }

            if (municipalityId) {
                query = query.eq('municipality_id', municipalityId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    });
}

export function useCity(id) {
    return useQuery({
        queryKey: ['city', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cities')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}

export default useCities;


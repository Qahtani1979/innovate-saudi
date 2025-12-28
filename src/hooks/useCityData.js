import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useCity(cityId) {
    return useQuery({
        queryKey: ['city', cityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cities')
                .select('*')
                .eq('id', cityId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!cityId
    });
}

export function useCityMunicipalities(cityId) {
    return useQuery({
        queryKey: ['city-municipalities', cityId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('municipalities')
                .select('*')
                .eq('city_id', cityId)
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        },
        enabled: !!cityId
    });
}


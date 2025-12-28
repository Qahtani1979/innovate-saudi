import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useMunicipalities() {
    return useQuery({
        queryKey: ['municipalities-list'],
        queryFn: async () => {
            const { data, error } = await supabase.from('municipalities').select('*');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useRegionsList() {
    return useQuery({
        queryKey: ['regions-list'],
        queryFn: async () => {
            const { data, error } = await supabase.from('regions').select('*');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useCitiesList() {
    return useQuery({
        queryKey: ['cities-list'],
        queryFn: async () => {
            const { data, error } = await supabase.from('cities').select('*');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useLocations() {
    return {
        useRegions: useRegionsList,
        useMunicipalities,
        useCities: useCitiesList,
        useAllMunicipalities: useMunicipalities
    };
}
export const useCities = useCitiesList;
export const useRegions = useRegionsList;


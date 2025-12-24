import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCities() {
    return useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cities')
                .select('*')
                .order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60 * 24 // 24 hours
    });
}

export function useRegions() {
    return useQuery({
        queryKey: ['regions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('regions')
                .select('*')
                .order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60 * 24 // 24 hours
    });
}

export function useMunicipalities() {
    return useQuery({
        queryKey: ['municipalities'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('municipalities')
                .select('*')
                .order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60 // 1 hour
    });
}

export function useLocations() {
    return {
        useCities,
        useRegions,
        useMunicipalities
    };
}

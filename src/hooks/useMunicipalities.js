import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMunicipalities(options = {}) {
    const {
        ids = null,
        includeInactive = false,
        search = ''
    } = options;

    return useQuery({
        queryKey: ['municipalities', { ids, includeInactive, search }],
        queryFn: async () => {
            let query = supabase
                .from('municipalities')
                .select('id, name_en, name_ar, region, city_type, approved_email_domains, mii_score, population, active_pilots')
                .order('name_en');

            // Apply filters
            if (!includeInactive) {
                query = query.eq('is_active', true);
            }

            if (ids && ids.length > 0) {
                query = query.in('id', ids);
            }

            if (search) {
                query = query.or(`name_en.ilike.%${search}%,name_ar.ilike.%${search}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    });
}

// Helper to get a single municipality
export function useMunicipality(id) {
    return useQuery({
        queryKey: ['municipality', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('municipalities')
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


export function useMunicipalitiesCount() {
    return useQuery({
        queryKey: ['municipalities-count'],
        queryFn: async () => {
            const { count, error } = await supabase
                .from('municipalities')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);
            if (error) throw error;
            return count || 0;
        },
        staleTime: 5 * 60 * 1000
    });
}

export default useMunicipalities;

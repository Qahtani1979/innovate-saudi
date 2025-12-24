import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStartupProfiles() {
    const useStartupProfile = (id) => useQuery({
        queryKey: ['startup-profile', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('startup_profiles')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;
            return data ? [data] : [];
        },
        enabled: !!id
    });

    return {
        useStartupProfile
    };
}

export function useStartups() {
    return useQuery({
        queryKey: ['startups'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('startup_profiles')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

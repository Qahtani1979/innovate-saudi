import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStartupProfile(id) {
    return useQuery({
        queryKey: ['startup-profile', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('startup_profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}

export function useStartupProfiles() {
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

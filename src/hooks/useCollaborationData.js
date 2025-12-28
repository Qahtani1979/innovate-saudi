import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useOrganizations() {
    return useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('organizations').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

export function useTeams() {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data, error } = await supabase.from('teams').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}


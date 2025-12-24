import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useExpertProfiles() {
    return useQuery({
        queryKey: ['expert-profiles'],
        queryFn: async () => {
            const { data, error } = await supabase.from('expert_profiles').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

export function useExpertAssignments() {
    return useQuery({
        queryKey: ['expert-assignments'],
        queryFn: async () => {
            const { data, error } = await supabase.from('expert_assignments').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useExpertAssignments(userEmail) {
    const useAssignments = () => useQuery({
        queryKey: ['expert-assignments', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_assignments')
                .select('*')
                .eq('expert_email', userEmail)
                .neq('status', 'completed');
            if (error) throw error;
            return data || [];
        },
        enabled: !!userEmail
    });

    return {
        useAssignments
    };
}

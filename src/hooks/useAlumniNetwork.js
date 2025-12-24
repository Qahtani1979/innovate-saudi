import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAlumniNetwork(programId) {
    const applications = useQuery({
        queryKey: ['alumni-applications', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_applications')
                .select('*')
                .eq('program_id', programId)
                .eq('status', 'accepted');

            if (error) throw error;
            return data || [];
        },
        enabled: !!programId
    });

    const solutions = useQuery({
        queryKey: ['alumni-solutions'],
        queryFn: async () => {
            const { data, error } = await supabase.from('solutions').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const pilots = useQuery({
        queryKey: ['alumni-pilots'],
        queryFn: async () => {
            const { data, error } = await supabase.from('pilots').select('*').eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        }
    });

    return {
        applications: applications.data || [],
        solutions: solutions.data || [],
        pilots: pilots.data || [],
        isLoading: applications.isLoading || solutions.isLoading || pilots.isLoading
    };
}

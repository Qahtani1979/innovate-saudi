
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMunicipalImpact(programId) {
    const programQuery = useQuery({
        queryKey: ['program', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!programId
    });

    const applicationsQuery = useQuery({
        queryKey: ['program-applications', programId],
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

    const pilotsQuery = useQuery({
        queryKey: ['pilots'],
        queryFn: async () => {
            const { data, error } = await supabase.from('pilots').select('*').eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        }
    });

    const solutionsQuery = useQuery({
        queryKey: ['solutions'],
        queryFn: async () => {
            const { data, error } = await supabase.from('solutions').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    return {
        program: programQuery.data,
        applications: applicationsQuery.data || [],
        pilots: pilotsQuery.data || [],
        solutions: solutionsQuery.data || [],
        isLoading: programQuery.isLoading || applicationsQuery.isLoading || pilotsQuery.isLoading || solutionsQuery.isLoading
    };
}

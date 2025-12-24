import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCaseStudyMutations() {
    const queryClient = useQueryClient();

    const createCaseStudy = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('case_studies').insert([data]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['case-studies'] });
            toast.success('Case study created successfully');
        },
        onError: (error) => {
            toast.error(`Failed to create case study: ${error.message}`);
        }
    });

    return {
        createCaseStudy
    };
}

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLabCertifications(livingLabId) {
    return useQuery({
        queryKey: ['lab-certifications', livingLabId],
        queryFn: async () => {
            if (!livingLabId) return [];
            const { data, error } = await supabase
                .from('lab_solution_certifications')
                .select('*')
                .eq('living_lab_id', livingLabId)
                .order('certification_date', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!livingLabId
    });
}

export function useIssueCertification() {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const { data: certification, error } = await supabase
                .from('lab_solution_certifications')
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            return certification;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-certifications'] });
            toast.success('Solution certified successfully');
        },
        onError: (error) => {
            console.error('Certification failed:', error);
            toast.error(`Failed to certify: ${error.message}`);
        }
    });
}


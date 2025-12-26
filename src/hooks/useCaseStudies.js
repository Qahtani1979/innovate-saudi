import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to fetch a single case study by ID
 */
export function useCaseStudy(id) {
    return useQuery({
        queryKey: ['case-study', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('case_studies')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

/**
 * Hook for fetching all case studies (public/published)
 */
export function useCaseStudies() {
    return useQuery({
        queryKey: ['case-studies'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('case_studies')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook for case study mutations
 */
export function useCaseStudyMutations() {
    const queryClient = useAppQueryClient();

    const updateCaseStudy = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase
                .from('case_studies')
                .update(data)
                .eq('id', id);
            if (error) throw error;
            return { id, ...data };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['case-study', data.id] });
            queryClient.invalidateQueries({ queryKey: ['case-studies'] });
            queryClient.invalidateQueries({ queryKey: ['case-studies-with-visibility'] });
            toast.success('Case study updated successfully');
        },
        onError: (error) => {
            console.error('Error updating case study:', error);
            toast.error('Failed to update case study');
        }
    });

    const createCaseStudy = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase
                .from('case_studies')
                .insert(data)
                .select()
                .single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['case-studies'] });
            queryClient.invalidateQueries({ queryKey: ['case-studies-with-visibility'] });
            toast.success('Case study created successfully');
        },
        onError: (error) => {
            console.error('Error creating case study:', error);
            toast.error('Failed to create case study');
        }
    });

    const deleteCaseStudy = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('case_studies').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['case-studies'] });
            queryClient.invalidateQueries({ queryKey: ['case-studies-with-visibility'] });
            toast.success('Case study deleted successfully');
        },
        onError: (error) => {
            console.error('Error deleting case study:', error);
            toast.error('Failed to delete case study');
        }
    });

    return {
        updateCaseStudy,
        createCaseStudy,
        deleteCaseStudy
    };
}


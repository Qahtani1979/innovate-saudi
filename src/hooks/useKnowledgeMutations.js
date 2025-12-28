import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useKnowledgeMutations() {
    const queryClient = useAppQueryClient();

    const deleteDocument = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('knowledge_documents').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] }); // In case of other hooks
            toast.success('Document deleted successfully');
        },
        onError: (error) => {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document');
        }
    });

    const deleteCaseStudy = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('case_studies').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['case-studies-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['case-studies'] });
            toast.success('Case study deleted successfully');
        },
        onError: (error) => {
            console.error('Error deleting case study:', error);
            toast.error('Failed to delete case study');
        }
    });

    /**
     * Refresh knowledge cache (Gold Standard Pattern)
     */
    const refreshKnowledge = () => {
        queryClient.invalidateQueries({ queryKey: ['knowledge-with-visibility'] });
        queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
        queryClient.invalidateQueries({ queryKey: ['case-studies-with-visibility'] });
        queryClient.invalidateQueries({ queryKey: ['case-studies'] });
    };

    return {
        deleteDocument,
        deleteCaseStudy,
        refreshKnowledge  // ✅ Gold Standard
    };
}




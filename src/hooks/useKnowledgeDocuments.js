import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

export function useKnowledgeDocuments(options = {}) {
    const queryClient = useQueryClient();
    const { limit } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    const useAllDocuments = () => useQuery({
        queryKey: ['knowledge-documents', limit],
        queryFn: async () => {
            let query = supabase.from('knowledge_documents').select('*').order('created_at', { ascending: false });

            query = applyVisibilityRules(query, 'knowledge_document');

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const useDocument = (id) => useQuery({
        queryKey: ['knowledge-document', id],
        queryFn: async () => {
            let query = supabase
                .from('knowledge_documents')
                .select('*')
                .eq('id', id)
                .single();

            query = applyVisibilityRules(query, 'knowledge_document');

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!id
    });

    return {
        useAllDocuments,
        useDocument
    };
}

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

export function useRDCallComments(callId) {
    return useQuery({
        queryKey: ['rdcall-comments', callId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_call_comments')
                .select('*')
                .eq('rd_call_id', callId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!callId
    });
}

export function useAddRDCallComment() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase
                .from('rd_call_comments')
                .insert([data]);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['rdcall-comments', variables.rd_call_id] });
            toast.success(t({ en: 'Comment added', ar: 'تم إضافة التعليق' }));
        },
        onError: (error) => {
            toast.error('Failed to add comment: ' + error.message);
        }
    });
}


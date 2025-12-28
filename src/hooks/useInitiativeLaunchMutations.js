import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuditLogger } from '@/hooks/useAuditLogger';

/**
 * Hook for initiative launch mutations (pilots, programs, rd_calls)
 */
export function useInitiativeLaunchMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { logAction } = useAuditLogger();

    const launchMutation = useMutation({
        mutationFn: async ({ entity_type, entity_id, action, comments }) => {
            const table = entity_type === 'pilot' ? 'pilots' : entity_type === 'program' ? 'programs' : 'rd_calls';

            const { error } = await supabase.from(table).update({
                launch_status: action === 'approve' ? 'approved' : 'rejected',
                launch_comments: comments
            }).eq('id', entity_id);

            if (error) throw error;
            return { entity_type, entity_id, action, table };
        },
        onSuccess: ({ entity_type, entity_id, action }) => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] });
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            queryClient.invalidateQueries({ queryKey: ['rd-calls'] });

            toast.success(t({ en: 'Launch decision recorded', ar: 'تم تسجيل قرار الإطلاق' }));

            logAction({
                action: action === 'approve' ? 'approve_launch' : 'reject_launch',
                entity_type: entity_type,
                entity_id: entity_id,
                details: { action, entity_type }
            });
        },
        onError: (error) => {
            console.error('Launch decision error:', error);
            toast.error(t({ en: 'Failed to record decision', ar: 'فشل تسجيل القرار' }));
        }
    });

    return {
        launchMutation
    };
}




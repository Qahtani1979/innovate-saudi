import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useExpertPanelMutations() {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();

    const createPanel = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('expert_panels').insert(data);
            if (error) throw error;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['expert-panels']);
            toast.success('Panel created');

            // Notification: Panel Created
            notify({
                type: 'expert_panel_created',
                entityType: 'expert_panel',
                entityId: 'new',
                recipientEmails: [], // Admin usually
                title: 'Expert Panel Created',
                message: `Expert Panel "${variables.name || 'New Panel'}" created.`,
                sendEmail: false // System only
            });
        }
    });

    const updatePanel = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase.from('expert_panels').update(data).eq('id', id);
            if (error) throw error;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['expert-panels']);
            queryClient.invalidateQueries(['expert-panel', variables.id]);
            toast.success('Panel updated');

            // Notification: Panel Updated
            notify({
                type: 'expert_panel_updated',
                entityType: 'expert_panel',
                entityId: variables.id,
                recipientEmails: [],
                title: 'Expert Panel Updated',
                message: `Expert Panel updated.`,
                sendEmail: false
            });
        }
    });

    return {
        createPanel,
        updatePanel
    };
}


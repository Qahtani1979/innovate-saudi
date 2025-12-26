import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useExpertPanelMutations() {
    const queryClient = useAppQueryClient();

    const createPanel = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('expert_panels').insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expert-panels']);
            toast.success('Panel created');
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
        }
    });

    return {
        createPanel,
        updatePanel
    };
}


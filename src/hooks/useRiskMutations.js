import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger } from '@/hooks/useAuditLogger';

export function useRiskMutations() {
    const queryClient = useAppQueryClient();
    const { logAction } = useAuditLogger();

    const createRisk = useMutation({
        mutationFn: async (newRisk) => {
            const { data, error } = await supabase
                .from('risks')
                .insert(newRisk)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['risks-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['risks'] });
            toast.success('Risk created successfully');
            logAction('create_risk', { risk_id: data.id, title: data.risk_title });
        },
        onError: (error) => {
            toast.error(`Failed to create risk: ${error.message}`);
        }
    });

    const updateRisk = useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from('risks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['risks-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['risks'] });
            toast.success('Risk updated successfully');
            logAction('update_risk', { risk_id: data.id, updates: data });
        },
        onError: (error) => {
            toast.error(`Failed to update risk: ${error.message}`);
        }
    });

    const deleteRisk = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('risks')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            queryClient.invalidateQueries({ queryKey: ['risks-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['risks'] });
            toast.success('Risk deleted successfully');
            logAction('delete_risk', { risk_id: id });
        },
        onError: (error) => {
            toast.error(`Failed to delete risk: ${error.message}`);
        }
    });

    return {
        createRisk,
        updateRisk,
        deleteRisk
    };
}


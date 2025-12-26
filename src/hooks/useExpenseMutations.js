/**
 * Pilot Expense Mutations Hook
 * Handles CRUD operations for pilot expenses with audit logging
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';

export function usePilotExpenses(pilotId) {
    return useQuery({
        queryKey: ['pilot-expenses', pilotId],
        queryFn: async () => {
            if (!pilotId) return [];
            const { data, error } = await supabase
                .from('pilot_expenses')
                .select('*')
                .eq('pilot_id', pilotId)
                .order('expense_date', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!pilotId
    });
}

export function useExpenseMutations(pilotId) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();

    /**
     * Create Expense
     */
    const createExpense = useMutation({
        mutationFn: async (data) => {
            const expenseData = {
                ...data,
                pilot_id: pilotId,
                created_by: user?.id,
                created_at: new Date().toISOString()
            };

            const { data: expense, error } = await supabase
                .from('pilot_expenses')
                .insert(expenseData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(
                AUDIT_ACTIONS.CREATE,
                ENTITY_TYPES.PILOT,
                pilotId,
                null,
                { expense_added: expenseData }
            );

            return expense;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilot-expenses', pilotId] });
            queryClient.invalidateQueries({ queryKey: ['pilot', pilotId] });
            toast.success('Expense added');
        },
        onError: (error) => {
            toast.error(`Failed to add expense: ${error.message}`);
        }
    });

    /**
     * Update Expense
     */
    const updateExpense = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: expense, error } = await supabase
                .from('pilot_expenses')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return expense;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilot-expenses', pilotId] });
            toast.success('Expense updated');
        }
    });

    /**
     * Delete Expense
     */
    const deleteExpense = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('pilot_expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilot-expenses', pilotId] });
            toast.success('Expense deleted');
        }
    });

    return {
        createExpense,
        updateExpense,
        deleteExpense,
        isCreating: createExpense.isPending,
        isUpdating: updateExpense.isPending,
        isDeleting: deleteExpense.isPending
    };
}

export default useExpenseMutations;


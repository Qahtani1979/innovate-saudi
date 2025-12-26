import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBudgets = (options = {}) => {
    return useQuery({
        queryKey: ['budgets', options],
        queryFn: async () => {
            let query = supabase
                .from('budgets')
                .select('*')
                .order('fiscal_year', { ascending: false });

            if (options.status) {
                query = query.eq('status', options.status);
            }

            if (options.is_deleted !== undefined) {
                query = query.eq('is_deleted', options.is_deleted);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
    });
};

export const useBudget = (budgetId) => {
    return useQuery({
        queryKey: ['budget', budgetId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('id', budgetId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!budgetId
    });
};

export const useBudgetMutations = () => {
    const queryClient = useAppQueryClient();

    // Create budget
    const createBudget = useMutation({
        mutationFn: async (budgetData) => {
            const { data, error } = await supabase
                .from('budgets')
                .insert(budgetData)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
            toast.success('Budget created successfully');
        },
        onError: (error) => {
            toast.error(`Error creating budget: ${error.message}`);
        }
    });

    // Update budget
    const updateBudget = useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from('budgets')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['budgets']);
            queryClient.invalidateQueries(['budget', data.id]);
            toast.success('Budget updated successfully');
        },
        onError: (error) => {
            toast.error(`Error updating budget: ${error.message}`);
        }
    });

    return {
        createBudget,
        updateBudget
    };
};


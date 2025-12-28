import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useStrategyLookup(tableName) {
    const queryClient = useAppQueryClient();

    const query = useQuery({
        queryKey: [tableName],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .order('display_order');
            if (error) throw error;
            return data || [];
        },
        enabled: !!tableName
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase
                .from(tableName)
                .insert([data]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries([tableName]);
            queryClient.invalidateQueries(['taxonomy-global']);
            toast.success('Created successfully');
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase
                .from(tableName)
                .update(data)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries([tableName]);
            queryClient.invalidateQueries(['taxonomy-global']);
            toast.success('Updated successfully');
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries([tableName]);
            queryClient.invalidateQueries(['taxonomy-global']);
            toast.success('Deleted successfully');
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    return {
        ...query,
        createMutation,
        updateMutation,
        deleteMutation
    };
}




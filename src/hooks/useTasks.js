import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@/hooks/useAppQueryClient';

export function useTasks(options = {}) {
    const queryClient = useAppQueryClient();
    const { user, isAdmin } = options;

    const useUserTasks = () => useQuery({
        queryKey: ['tasks', isAdmin, user?.email],
        queryFn: async () => {
            let query = supabase.from('tasks').select('*');

            // Non-admins only see their own tasks
            if (!isAdmin && user?.email) {
                query = query.or(`assigned_to.eq.${user.email},created_by.eq.${user.email}`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!user
    });

    const useCreateTask = () => useMutation({
        mutationFn: async (/** @type {any} */ data) => {
            const { data: createdTask, error } = await supabase
                .from('tasks')
                .insert({ ...data, assigned_to: data.assigned_to || user?.email })
                .select()
                .single();
            if (error) throw error;
            return createdTask;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task created successfully');
        }
    });

    const useUpdateTask = () => useMutation({
        mutationFn: async (/** @type {{id: string, data: any}} */ { id, data }) => {
            const { error } = await supabase.from('tasks').update(data).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task updated successfully');
        }
    });

    return {
        useUserTasks,
        useCreateTask,
        useUpdateTask
    };
}



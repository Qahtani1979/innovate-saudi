import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSandboxMilestones(applicationId) {
    const queryClient = useAppQueryClient();

    const milestonesQuery = useQuery({
        queryKey: ['sandbox-milestones', applicationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sandbox_project_milestones')
                .select('*')
                .eq('application_id', applicationId)
                .order('due_date', { ascending: true });
            if (error) throw error;
            return data || [];
        },
        enabled: !!applicationId
    });

    const createMilestone = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase
                .from('sandbox_project_milestones')
                .insert([{
                    ...data,
                    application_id: applicationId
                }]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-milestones', applicationId] });
            toast.success('Milestone created');
        }
    });

    const updateMilestone = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase
                .from('sandbox_project_milestones')
                .update(data)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-milestones', applicationId] });
            toast.success('Milestone updated');
        }
    });

    const deleteMilestone = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('sandbox_project_milestones')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-milestones', applicationId] });
            toast.success('Milestone deleted');
        }
    });

    return {
        milestones: milestonesQuery.data || [],
        isLoading: milestonesQuery.isLoading,
        createMilestone,
        updateMilestone,
        deleteMilestone
    };
}




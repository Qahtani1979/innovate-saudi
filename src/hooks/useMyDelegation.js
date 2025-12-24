import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMyDelegation(userEmail, t) {
    const queryClient = useQueryClient();

    const { data: teamMembers = [] } = useQuery({
        queryKey: ['team-members', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_email', userEmail)
                .maybeSingle();
            if (!userProfile?.organization_id) return [];

            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('organization_id', userProfile.organization_id)
                .neq('user_email', userEmail);
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: myTasks = [] } = useQuery({
        queryKey: ['delegatable-tasks', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data } = await supabase
                .from('tasks')
                .select('*')
                .eq('created_by', userEmail)
                .is('delegated_to', null)
                .neq('status', 'completed');
            return data || [];
        },
        enabled: !!userEmail
    });

    const { data: delegatedItems = [] } = useQuery({
        queryKey: ['delegated-items', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];
            const { data } = await supabase
                .from('tasks')
                .select('*')
                .eq('delegated_by', userEmail);
            return data || [];
        },
        enabled: !!userEmail
    });

    const delegateMutation = useMutation({
        mutationFn: async ({ taskId, delegateTo }) => {
            const { error } = await supabase
                .from('tasks')
                .update({
                    delegated_to: delegateTo,
                    delegated_by: userEmail,
                    delegated_date: new Date().toISOString()
                })
                .eq('id', taskId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delegatable-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['delegated-items'] });
            toast.success(t({ en: 'Task delegated successfully', ar: 'تم تفويض المهمة بنجاح' }));
        }
    });

    const recallMutation = useMutation({
        mutationFn: async (taskId) => {
            const { error } = await supabase
                .from('tasks')
                .update({
                    delegated_to: null,
                    delegated_by: null,
                    delegated_date: null
                })
                .eq('id', taskId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['delegatable-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['delegated-items'] });
            toast.success(t({ en: 'Task recalled successfully', ar: 'تم استرجاع المهمة بنجاح' }));
        }
    });

    return {
        teamMembers,
        myTasks,
        delegatedItems,
        delegateMutation,
        recallMutation
    };
}

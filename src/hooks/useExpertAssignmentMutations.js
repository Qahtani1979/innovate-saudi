import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useExpertAssignmentMutations() {
    const queryClient = useAppQueryClient();

    const acceptAssignment = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('expert_assignments')
                .update({
                    status: 'accepted',
                    accepted_date: new Date().toISOString()
                })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expert-assignments']);
            toast.success('Assignment accepted');
        }
    });

    const declineAssignment = useMutation({
        mutationFn: async ({ id, reason }) => {
            const { error } = await supabase
                .from('expert_assignments')
                .update({
                    status: 'declined',
                    declined_reason: reason
                })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expert-assignments']);
            toast.success('Assignment declined');
        }
    });

    const updateAssignmentStatus = useMutation({
        mutationFn: async ({ id, status, ...rest }) => {
            const { error } = await supabase
                .from('expert_assignments')
                .update({
                    status,
                    completed_date: status === 'completed' ? new Date().toISOString() : undefined,
                    ...rest
                })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expert-assignments']);
        }
    });

    const assignExperts = useMutation({
        mutationFn: async ({ assignments, expertEmails, entityType, selectedEntityId, assignmentNotes, dueDate }) => {
            const { data: created, error } = await supabase
                .from('expert_assignments')
                .insert(assignments)
                .select();

            if (error) throw error;

            // Send notifications via email-trigger-hub
            // We do this in the mutation fn to keep logic encapsulated
            for (const email of expertEmails) {
                try {
                    await supabase.functions.invoke('email-trigger-hub', {
                        body: {
                            trigger: 'evaluation.assigned',
                            recipient_email: email,
                            entity_type: entityType,
                            entity_id: selectedEntityId,
                            variables: {
                                entityType: entityType.replace(/_/g, ' '),
                                dueDate: dueDate || 'Not specified',
                                notes: assignmentNotes || ''
                            },
                            triggered_by: 'system'
                        }
                    });
                } catch (error) {
                    console.error('Failed to send notification to', email, error);
                }
            }

            return created;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expert-assignments']);
            queryClient.invalidateQueries(['all-assignments']);
            toast.success('Experts assigned and notified');
        }
    });

    return {
        acceptAssignment,
        declineAssignment,
        updateAssignmentStatus,
        assignExperts
    };
}


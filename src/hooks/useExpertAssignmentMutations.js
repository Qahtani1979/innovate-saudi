import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useExpertAssignmentMutations() {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();

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

            // Send notifications via useNotificationSystem
            await Promise.all(expertEmails.map(email => notify({
                type: 'evaluation_assigned',
                entityType: 'expert_assignment',
                entityId: selectedEntityId, // Using entity ID as context
                recipientEmails: [email],
                title: 'New Evaluation Assignment',
                message: `You have been assigned to evaluate: ${entityType.replace(/_/g, ' ')}. Due: ${dueDate || 'Not specified'}.`,
                sendEmail: true,
                emailTemplate: 'evaluation.assigned',
                emailVariables: {
                    entityType: entityType.replace(/_/g, ' '),
                    dueDate: dueDate || 'Not specified',
                    notes: assignmentNotes || ''
                }
            })));

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


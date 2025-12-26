/**
 * Sandbox Mutations Hook
 * Implements CRUD operations for Sandboxes with audit logging and notifications
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';

export function useSandboxMutations() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { logCrudOperation, logStatusChange } = useAuditLogger();
    const approveSandboxApplication = useApproveSandboxApplication();

    /**
     * Create Sandbox
     */
    const createSandbox = useMutation({
        mutationFn: async (data) => {
            const sandboxData = {
                ...data,
                created_by: user?.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: sandbox, error } = await supabase
                .from('sandboxes')
                .insert(sandboxData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(
                AUDIT_ACTIONS.CREATE,
                ENTITY_TYPES.SANDBOX,
                sandbox.id,
                null,
                sandboxData
            );

            return sandbox;
        },
        onSuccess: (sandbox) => {
            queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
            toast.success('Sandbox created successfully');
        },
        onError: (error) => {
            toast.error(`Failed to create sandbox: ${error.message}`);
        }
    });

    /**
     * Update Sandbox
     */
    const updateSandbox = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentSandbox } = await supabase
                .from('sandboxes')
                .select('*')
                .eq('id', id)
                .single();

            const updateData = {
                ...data,
                updated_at: new Date().toISOString()
            };

            const { data: sandbox, error } = await supabase
                .from('sandboxes')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(
                AUDIT_ACTIONS.UPDATE,
                ENTITY_TYPES.SANDBOX,
                id,
                currentSandbox,
                updateData
            );

            return sandbox;
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['sandbox', id] });
            await queryClient.cancelQueries({ queryKey: ['sandboxes'] });

            const previousSandbox = queryClient.getQueryData(['sandbox', id]);

            if (previousSandbox) {
                queryClient.setQueryData(['sandbox', id], old => ({
                    ...old,
                    ...data,
                    updated_at: new Date().toISOString()
                }));
            }

            return { previousSandbox };
        },
        onError: (error, { id }, context) => {
            if (context?.previousSandbox) {
                queryClient.setQueryData(['sandbox', id], context.previousSandbox);
            }
            toast.error(`Failed to update: ${error.message}`);
        },
        onSettled: (_, __, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['sandbox', id] });
            queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
        },
        onSuccess: () => {
            toast.success('Sandbox updated');
        }
    });

    /**
     * Delete Sandbox (soft delete)
     */
    const deleteSandbox = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('sandboxes')
                .update({
                    is_deleted: true,
                    deleted_by: user?.email,
                    deleted_date: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            await logCrudOperation(
                AUDIT_ACTIONS.DELETE,
                ENTITY_TYPES.SANDBOX,
                id,
                { id },
                { is_deleted: true }
            );

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
            toast.success('Sandbox deleted');
        }
    });

    /**
     * Change sandbox status
     */
    const changeStatus = useMutation({
        mutationFn: async ({ id, newStatus, notes }) => {
            const { data: currentSandbox } = await supabase
                .from('sandboxes')
                .select('*')
                .eq('id', id)
                .single();

            const { data: sandbox, error } = await supabase
                .from('sandboxes')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logStatusChange(
                ENTITY_TYPES.SANDBOX,
                id,
                currentSandbox.status,
                newStatus,
                { notes }
            );

            return { sandbox, oldStatus: currentSandbox.status };
        },
        onSuccess: ({ sandbox }) => {
            queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
            queryClient.invalidateQueries({ queryKey: ['sandbox', sandbox.id] });
            toast.success(`Status changed to ${sandbox.status}`);
        }
    });

    /**
     * Launch Sandbox
     */
    const launchSandbox = useMutation({
        mutationFn: async ({ id, checklist, notes, name }) => {
            const { error: updateError } = await supabase
                .from('sandboxes')
                .update({
                    status: 'active',
                    launch_date: new Date().toISOString().split('T')[0],
                    launch_checklist: checklist,
                    launch_notes: notes
                })
                .eq('id', id);
            if (updateError) throw updateError;

            // Create notification
            const { error: notifError } = await supabase
                .from('notifications')
                .insert([{
                    type: 'sandbox_launched',
                    title: `Sandbox Launched: ${name}`,
                    message: `${name} is now active and accepting applications.`,
                    severity: 'success',
                    link: `/SandboxDetail?id=${id}`
                }]);
            if (notifError) throw notifError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Sandbox launched successfully!');
        }
    });

    return {
        createSandbox,
        updateSandbox,
        deleteSandbox,
        changeStatus,
        isCreating: createSandbox.isPending,
        isUpdating: updateSandbox.isPending,
        isDeleting: deleteSandbox.isPending,
        approveSandbox: changeStatus.mutateAsync,
        launchSandbox, // New method
        approveSandboxApplication: approveSandboxApplication.mutateAsync
    };
}

/**
 * Approve/Reject Sandbox Application
 */
function useApproveSandboxApplication() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ id, approved, projectTitle }) => {
            const { error } = await supabase.from('sandbox_applications').update({
                status: approved ? 'approved' : 'rejected',
                approved_by: user?.email,
                approval_date: new Date().toISOString()
            }).eq('id', id);

            if (error) throw error;

            // Notification
            await supabase.from('notifications').insert({
                title: approved ? 'Sandbox Application Approved' : 'Sandbox Application Rejected',
                body: `Your application for ${projectTitle} has been ${approved ? 'approved' : 'rejected'}.`,
                notification_type: 'alert',
                priority: 'high',
                entity_type: 'SandboxApplication',
                entity_id: id
            });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-applications'] });
            toast.success('Application status updated');
        }
    });
}

export default useSandboxMutations;


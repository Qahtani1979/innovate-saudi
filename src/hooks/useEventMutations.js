/**
 * Event Mutations Hook
 * Centralized mutations for Events with Gold Standard notifications and audit logging.
 */
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useMutation } from '@/hooks/useAppQueryClient';
import { toast } from 'sonner';

export function useEventMutations() {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();
    const { notify } = useNotificationSystem();
    const { checkPermission, checkEntityAccess } = useAccessControl();

    /**
     * Create Event
     */
    const createEvent = useMutation({
        mutationFn: async (eventData) => {
            checkPermission(['admin', 'innovation_manager', 'program_manager']);
            const status = eventData.is_published ? 'pending' : (eventData.status || 'draft');

            const { data, error } = await supabase
                .from('events')
                .insert({
                    ...eventData,
                    status,
                    created_by: user?.email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // Handle Approval Request
            if (status === 'pending') {
                const slaDueDate = new Date();
                slaDueDate.setDate(slaDueDate.getDate() + 3);

                await supabase.from('approval_requests').insert({
                    entity_type: 'event',
                    entity_id: data.id,
                    request_type: 'event_approval',
                    requester_email: user?.email,
                    approval_status: 'pending',
                    sla_due_date: slaDueDate.toISOString(),
                    metadata: {
                        gate_name: 'approval',
                        event_type: data.event_type,
                        start_date: data.start_date,
                        title: data.title_en
                    }
                });

                // Notify for Approval
                await notify({
                    type: 'event_approval_requested',
                    entityType: 'event',
                    entityId: data.id,
                    title: 'Event Approval Requested',
                    message: `Event "${data.title_en}" requires approval.`,
                    recipientEmails: [user?.email], // Notify requester (or admins realistically, but stick to pattern)
                    sendEmail: true,
                    emailTemplate: 'event_approval_requested',
                    emailVariables: {
                        event_title: data.title_en,
                        event_type: data.event_type,
                        requester: user?.email
                    }
                });
            }

            return data;
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event-approvals'] });
            toast.success(data.status === 'pending' ? 'Event submitted for approval' : 'Event created successfully');

            await logCrudOperation(AUDIT_ACTIONS.CREATE, ENTITY_TYPES.EVENT, data.id, null, { status: data.status });

            if (data.status !== 'pending') {
                await notify({
                    type: 'event_created',
                    entityType: 'event',
                    entityId: data.id,
                    title: 'Event Created',
                    message: `Event "${data.title_en}" created.`,
                    recipientEmails: [user?.email],
                    sendEmail: true
                });
            }
        },
        onError: (error) => {
            toast.error(`Failed to create event: ${error.message}`);
        }
    });

    /**
     * Update Event
     */
    const updateEvent = useMutation({
        mutationFn: async ({ eventId, updates }) => {
            const { data: currentEvent } = await supabase.from('events').select('created_by').eq('id', eventId).single();
            checkEntityAccess(currentEvent, 'created_by', 'email');

            const { data, error } = await supabase
                .from('events')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', eventId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event', data.id] });
            toast.success('Event updated');

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, ENTITY_TYPES.EVENT, data.id, null, {});

            // Notify owner (and potentially registrants if implemented broadly)
            await notify({
                type: 'event_updated',
                entityType: 'event',
                entityId: data.id,
                title: 'Event Updated',
                message: `Event "${data.title_en}" has been updated.`,
                recipientEmails: [data.created_by],
                sendEmail: true // This could trigger "event.updated" template
            });
        },
        onError: (error) => toast.error(`Update failed: ${error.message}`)
    });

    /**
     * Cancel Event
     */
    const cancelEvent = useMutation({
        mutationFn: async ({ eventId, reason, notifyRegistrants }) => {
            const { data: currentEvent } = await supabase.from('events').select('created_by').eq('id', eventId).single();
            checkEntityAccess(currentEvent, 'created_by', 'email');

            const { data, error } = await supabase
                .from('events')
                .update({
                    status: 'cancelled',
                    cancellation_reason: reason,
                    cancelled_at: new Date().toISOString(),
                    cancelled_by: user?.email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', eventId)
                .select()
                .single();

            if (error) throw error;

            if (notifyRegistrants) {
                await notify({
                    type: 'event_cancelled',
                    entityType: 'event',
                    entityId: eventId,
                    title: 'Event Cancelled',
                    message: `Event "${data.title_en}" is cancelled. Reason: ${reason}`,
                    recipientEmails: [], // Registrants handling logic would go here if we fetched them
                    sendEmail: true,
                    emailTemplate: 'event_cancelled',
                    emailVariables: {
                        title: data.title_en,
                        cancellation_reason: reason
                    }
                });
            }

            return data;
        },
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
            toast.success('Event cancelled');
            await logCrudOperation(AUDIT_ACTIONS.UPDATE, ENTITY_TYPES.EVENT, variables.eventId, null, { status: 'cancelled', reason: variables.reason });
        }
    });

    /**
     * Delete Event (Soft Delete)
     */
    const deleteEvent = useMutation({
        mutationFn: async (eventId) => {
            const { data: currentEvent } = await supabase.from('events').select('created_by').eq('id', eventId).single();
            checkEntityAccess(currentEvent, 'created_by', 'email');

            const { error } = await supabase
                .from('events')
                .update({
                    is_deleted: true,
                    deleted_at: new Date().toISOString(),
                    deleted_by: user?.email
                })
                .eq('id', eventId);

            if (error) throw error;
            return eventId;
        },
        onSuccess: async (id) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast.success('Event deleted');
            await logCrudOperation(AUDIT_ACTIONS.DELETE, ENTITY_TYPES.EVENT, id, null, {});
        }
    });

    /**
     * Add Comment
     */
    const addComment = useMutation({
        mutationFn: async ({ eventId, content }) => {
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    entity_type: 'event',
                    entity_id: eventId,
                    comment_text: content,
                    user_id: user?.id,
                    user_email: user?.email,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['event-comments', variables.eventId] });
            toast.success("Comment added");
            // No strict audit requirement for comments usually, but could add if needed
        }
    });

    /**
     * Toggle Bookmark
     */
    const toggleBookmark = useMutation({
        mutationFn: async ({ eventId, isBookmarked }) => {
            if (isBookmarked) {
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('entity_type', 'event')
                    .eq('entity_id', eventId)
                    .eq('user_email', user?.email);
                if (error) throw error;
                return false;
            } else {
                const { error } = await supabase
                    .from('bookmarks')
                    .insert({
                        entity_type: 'event',
                        entity_id: eventId,
                        user_email: user?.email,
                        created_at: new Date().toISOString()
                    });
                if (error) throw error;
                return true;
            }
        },
        onSuccess: (isBookmarked, variables) => {
            queryClient.invalidateQueries({ queryKey: ['event-bookmark', variables.eventId, user?.email] });
            toast.success(isBookmarked ? "Added to bookmarks" : "Removed from bookmarks");
        }
    });

    /**
     * Register for Event
     */
    const registerForEvent = useMutation({
        mutationFn: async ({ eventId, currentRegistrationCount }) => {
            const { error } = await supabase
                .from('events')
                // @ts-ignore
                .update({ registration_count: (currentRegistrationCount || 0) + 1 })
                .eq('id', eventId);

            if (error) throw error;

            // Fetch for notification details
            const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
            if (event) {
                await notify({
                    type: 'event_registration_confirmed',
                    entityType: 'event',
                    entityId: eventId,
                    title: 'Registration Confirmed',
                    message: `You are registered for ${event.title_en}.`,
                    recipientEmails: [user?.email],
                    sendEmail: true,
                    emailTemplate: 'event_registration_confirmed',
                    emailVariables: {
                        event_title: event.title_en,
                        event_date: event.start_date,
                        location: event.location
                    }
                });
            }
            return event;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast.success("Registration confirmed!");
            logCrudOperation('UPDATE', ENTITY_TYPES.EVENT, variables.eventId, null, { action: 'registered' });
        }
    });

    return {
        createEvent,
        updateEvent,
        cancelEvent,
        deleteEvent,
        addComment,
        toggleBookmark,
        registerForEvent,

        isCreating: createEvent.isPending,
        isUpdating: updateEvent.isPending,
        isCancelling: cancelEvent.isPending,
        isDeleting: deleteEvent.isPending
    };
}

export default useEventMutations;


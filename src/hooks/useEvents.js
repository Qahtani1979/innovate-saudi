import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useAutoNotification } from '@/hooks/useAutoNotification';
import { toast } from 'sonner';
import { useAccessControl } from '@/hooks/useAccessControl';

/**
 * Hook for event CRUD operations
 */
export function useEvents(options = {}) {
  const {
    filters = {},
    programId = null,
    municipalityId = null,
    limit = 50,
    includeUnpublished = false
  } = options;

  const queryClient = useAppQueryClient();
  const { user } = useAuth();
  const { triggerEmail } = useEmailTrigger();
  const { logEventActivity, logApprovalActivity } = useAuditLog();
  const { notifyEventAction } = useAutoNotification();
  const { checkPermission, checkEntityAccess } = useAccessControl();

  // Fetch events
  const eventsQuery = useQuery({
    queryKey: ['events', { filters, programId, municipalityId, limit, includeUnpublished }],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_deleted', false)
        .order('start_date', { ascending: true });

      // Apply filters
      if (!includeUnpublished) {
        query = query.eq('is_published', true);
      }
      if (programId) {
        query = query.eq('program_id', programId);
      }
      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
      }
      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.mode) {
        query = query.eq('is_virtual', filters.mode === 'virtual');
      }
      if (filters.search) {
        query = query.or(`title_en.ilike.%${filters.search}%,title_ar.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%`);
      }
      if (filters.upcoming) {
        query = query.gte('start_date', new Date().toISOString());
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Create event
  const createEventMutation = useMutation({
    /** @param {any} eventData */
    mutationFn: async (eventData) => {
      checkPermission(['admin', 'innovation_manager', 'program_manager']);
      // Determine status: if publishing, set to 'pending' for approval workflow
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

      // Create approval request for events requiring approval
      if (status === 'pending') {
        const slaDueDate = new Date();
        slaDueDate.setDate(slaDueDate.getDate() + 3); // 3-day SLA

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

        // Trigger submission notification
        try {
          await triggerEmail('event.submitted', {
            entity_type: 'event',
            entity_id: data.id,
            recipient_email: user?.email,
            entity_data: {
              title: data.title_en,
              start_date: data.start_date,
              event_type: data.event_type
            }
          });
        } catch (e) {
          console.warn('Email trigger for event.submitted failed:', e);
        }
      }

      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-approvals'] });

      // Audit logging
      const action = data.status === 'pending' ? 'submitted' : 'created';
      await logEventActivity(action, data);
      if (data.status === 'pending') {
        await logApprovalActivity('submitted', 'event', data.id, {
          event_title: data.title_en,
          event_type: data.event_type
        });
      }

      // Create in-app notification
      try {
        if (data.status === 'pending') {
          await notifyEventAction(data, 'submitted');
        } else {
          await notifyEventAction(data, 'created');
        }
      } catch (e) {
        console.warn('In-app notification failed:', e);
      }

      // Trigger email notification for draft (not pending approval)
      if (data.status === 'draft') {
        try {
          await triggerEmail('event.created', {
            entity_type: 'event',
            entity_id: data.id,
            recipient_email: user?.email,
            entity_data: {
              title: data.title_en,
              start_date: data.start_date,
              location: data.location
            }
          });
        } catch (e) {
          console.warn('Email trigger failed:', e);
        }
      }
    }
  });

  // Update event
  const updateEventMutation = useMutation({
    /** @param {{eventId: string, updates: any}} params */
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
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });

      // Audit logging
      await logEventActivity('updated', data, {
        updated_fields: Object.keys(variables.updates || {})
      });

      // Notify registrants if significant changes
      // @ts-ignore
      if (data.registration_count > 0) {
        try {
          await triggerEmail('event.updated', {
            entity_type: 'event',
            entity_id: data.id,
            entity_data: {
              title: data.title_en,
              start_date: data.start_date,
              location: data.location
            }
          });
        } catch (e) {
          console.warn('Email trigger failed:', e);
        }
      }
    }
  });

  // Cancel event
  const cancelEventMutation = useMutation({
    /** @param {{eventId: string, reason: string, notifyRegistrants: boolean}} params */
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

      // Create in-app notification for cancellation
      try {
        await notifyEventAction(data, 'cancelled');
      } catch (e) {
        console.warn('In-app notification failed:', e);
      }

      // Notify registrants
      if (notifyRegistrants) {
        await triggerEmail('event.cancelled', {
          entity_type: 'event',
          entity_id: eventId,
          entity_data: {
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

      // Audit logging
      await logEventActivity('cancelled', data, {
        reason: variables.reason
      });
    }
  });

  // Delete event (soft delete)
  const deleteEventMutation = useMutation({
    /** @param {string} eventId */
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
    },
    onSuccess: async (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });

      // Audit logging
      await logEventActivity('deleted', { id: eventId });
    }
  });

  return {
    // Query
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,

    // Single event hook - explicit call
    useEvent,

    // Mutations
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    cancelEvent: cancelEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,

    // Mutation states
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isCancelling: cancelEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending
  };
}

// Named export for single event to allow usage without fetching full list
export function useEvent(eventId) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('is_deleted', false)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId
  });
}

/**
 * Hook for upcoming events - convenience wrapper
 */
export function useUpcomingEvents(options = {}) {
  return useEvents({
    ...options,
    filters: { ...options.filters, upcoming: true }
  });
}

/**
 * Hook for program events - convenience wrapper
 */
export function useProgramEvents(programId, options = {}) {
  return useEvents({
    ...options,
    programId
  });
}

/**
 * Hook for event comments
 */
export function useEventComments(eventId) {
  return useQuery({
    queryKey: ['event-comments', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            email,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('entity_type', 'event')
        .eq('entity_id', eventId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId
  });
}

/**
 * Hook for event bookmark status
 */
export function useEventBookmarkStatus(eventId, userEmail) {
  return useQuery({
    queryKey: ['event-bookmark', eventId, userEmail],
    queryFn: async () => {
      if (!userEmail) return false;
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('entity_type', 'event')
        .eq('entity_id', eventId)
        .eq('user_email', userEmail)
        .maybeSingle();

      if (error) return false;
      return !!data;
    },
    enabled: !!eventId && !!userEmail
  });
}

/**
 * Hook for Event Mutations (Comments, Bookmarks, Registration)
 */
export function useEventMutations() {
  const queryClient = useAppQueryClient();
  const { user } = useAuth();
  const { triggerEmail } = useEmailTrigger();

  const addComment = useMutation({
    /** @param {{eventId: string, content: string}} params */
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
    }
  });

  const toggleBookmark = useMutation({
    /** @param {{eventId: string, isBookmarked: boolean}} params */
    mutationFn: async ({ eventId, isBookmarked }) => {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('entity_type', 'event')
          .eq('entity_id', eventId)
          .eq('user_email', user?.email);
        if (error) throw error;
        return false;
      } else {
        // Add bookmark
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

  const registerForEvent = useMutation({
    /** @param {{eventId: string, currentRegistrationCount: number}} params */
    mutationFn: async ({ eventId, currentRegistrationCount }) => {
      // Optimistic update of count or fetch fresh?
      // Ideally we use a stored procedure or increments.
      // Supabase doesn't have native increment in .update easily without rpc or raw sql, 
      // but we can just use the passed or fetched count.
      // Let's use the fetched count from existing event data + 1 for safety, or rpc.
      // For simple refactor, we stick to logic: update { registration_count: n + 1 }

      const { error } = await supabase
        .from('events')
        // @ts-ignore
        .update({ registration_count: (currentRegistrationCount || 0) + 1 })
        .eq('id', eventId);

      if (error) throw error;

      // Trigger email
      // Need event details. 
      // We can fetch them or assume query invalidation handles UI.
      // We need strict event details for email though.
      // Let's fetch event to be sure
      const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();

      if (event) {
        await triggerEmail('event.registration_confirmed', {
          entity_type: 'event',
          entity_id: eventId,
          recipient_email: user?.email,
          variables: { // Use variables or entity_data depending on handle
            event_title: event.title_en,
            event_date: event.start_date,
            location: event.location
          },
          entity_data: { // duplicate for safety depending on template
            title: event.title_en,
            start_date: event.start_date,
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
    }
  });

  return {
    addComment,
    toggleBookmark,
    registerForEvent
  };
}

export function useEventInvalidator() {
  const queryClient = useAppQueryClient();
  return {
    invalidateEvent: (eventId) => queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
    invalidateEvents: () => queryClient.invalidateQueries({ queryKey: ['events'] })
  };
}

export default useEvents;


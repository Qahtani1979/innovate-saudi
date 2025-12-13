import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { notifyEventAction } from '@/components/AutoNotification';
import { toast } from 'sonner';

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

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { triggerEmail } = useEmailTrigger();

  // Fetch events
  const eventsQuery = useQuery({
    queryKey: ['events', { filters, programId, municipalityId, limit, includeUnpublished }],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
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

  // Fetch single event
  const useEvent = (eventId) => {
    return useQuery({
      queryKey: ['event', eventId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
        
        if (error) throw error;
        return data;
      },
      enabled: !!eventId
    });
  };

  // Create event
  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
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
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['event-approvals']);
      
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
    mutationFn: async ({ eventId, updates }) => {
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
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['event', variables.eventId]);

      // Notify registrants if significant changes
      if (data.registered_count > 0) {
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
    mutationFn: async ({ eventId, reason, notifyRegistrants }) => {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['event', variables.eventId]);
    }
  });

  // Delete event (soft delete)
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
    }
  });

  return {
    // Query
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,

    // Single event hook
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

export default useEvents;

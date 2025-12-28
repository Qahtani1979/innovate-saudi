import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@/hooks/useAppQueryClient';

/**
 * Hook for event CRUD operations (Queries Only)
 */
export function useEvents(options = {}) {
  const {
    filters = {},
    programId = null,
    municipalityId = null,
    limit = 50,
    includeUnpublished = false
  } = options;

  const { user } = useAuth();

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

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,

    // Explicitly re-export helper hooks usage if expected, 
    // but better to use useEventMutations separately.
    // We will keep useEvent for single fetch.
    useEvent
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

export function useEventInvalidator() {
  const queryClient = useAppQueryClient();
  return {
    invalidateEvent: (eventId) => queryClient.invalidateQueries({ queryKey: ['event', eventId] }),
    invalidateEvents: () => queryClient.invalidateQueries({ queryKey: ['events'] })
  };
}

export default useEvents;



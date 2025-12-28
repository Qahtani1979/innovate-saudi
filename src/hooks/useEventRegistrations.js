import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for managing event registrations
 * Provides CRUD operations and status management for event_registrations table
 */
export function useEventRegistrations(options = {}) {
  const { eventId, userId, userEmail } = options;
  const queryClient = useAppQueryClient();

  // Fetch registrations for an event
  const {
    data: registrations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      let query = supabase
        .from('event_registrations')
        .select(`
          *,
          events:event_id (
            id,
            title_en,
            title_ar,
            start_date,
            end_date,
            location,
            event_type
          )
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      
      if (userEmail) {
        query = query.eq('user_email', userEmail);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId || !!userEmail
  });

  // Check if user is registered for an event
  const checkRegistration = async (checkEventId, checkUserEmail) => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id, status')
      .eq('event_id', checkEventId)
      .eq('user_email', checkUserEmail)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async (registrationData) => {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: registrationData.eventId,
          user_id: registrationData.userId || null,
          user_email: registrationData.userEmail,
          registration_type: registrationData.registrationType || 'individual',
          status: 'registered',
          notes: registrationData.notes || null,
          dietary_requirements: registrationData.dietaryRequirements || null,
          accessibility_needs: registrationData.accessibilityNeeds || null,
          registered_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-registrations']);
      toast.success('Successfully registered for event');
    },
    onError: (error) => {
      toast.error(`Registration failed: ${error.message}`);
    }
  });

  // Update registration status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ registrationId, status, notes }) => {
      const updateData = { status };
      
      if (status === 'attended') {
        updateData.attended_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        if (notes) updateData.cancellation_reason = notes;
      }

      const { data, error } = await supabase
        .from('event_registrations')
        .update(updateData)
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['event-registrations']);
      toast.success(`Status updated to ${data.status}`);
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    }
  });

  // Cancel registration mutation
  const cancelMutation = useMutation({
    mutationFn: async ({ registrationId, reason }) => {
      const { data, error } = await supabase
        .from('event_registrations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || null
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-registrations']);
      toast.success('Registration cancelled');
    },
    onError: (error) => {
      toast.error(`Cancellation failed: ${error.message}`);
    }
  });

  // Bulk update attendance mutation
  const bulkUpdateAttendanceMutation = useMutation({
    mutationFn: async ({ registrationIds, attended }) => {
      const status = attended ? 'attended' : 'no_show';
      const updateData = { 
        status,
        ...(attended && { attended_at: new Date().toISOString() })
      };

      const { data, error } = await supabase
        .from('event_registrations')
        .update(updateData)
        .in('id', registrationIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['event-registrations']);
      toast.success(`Updated ${data.length} registrations`);
    },
    onError: (error) => {
      toast.error(`Bulk update failed: ${error.message}`);
    }
  });

  // Get registration stats for an event
  const getEventStats = (eventRegistrations) => {
    const stats = {
      total: eventRegistrations?.length || 0,
      registered: 0,
      attended: 0,
      cancelled: 0,
      noShow: 0,
      waitlisted: 0
    };

    eventRegistrations?.forEach(reg => {
      switch (reg.status) {
        case 'registered':
          stats.registered++;
          break;
        case 'attended':
          stats.attended++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
        case 'no_show':
          stats.noShow++;
          break;
        case 'waitlisted':
          stats.waitlisted++;
          break;
      }
    });

    return stats;
  };

  return {
    registrations,
    isLoading,
    error,
    refetch,
    checkRegistration,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    cancel: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    bulkUpdateAttendance: bulkUpdateAttendanceMutation.mutate,
    isBulkUpdating: bulkUpdateAttendanceMutation.isPending,
    getEventStats: () => getEventStats(registrations)
  };
}

/**
 * Hook for getting user's registrations
 */
export function useUserEventRegistrations(userEmail) {
  return useQuery({
    queryKey: ['user-event-registrations', userEmail],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events:event_id (
            id,
            title_en,
            title_ar,
            start_date,
            end_date,
            location,
            event_type,
            event_mode,
            status
          )
        `)
        .eq('user_email', userEmail)
        .eq('is_deleted', false)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userEmail
  });
}

export default useEventRegistrations;




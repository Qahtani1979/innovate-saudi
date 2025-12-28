import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useCommunicationNotifications(communicationPlanId) {
  const queryClient = useAppQueryClient();

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['communication-notifications', communicationPlanId],
    queryFn: async () => {
      let query = supabase
        .from('communication_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (communicationPlanId) {
        query = query.eq('communication_plan_id', communicationPlanId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const createNotification = useMutation({
    mutationFn: async (notificationData) => {
      const { data, error } = await supabase
        .from('communication_notifications')
        .insert([notificationData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-notifications'] });
    }
  });

  const scheduleNotification = useMutation({
    mutationFn: async ({ id, scheduledAt }) => {
      const { data, error } = await supabase
        .from('communication_notifications')
        .update({ 
          scheduled_at: scheduledAt,
          status: 'scheduled'
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-notifications'] });
    }
  });

  const cancelNotification = useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from('communication_notifications')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-notifications'] });
    }
  });

  const getNotificationStats = () => {
    const stats = {
      total: notifications.length,
      pending: notifications.filter(n => n.status === 'pending').length,
      scheduled: notifications.filter(n => n.status === 'scheduled').length,
      sent: notifications.filter(n => n.status === 'sent').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      totalDelivered: notifications.reduce((sum, n) => sum + (n.delivery_stats?.delivered || 0), 0),
      totalOpened: notifications.reduce((sum, n) => sum + (n.delivery_stats?.opened || 0), 0),
      totalClicked: notifications.reduce((sum, n) => sum + (n.delivery_stats?.clicked || 0), 0)
    };
    return stats;
  };

  return {
    notifications,
    isLoading,
    error,
    createNotification: createNotification.mutateAsync,
    scheduleNotification: scheduleNotification.mutateAsync,
    cancelNotification: cancelNotification.mutateAsync,
    getNotificationStats,
    isCreating: createNotification.isPending
  };
}

export default useCommunicationNotifications;




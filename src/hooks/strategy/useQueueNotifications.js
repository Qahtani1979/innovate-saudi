import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for managing queue-related notifications
 * Tracks items needing review, rejections, and automation status
 */
export function useQueueNotifications(strategicPlanId) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch review items that need attention
  const { data: reviewItems = [], isLoading: isLoadingReview } = useQuery({
    queryKey: ['queue-review-items', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return [];
      
      const { data, error } = await supabase
        .from('demand_queue')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .eq('status', 'review')
        .order('quality_score', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategicPlanId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch rejected items for feedback analysis
  const { data: rejectedItems = [], isLoading: isLoadingRejected } = useQuery({
    queryKey: ['queue-rejected-items', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return [];
      
      const { data, error } = await supabase
        .from('demand_queue')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .eq('status', 'rejected')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategicPlanId
  });

  // Fetch recent notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['strategy-notifications', strategicPlanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_notifications')
        .select('*')
        .eq('entity_type', 'strategic_plan')
        .eq('entity_id', strategicPlanId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) return [];
      return data || [];
    },
    enabled: !!strategicPlanId
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId) => {
      const { error } = await supabase
        .from('citizen_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-notifications', strategicPlanId] });
    }
  });

  // Approve review item
  const approveItem = useMutation({
    mutationFn: async (itemId) => {
      const { data, error } = await supabase
        .from('demand_queue')
        .update({ 
          status: 'accepted',
          quality_feedback: {
            manually_approved: true,
            approved_at: new Date().toISOString()
          }
        })
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-review-items', strategicPlanId] });
      queryClient.invalidateQueries({ queryKey: ['demand-queue', strategicPlanId] });
      toast({ title: 'Item approved', description: 'The generated item has been accepted' });
    }
  });

  // Reject item with feedback
  const rejectItemWithFeedback = useMutation({
    mutationFn: async ({ itemId, reason, improvementNotes }) => {
      const { data, error } = await supabase
        .from('demand_queue')
        .update({ 
          status: 'rejected',
          quality_feedback: {
            rejection_reason: reason,
            improvement_notes: improvementNotes,
            rejected_at: new Date().toISOString()
          }
        })
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-review-items', strategicPlanId] });
      queryClient.invalidateQueries({ queryKey: ['queue-rejected-items', strategicPlanId] });
      queryClient.invalidateQueries({ queryKey: ['demand-queue', strategicPlanId] });
      toast({ title: 'Item rejected', description: 'Feedback recorded for learning' });
    }
  });

  // Request regeneration with feedback
  const requestRegeneration = useMutation({
    mutationFn: async ({ itemId, feedbackNotes }) => {
      const { data, error } = await supabase
        .from('demand_queue')
        .update({ 
          status: 'pending',
          generated_entity_id: null,
          quality_score: null,
          quality_feedback: {
            regeneration_requested: true,
            feedback_notes: feedbackNotes,
            requested_at: new Date().toISOString()
          }
        })
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-review-items', strategicPlanId] });
      queryClient.invalidateQueries({ queryKey: ['demand-queue', strategicPlanId] });
      toast({ title: 'Regeneration queued', description: 'Item will be regenerated with feedback' });
    }
  });

  // Get rejection patterns for learning
  const getRejectionPatterns = () => {
    if (!rejectedItems.length) return [];
    
    const patterns = rejectedItems.reduce((acc, item) => {
      const reason = item.quality_feedback?.rejection_reason || 'unspecified';
      if (!acc[reason]) {
        acc[reason] = { count: 0, examples: [], entityTypes: new Set() };
      }
      acc[reason].count++;
      acc[reason].examples.push(item.prefilled_spec?.title_en || 'Untitled');
      acc[reason].entityTypes.add(item.entity_type);
      return acc;
    }, {});

    return Object.entries(patterns)
      .map(([reason, data]) => ({
        reason,
        count: data.count,
        examples: data.examples.slice(0, 3),
        entityTypes: [...data.entityTypes]
      }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    reviewItems,
    reviewCount: reviewItems.length,
    rejectedItems,
    rejectedCount: rejectedItems.length,
    notifications,
    unreadCount: notifications.length,
    isLoading: isLoadingReview || isLoadingRejected,
    markAsRead,
    approveItem,
    rejectItemWithFeedback,
    requestRegeneration,
    getRejectionPatterns
  };
}

import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useDemandQueue(strategicPlanId) {
  const queryClient = useAppQueryClient();
  const { toast } = useToast();

  // Fetch queue items for plan
  const { data: queueItems = [], isLoading, refetch } = useQuery({
    queryKey: ['demand-queue', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return [];
      
      const { data, error } = await supabase
        .from('demand_queue')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('priority_score', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategicPlanId
  });

  // Get next pending item by entity type
  const getNextItem = (entityType) => {
    return queueItems.find(
      item => item.entity_type === entityType && item.status === 'pending'
    );
  };

  // Get all pending items by entity type
  const getPendingByType = (entityType) => {
    return queueItems.filter(
      item => item.entity_type === entityType && item.status === 'pending'
    );
  };

  // Update item status
  const updateItemStatus = useMutation({
    mutationFn: async ({ id, status, quality_feedback }) => {
      const updates = { 
        status,
        ...(status === 'in_progress' && { last_attempt_at: new Date().toISOString() }),
        ...(quality_feedback && { quality_feedback })
      };
      
      const { data, error } = await supabase
        .from('demand_queue')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demand-queue', strategicPlanId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Complete item with generated entity
  const completeItem = useMutation({
    mutationFn: async ({ id, generated_entity_id, generated_entity_type, quality_score, status }) => {
      const { data, error } = await supabase
        .from('demand_queue')
        .update({
          generated_entity_id,
          generated_entity_type,
          quality_score,
          status: status || (quality_score >= 70 ? 'accepted' : 'review'),
          attempts: supabase.sql`attempts + 1`
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demand-queue', strategicPlanId] });
      toast({ title: 'Success', description: 'Queue item completed' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Delete queue item
  const deleteItem = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('demand_queue')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demand-queue', strategicPlanId] });
    }
  });

  // Clear all pending items
  const clearPendingItems = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('demand_queue')
        .delete()
        .eq('strategic_plan_id', strategicPlanId)
        .eq('status', 'pending');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demand-queue', strategicPlanId] });
      toast({ title: 'Queue cleared', description: 'All pending items removed' });
    }
  });

  // Group items by entity type
  const byType = queueItems.reduce((acc, item) => {
    if (!acc[item.entity_type]) {
      acc[item.entity_type] = [];
    }
    acc[item.entity_type].push(item);
    return acc;
  }, {});

  // Calculate stats
  const stats = {
    total: queueItems.length,
    pending: queueItems.filter(i => i.status === 'pending').length,
    inProgress: queueItems.filter(i => i.status === 'in_progress').length,
    completed: queueItems.filter(i => ['accepted', 'generated'].includes(i.status)).length,
    review: queueItems.filter(i => i.status === 'review').length,
    rejected: queueItems.filter(i => i.status === 'rejected').length
  };

  return {
    queueItems,
    isLoading,
    refetch,
    getNextItem,
    getPendingByType,
    updateItemStatus,
    completeItem,
    deleteItem,
    clearPendingItems,
    byType,
    stats
  };
}




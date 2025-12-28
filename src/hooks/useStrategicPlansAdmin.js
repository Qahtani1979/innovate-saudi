import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

/**
 * Admin hook for full strategic plan lifecycle management
 * Provides CRUD operations and lifecycle transitions
 */
export function useStrategicPlansAdmin(options = {}) {
  const queryClient = useAppQueryClient();
  const { user } = useAuth();
  const { 
    includeDeleted = false, 
    includeTemplates = false,
    statusFilter = null // 'draft' | 'active' | 'completed' | 'archived' | null (all)
  } = options;

  // Fetch all plans with optional filters
  const { data: plans = [], isLoading, refetch } = useQuery({
    queryKey: ['strategic-plans-admin', includeDeleted, includeTemplates, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('strategic_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!includeDeleted) {
        query = query.or('is_deleted.is.null,is_deleted.eq.false');
      }
      
      if (!includeTemplates) {
        query = query.or('is_template.is.null,is_template.eq.false');
      }
      
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Activate a plan (after approval)
  const activatePlan = useMutation({
    mutationFn: async (planId) => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .update({
          status: 'active',
          activated_at: new Date().toISOString(),
          activated_by: user?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      queryClient.invalidateQueries(['strategic-plans-admin']);
      queryClient.invalidateQueries(['strategic-plans-global']);
      toast.success('Plan activated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to activate plan: ${error.message}`);
    }
  });

  // Complete a plan
  const completePlan = useMutation({
    mutationFn: async (planId) => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      queryClient.invalidateQueries(['strategic-plans-admin']);
      queryClient.invalidateQueries(['strategic-plans-global']);
      toast.success('Plan marked as completed');
    },
    onError: (error) => {
      toast.error(`Failed to complete plan: ${error.message}`);
    }
  });

  // Archive a plan
  const archivePlan = useMutation({
    mutationFn: async (planId) => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
          archived_by: user?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      queryClient.invalidateQueries(['strategic-plans-admin']);
      queryClient.invalidateQueries(['strategic-plans-global']);
      toast.success('Plan archived');
    },
    onError: (error) => {
      toast.error(`Failed to archive plan: ${error.message}`);
    }
  });

  // Soft delete a plan
  const deletePlan = useMutation({
    mutationFn: async (planId) => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      queryClient.invalidateQueries(['strategic-plans-admin']);
      queryClient.invalidateQueries(['strategic-plans-global']);
      toast.success('Plan deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete plan: ${error.message}`);
    }
  });

  // Restore a deleted plan
  const restorePlan = useMutation({
    mutationFn: async (planId) => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      queryClient.invalidateQueries(['strategic-plans-admin']);
      queryClient.invalidateQueries(['strategic-plans-global']);
      toast.success('Plan restored');
    },
    onError: (error) => {
      toast.error(`Failed to restore plan: ${error.message}`);
    }
  });

  // Duplicate/clone a plan
  const duplicatePlan = useMutation({
    mutationFn: async (planId) => {
      // First fetch the original plan
      const { data: original, error: fetchError } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Create a copy with new ID and draft status
      const { id, created_at, updated_at, ...planData } = original;
      const newPlan = {
        ...planData,
        name_en: `${planData.name_en} (Copy)`,
        name_ar: planData.name_ar ? `${planData.name_ar} (نسخة)` : null,
        status: 'draft',
        approval_status: null,
        is_template: false,
        version_number: 1,
        owner_email: user?.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('strategic_plans')
        .insert(newPlan)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      queryClient.invalidateQueries(['strategic-plans-admin']);
      queryClient.invalidateQueries(['strategic-plans-global']);
      toast.success('Plan duplicated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to duplicate plan: ${error.message}`);
    }
  });

  // Revert to draft (for rejected plans)
  const revertToDraft = useMutation({
    mutationFn: async (planId) => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .update({
          status: 'draft',
          approval_status: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      queryClient.invalidateQueries(['strategic-plans-admin']);
      queryClient.invalidateQueries(['strategic-plans-global']);
      toast.success('Plan reverted to draft');
    },
    onError: (error) => {
      toast.error(`Failed to revert plan: ${error.message}`);
    }
  });

  // Statistics (exclude templates)
  const nonTemplatePlans = plans.filter(p => !p.is_template);
  const stats = {
    total: nonTemplatePlans.filter(p => !p.is_deleted).length,
    draft: nonTemplatePlans.filter(p => p.status === 'draft' && !p.is_deleted).length,
    active: nonTemplatePlans.filter(p => p.status === 'active' && !p.is_deleted).length,
    completed: nonTemplatePlans.filter(p => p.status === 'completed' && !p.is_deleted).length,
    archived: nonTemplatePlans.filter(p => p.status === 'archived' && !p.is_deleted).length,
    pendingApproval: nonTemplatePlans.filter(p => p.approval_status === 'pending' && !p.is_deleted).length,
    approved: nonTemplatePlans.filter(p => p.approval_status === 'approved' && !p.is_deleted).length,
    rejected: nonTemplatePlans.filter(p => p.approval_status === 'rejected' && !p.is_deleted).length,
  };

  return {
    plans,
    isLoading,
    refetch,
    stats,
    // Lifecycle actions
    activatePlan,
    completePlan,
    archivePlan,
    deletePlan,
    restorePlan,
    duplicatePlan,
    revertToDraft,
  };
}




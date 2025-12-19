import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { PLATFORM_SYSTEMS } from '@/constants/platformSystems';
import { VALIDATION_CATEGORIES, getAllChecks } from '@/constants/validationCategories';

// Re-export for backward compatibility
export { PLATFORM_SYSTEMS };
export { VALIDATION_CATEGORIES };

export function useSystemValidation(systemId) {
  const { user, userEmail } = useAuth();
  const queryClient = useQueryClient();

  // Fetch validations for a specific system
  const { data: validations, isLoading, refetch: refetchValidations } = useQuery({
    queryKey: ['system-validations', systemId],
    queryFn: async () => {
      if (!systemId) return [];
      const { data, error } = await supabase
        .from('system_validations')
        .select('*')
        .eq('system_id', systemId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!systemId
  });

  // Fetch all summaries
  const { data: summaries, isLoading: summariesLoading } = useQuery({
    queryKey: ['system-validation-summaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_validation_summaries')
        .select('*')
        .order('system_name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Initialize all checks for a system (auto-create rows)
  const initializeSystem = useMutation({
    mutationFn: async ({ systemId, systemName }) => {
      // Get all checks
      const allChecks = getAllChecks();
      
      // Check which checks already exist
      const { data: existing } = await supabase
        .from('system_validations')
        .select('check_id')
        .eq('system_id', systemId);
      
      const existingCheckIds = new Set((existing || []).map(e => e.check_id));
      
      // Create rows for checks that don't exist
      const newChecks = allChecks.filter(check => !existingCheckIds.has(check.id));
      
      if (newChecks.length > 0) {
        const rows = newChecks.map(check => ({
          system_id: systemId,
          system_name: systemName,
          category_id: check.categoryId,
          check_id: check.id,
          is_checked: false,
          checked_by: null,
          checked_at: null
        }));
        
        const { error } = await supabase
          .from('system_validations')
          .insert(rows);
        
        if (error) throw error;
      }
      
      return { created: newChecks.length, total: allChecks.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['system-validations', systemId] });
      if (result.created > 0) {
        toast.success(`Initialized ${result.created} checks`);
      }
    },
    onError: (error) => {
      console.error('Failed to initialize system:', error);
      toast.error('Failed to initialize checks');
    }
  });

  // Toggle a check
  const toggleCheck = useMutation({
    mutationFn: async ({ systemId, systemName, categoryId, checkId, isChecked }) => {
      const { data: existing } = await supabase
        .from('system_validations')
        .select('id')
        .eq('system_id', systemId)
        .eq('check_id', checkId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('system_validations')
          .update({ 
            is_checked: isChecked, 
            checked_by: userEmail,
            checked_at: isChecked ? new Date().toISOString() : null
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_validations')
          .insert({
            system_id: systemId,
            system_name: systemName,
            category_id: categoryId,
            check_id: checkId,
            is_checked: isChecked,
            checked_by: userEmail,
            checked_at: isChecked ? new Date().toISOString() : null
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-validations', systemId] });
    },
    onError: (error) => {
      toast.error('Failed to save check status');
      console.error(error);
    }
  });

  // Update summary for a system
  const updateSummary = useMutation({
    mutationFn: async ({ systemId, systemName, totalChecks, completedChecks, criticalTotal, criticalCompleted }) => {
      const status = completedChecks === 0 ? 'not_started' : 
                     completedChecks === totalChecks ? 'completed' : 'in_progress';
      
      const { data: existing } = await supabase
        .from('system_validation_summaries')
        .select('id')
        .eq('system_id', systemId)
        .single();

      const payload = {
        system_id: systemId,
        system_name: systemName,
        total_checks: totalChecks,
        completed_checks: completedChecks,
        critical_total: criticalTotal,
        critical_completed: criticalCompleted,
        status,
        last_validated_at: new Date().toISOString(),
        last_validated_by: userEmail
      };

      if (existing) {
        const { error } = await supabase
          .from('system_validation_summaries')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_validation_summaries')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-validation-summaries'] });
      toast.success('Progress saved');
    }
  });

  // Reset all validations for a system
  const resetSystem = useMutation({
    mutationFn: async (systemId) => {
      const { error } = await supabase
        .from('system_validations')
        .delete()
        .eq('system_id', systemId);
      if (error) throw error;
      
      const { error: summaryError } = await supabase
        .from('system_validation_summaries')
        .delete()
        .eq('system_id', systemId);
      if (summaryError) throw summaryError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-validations'] });
      queryClient.invalidateQueries({ queryKey: ['system-validation-summaries'] });
      toast.success('System validation reset');
    }
  });

  // Convert validations array to a map for easy lookup
  const validationMap = (validations || []).reduce((acc, v) => {
    acc[v.check_id] = v.is_checked;
    return acc;
  }, {});

  return {
    validations,
    validationMap,
    summaries,
    isLoading: isLoading || summariesLoading,
    toggleCheck,
    updateSummary,
    resetSystem,
    initializeSystem,
    refetchValidations,
    systems: PLATFORM_SYSTEMS,
    categories: VALIDATION_CATEGORIES
  };
}

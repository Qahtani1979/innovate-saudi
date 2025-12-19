import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { PLATFORM_SYSTEMS } from '@/constants/platformSystems';
import { VALIDATION_CATEGORIES, getAllChecks, getTotalCheckCount } from '@/constants/validationCategories';

// Expected check count - all systems should have this many checks
export const EXPECTED_CHECK_COUNT = 356;

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

  // Fetch dynamic progress for all systems from summaries table (efficient - only 52 rows)
  const { data: dynamicProgress, isLoading: progressLoading, refetch: refetchProgress } = useQuery({
    queryKey: ['system-validation-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_validation_summaries')
        .select('system_id, system_name, total_checks, completed_checks');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5000 // Refresh every 5 seconds
  });

  // Fetch all summaries (for additional metadata like critical counts)
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

  // Initialize all checks for a system - skips if already has 356 checks
  const initializeSystem = useMutation({
    mutationFn: async ({ systemId, systemName, notApplicableChecks = [] }) => {
      // Check how many checks already exist
      const { data: existing } = await supabase
        .from('system_validations')
        .select('check_id')
        .eq('system_id', systemId);
      
      const existingCount = (existing || []).length;
      
      // Skip initialization if already has expected checks
      if (existingCount >= EXPECTED_CHECK_COUNT) {
        return { created: 0, total: existingCount, expected: EXPECTED_CHECK_COUNT, skipped: true };
      }
      
      // Get all checks from VALIDATION_CATEGORIES (should be 356)
      const allChecks = getAllChecks();
      const existingCheckIds = new Set((existing || []).map(e => e.check_id));
      const notApplicableSet = new Set(notApplicableChecks);
      
      // Create rows for checks that don't exist
      const newChecks = allChecks.filter(check => !existingCheckIds.has(check.id));
      
      if (newChecks.length > 0) {
        const rows = newChecks.map(check => ({
          system_id: systemId,
          system_name: systemName,
          category_id: check.categoryId,
          check_id: check.id,
          is_checked: notApplicableSet.has(check.id),
          status: notApplicableSet.has(check.id) ? 'not_applicable' : 'pending',
          checked_by: null,
          checked_at: null
        }));
        
        const { error } = await supabase
          .from('system_validations')
          .insert(rows);
        
        if (error) throw error;
      }
      
      return { created: newChecks.length, total: allChecks.length, expected: EXPECTED_CHECK_COUNT };
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
    mutationFn: async ({ systemId, systemName, categoryId, checkId, isChecked, status }) => {
      const newStatus = status || (isChecked ? 'checked' : 'pending');
      
      const { data: existing } = await supabase
        .from('system_validations')
        .select('id, status, is_checked')
        .eq('system_id', systemId)
        .eq('check_id', checkId)
        .maybeSingle();

      // Don't allow changing not_applicable status unless explicitly setting it
      if (existing?.status === 'not_applicable' && !status) {
        return { changed: false }; // Skip update for N/A checks
      }

      const wasChecked = existing?.is_checked || false;
      const delta = isChecked && !wasChecked ? 1 : (!isChecked && wasChecked ? -1 : 0);

      if (existing) {
        const { error } = await supabase
          .from('system_validations')
          .update({ 
            is_checked: isChecked, 
            status: newStatus,
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
            status: newStatus,
            checked_by: userEmail,
            checked_at: isChecked ? new Date().toISOString() : null
          });
        if (error) throw error;
      }

      // Update the summary's completed_checks count
      if (delta !== 0) {
        const { data: summary } = await supabase
          .from('system_validation_summaries')
          .select('id, completed_checks, total_checks')
          .eq('system_id', systemId)
          .maybeSingle();

        if (summary) {
          const newCompleted = Math.max(0, Math.min(summary.total_checks, (summary.completed_checks || 0) + delta));
          const newStatusStr = newCompleted === 0 ? 'not_started' : 
                              newCompleted === summary.total_checks ? 'complete' : 'in_progress';
          
          await supabase
            .from('system_validation_summaries')
            .update({ 
              completed_checks: newCompleted,
              status: newStatusStr,
              last_validated_at: new Date().toISOString(),
              last_validated_by: userEmail,
              updated_at: new Date().toISOString()
            })
            .eq('id', summary.id);
        }
      }

      return { changed: true, delta };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-validations', systemId] });
      queryClient.invalidateQueries({ queryKey: ['system-validation-progress'] });
    },
    onError: (error) => {
      toast.error('Failed to save check status');
      console.error(error);
    }
  });

  // Bulk status change for multiple checks
  const bulkStatusChange = useMutation({
    mutationFn: async (updates) => {
      if (!updates || updates.length === 0) return { changed: 0 };
      
      const firstUpdate = updates[0];
      const sysId = firstUpdate.systemId;
      const sysName = firstUpdate.systemName;
      
      // Get all existing validations for this system
      const { data: existingValidations } = await supabase
        .from('system_validations')
        .select('id, check_id, is_checked, status')
        .eq('system_id', sysId);
      
      const existingMap = {};
      (existingValidations || []).forEach(v => {
        existingMap[v.check_id] = v;
      });
      
      const toInsert = [];
      const toUpdate = [];
      let checkedDelta = 0;
      
      for (const update of updates) {
        const existing = existingMap[update.checkId];
        const newStatus = update.status || (update.isChecked ? 'checked' : 'pending');
        const isNowChecked = newStatus === 'checked';
        
        if (existing) {
          const wasChecked = existing.is_checked || false;
          if (isNowChecked && !wasChecked) checkedDelta++;
          else if (!isNowChecked && wasChecked) checkedDelta--;
          
          toUpdate.push({
            id: existing.id,
            is_checked: update.isChecked,
            status: newStatus,
            checked_by: userEmail,
            checked_at: update.isChecked ? new Date().toISOString() : null
          });
        } else {
          if (isNowChecked) checkedDelta++;
          toInsert.push({
            system_id: sysId,
            system_name: sysName,
            category_id: update.categoryId,
            check_id: update.checkId,
            is_checked: update.isChecked,
            status: newStatus,
            checked_by: userEmail,
            checked_at: update.isChecked ? new Date().toISOString() : null
          });
        }
      }
      
      // Batch insert new records
      if (toInsert.length > 0) {
        const { error } = await supabase
          .from('system_validations')
          .insert(toInsert);
        if (error) throw error;
      }
      
      // Batch update existing records (Supabase doesn't support batch update, so we do it in parallel)
      if (toUpdate.length > 0) {
        await Promise.all(toUpdate.map(async (record) => {
          const { error } = await supabase
            .from('system_validations')
            .update({
              is_checked: record.is_checked,
              status: record.status,
              checked_by: record.checked_by,
              checked_at: record.checked_at
            })
            .eq('id', record.id);
          if (error) console.error('Update error:', error);
        }));
      }
      
      // Update summary
      if (checkedDelta !== 0) {
        const { data: summary } = await supabase
          .from('system_validation_summaries')
          .select('id, completed_checks, total_checks')
          .eq('system_id', sysId)
          .maybeSingle();

        if (summary) {
          const newCompleted = Math.max(0, Math.min(summary.total_checks, (summary.completed_checks || 0) + checkedDelta));
          const newStatusStr = newCompleted === 0 ? 'not_started' : 
                              newCompleted === summary.total_checks ? 'complete' : 'in_progress';
          
          await supabase
            .from('system_validation_summaries')
            .update({ 
              completed_checks: newCompleted,
              status: newStatusStr,
              last_validated_at: new Date().toISOString(),
              last_validated_by: userEmail,
              updated_at: new Date().toISOString()
            })
            .eq('id', summary.id);
        }
      }
      
      return { changed: toInsert.length + toUpdate.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['system-validations', systemId] });
      queryClient.invalidateQueries({ queryKey: ['system-validation-progress'] });
      if (result.changed > 0) {
        toast.success(`Updated ${result.changed} checks`);
      }
    },
    onError: (error) => {
      toast.error('Failed to update checks');
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

  // Convert validations array to a map for easy lookup (includes status)
  const validationMap = (validations || []).reduce((acc, v) => {
    acc[v.check_id] = { isChecked: v.is_checked, status: v.status || 'pending' };
    return acc;
  }, {});

  return {
    validations,
    validationMap,
    summaries,
    dynamicProgress, // Real-time progress from actual checks
    isLoading: isLoading || summariesLoading || progressLoading,
    toggleCheck,
    bulkStatusChange,
    updateSummary,
    resetSystem,
    initializeSystem,
    refetchValidations,
    systems: PLATFORM_SYSTEMS,
    categories: VALIDATION_CATEGORIES
  };
}

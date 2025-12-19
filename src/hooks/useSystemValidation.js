import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Define all platform systems/hubs
export const PLATFORM_SYSTEMS = [
  { id: 'challenges', name: { en: 'Challenges Hub', ar: 'مركز التحديات' }, tables: ['challenges', 'challenge_proposals', 'challenge_interests'] },
  { id: 'pilots', name: { en: 'Pilots Hub', ar: 'مركز التجارب' }, tables: ['pilots', 'pilot_phases', 'pilot_milestones'] },
  { id: 'solutions', name: { en: 'Solutions Hub', ar: 'مركز الحلول' }, tables: ['solutions', 'solution_deployments'] },
  { id: 'programs', name: { en: 'Programs Hub', ar: 'مركز البرامج' }, tables: ['programs', 'program_applications', 'program_cohorts'] },
  { id: 'living-labs', name: { en: 'Living Labs', ar: 'المختبرات الحية' }, tables: ['living_labs', 'living_lab_projects'] },
  { id: 'rd-projects', name: { en: 'R&D Projects', ar: 'مشاريع البحث والتطوير' }, tables: ['rd_projects', 'rd_milestones'] },
  { id: 'organizations', name: { en: 'Organizations', ar: 'المنظمات' }, tables: ['organizations', 'providers'] },
  { id: 'municipalities', name: { en: 'Municipalities', ar: 'البلديات' }, tables: ['municipalities', 'cities', 'regions'] },
  { id: 'users-access', name: { en: 'Users & Access', ar: 'المستخدمين والوصول' }, tables: ['user_profiles', 'user_roles', 'roles', 'permissions'] },
  { id: 'experts', name: { en: 'Experts Hub', ar: 'مركز الخبراء' }, tables: ['expert_profiles', 'expert_panels', 'expert_assignments'] },
  { id: 'evaluations', name: { en: 'Evaluations', ar: 'التقييمات' }, tables: ['evaluations', 'evaluation_templates', 'evaluation_criteria'] },
  { id: 'knowledge', name: { en: 'Knowledge Base', ar: 'قاعدة المعرفة' }, tables: ['knowledge_documents', 'knowledge_categories'] },
  { id: 'events', name: { en: 'Events', ar: 'الفعاليات' }, tables: ['events', 'event_registrations'] },
  { id: 'communications', name: { en: 'Communications', ar: 'الاتصالات' }, tables: ['email_templates', 'email_logs', 'notifications'] },
  { id: 'approvals', name: { en: 'Approvals', ar: 'الموافقات' }, tables: ['approval_requests', 'approval_workflows'] },
  { id: 'budgets', name: { en: 'Budgets', ar: 'الميزانيات' }, tables: ['budgets', 'budget_line_items'] },
  { id: 'contracts', name: { en: 'Contracts', ar: 'العقود' }, tables: ['contracts', 'invoices'] },
  { id: 'partnerships', name: { en: 'Partnerships', ar: 'الشراكات' }, tables: ['partnerships', 'partnership_mous'] },
  { id: 'matchmaker', name: { en: 'Matchmaker', ar: 'التوفيق' }, tables: ['matchmaker_applications', 'demand_queue'] },
  { id: 'strategic-plans', name: { en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' }, tables: ['strategic_plans', 'action_plans', 'action_items'] },
  { id: 'citizen-engagement', name: { en: 'Citizen Engagement', ar: 'مشاركة المواطنين' }, tables: ['citizen_ideas', 'citizen_feedback', 'citizen_votes'] },
  { id: 'mii', name: { en: 'MII Dashboard', ar: 'لوحة MII' }, tables: ['mii_scores', 'mii_dimensions'] },
  { id: 'ideas', name: { en: 'Ideas Management', ar: 'إدارة الأفكار' }, tables: ['innovation_proposals', 'idea_evaluations'] },
  { id: 'policies', name: { en: 'Policies', ar: 'السياسات' }, tables: ['policies', 'policy_recommendations'] },
  { id: 'audits', name: { en: 'Audits', ar: 'التدقيق' }, tables: ['audits', 'access_logs'] },
];

export function useSystemValidation(systemId) {
  const { user, userEmail } = useAuth();
  const queryClient = useQueryClient();

  // Fetch validations for a specific system
  const { data: validations, isLoading } = useQuery({
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

  // Toggle a check
  const toggleCheck = useMutation({
    mutationFn: async ({ systemId, systemName, categoryId, checkId, isChecked }) => {
      const { data: existing } = await supabase
        .from('system_validations')
        .select('id')
        .eq('system_id', systemId)
        .eq('category_id', categoryId)
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
    systems: PLATFORM_SYSTEMS
  };
}

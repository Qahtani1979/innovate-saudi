import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

// Define all platform systems/hubs - comprehensive coverage of all tables
export const PLATFORM_SYSTEMS = [
  // Core Innovation Hubs
  { id: 'challenges', name: { en: 'Challenges Hub', ar: 'مركز التحديات' }, tables: ['challenges', 'challenge_proposals', 'challenge_interests', 'challenge_activities', 'challenge_attachments', 'challenge_solution_matches'] },
  { id: 'pilots', name: { en: 'Pilots Hub', ar: 'مركز التجارب' }, tables: ['pilots', 'pilot_approvals', 'pilot_collaborations', 'pilot_documents', 'pilot_expenses', 'pilot_issues', 'pilot_kpis', 'pilot_kpi_datapoints'] },
  { id: 'solutions', name: { en: 'Solutions Hub', ar: 'مركز الحلول' }, tables: ['solutions', 'solution_cases', 'solution_interests', 'solution_reviews'] },
  { id: 'programs', name: { en: 'Programs Hub', ar: 'مركز البرامج' }, tables: ['programs', 'program_applications', 'program_mentorships', 'program_pilot_links'] },
  { id: 'living-labs', name: { en: 'Living Labs', ar: 'المختبرات الحية' }, tables: ['living_labs', 'living_lab_bookings', 'living_lab_resource_bookings'] },
  { id: 'sandboxes', name: { en: 'Regulatory Sandboxes', ar: 'البيئات التجريبية' }, tables: ['sandboxes', 'sandbox_applications', 'sandbox_collaborators', 'sandbox_incidents', 'sandbox_monitoring_data', 'sandbox_project_milestones'] },
  
  // R&D & Research
  { id: 'rd-projects', name: { en: 'R&D Projects', ar: 'مشاريع البحث والتطوير' }, tables: ['rd_projects', 'rd_calls', 'rd_proposals', 'researcher_profiles'] },
  { id: 'ideas', name: { en: 'Innovation Proposals', ar: 'مقترحات الابتكار' }, tables: ['innovation_proposals', 'idea_comments'] },
  
  // Entities & Geography
  { id: 'organizations', name: { en: 'Organizations', ar: 'المنظمات' }, tables: ['organizations', 'providers', 'organization_partnerships'] },
  { id: 'municipalities', name: { en: 'Municipalities', ar: 'البلديات' }, tables: ['municipalities', 'cities', 'regions', 'municipality_staff_profiles', 'deputyships'] },
  { id: 'ministries', name: { en: 'Ministries', ar: 'الوزارات' }, tables: ['ministries', 'services', 'domains'] },
  { id: 'sectors', name: { en: 'Sectors & Taxonomy', ar: 'القطاعات والتصنيف' }, tables: ['sectors', 'sector_strategies'] },
  
  // Users & Access Control
  { id: 'users-access', name: { en: 'Users & Access', ar: 'المستخدمين والوصول' }, tables: ['user_profiles', 'user_roles', 'roles', 'permissions', 'role_permissions', 'role_requests', 'delegation_rules', 'auto_approval_rules'] },
  { id: 'citizen-engagement', name: { en: 'Citizen Engagement', ar: 'مشاركة المواطنين' }, tables: ['citizen_ideas', 'citizen_feedback', 'citizen_votes', 'citizen_profiles', 'citizen_badges', 'citizen_points', 'citizen_notifications', 'citizen_pilot_enrollments'] },
  
  // Experts & Evaluations
  { id: 'experts', name: { en: 'Experts Hub', ar: 'مركز الخبراء' }, tables: ['expert_profiles', 'expert_panels', 'expert_assignments', 'expert_evaluations', 'custom_expertise_areas'] },
  { id: 'evaluations', name: { en: 'Evaluations', ar: 'التقييمات' }, tables: ['evaluation_templates', 'matchmaker_evaluation_sessions'] },
  
  // Knowledge & Content
  { id: 'knowledge', name: { en: 'Knowledge Base', ar: 'قاعدة المعرفة' }, tables: ['knowledge_documents', 'case_studies', 'impact_stories'] },
  { id: 'events', name: { en: 'Events', ar: 'الفعاليات' }, tables: ['events', 'event_registrations'] },
  { id: 'news', name: { en: 'News & Content', ar: 'الأخبار والمحتوى' }, tables: ['news_articles'] },
  { id: 'policies', name: { en: 'Policies', ar: 'السياسات' }, tables: ['policy_documents', 'policy_recommendations', 'policy_comments', 'policy_templates', 'regulatory_exemptions', 'exemption_audit_logs'] },
  
  // Communications & Notifications
  { id: 'communications', name: { en: 'Communications', ar: 'الاتصالات' }, tables: ['email_templates', 'email_logs', 'email_campaigns', 'campaign_recipients', 'email_queue', 'email_digest_queue', 'email_settings', 'email_trigger_config', 'communication_plans', 'communication_analytics', 'communication_notifications'] },
  { id: 'notifications', name: { en: 'Notifications', ar: 'الإشعارات' }, tables: ['notifications', 'messages'] },
  
  // Workflow & Approvals
  { id: 'approvals', name: { en: 'Approvals', ar: 'الموافقات' }, tables: ['approval_requests', 'committee_decisions'] },
  
  // Finance
  { id: 'budgets', name: { en: 'Budgets', ar: 'الميزانيات' }, tables: ['budgets'] },
  { id: 'contracts', name: { en: 'Contracts & Invoices', ar: 'العقود والفواتير' }, tables: ['contracts', 'invoices'] },
  
  // Partnerships & Matching
  { id: 'partnerships', name: { en: 'Partnerships', ar: 'الشراكات' }, tables: ['partnerships'] },
  { id: 'matchmaker', name: { en: 'Matchmaker', ar: 'التوفيق' }, tables: ['matchmaker_applications', 'demand_queue'] },
  
  // Strategic Planning
  { id: 'strategic-plans', name: { en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' }, tables: ['strategic_plans', 'action_plans', 'action_items', 'milestones', 'risks', 'stakeholders', 'stakeholder_analyses', 'stakeholder_feedback', 'environmental_factors', 'national_strategy_alignments', 'global_trends', 'kpi_references'] },
  { id: 'scaling', name: { en: 'Scaling & Growth', ar: 'التوسع والنمو' }, tables: ['scaling_plans', 'scaling_readiness'] },
  
  // MII & Analytics
  { id: 'mii', name: { en: 'MII Dashboard', ar: 'لوحة MII' }, tables: ['mii_results', 'mii_dimensions'] },
  { id: 'analytics', name: { en: 'Platform Analytics', ar: 'تحليلات المنصة' }, tables: ['platform_insights', 'onboarding_events', 'coverage_snapshots'] },
  
  // Audit & Logs
  { id: 'audits', name: { en: 'Audits & Logs', ar: 'التدقيق والسجلات' }, tables: ['audits', 'access_logs', 'incident_reports'] },
  
  // Media & Files
  { id: 'media', name: { en: 'Media Library', ar: 'مكتبة الوسائط' }, tables: ['media_files', 'media_folders', 'media_usage', 'media_usages', 'media_versions'] },
  
  // AI & Experiments
  { id: 'ai-features', name: { en: 'AI Features', ar: 'ميزات الذكاء الاصطناعي' }, tables: ['ai_conversations', 'ai_messages', 'ai_usage_tracking', 'ai_rate_limits', 'ai_analysis_cache', 'generation_history'] },
  { id: 'ab-testing', name: { en: 'A/B Testing', ar: 'اختبار A/B' }, tables: ['ab_experiments', 'ab_assignments', 'ab_conversions'] },
  
  // Social & Engagement
  { id: 'social', name: { en: 'Social Features', ar: 'الميزات الاجتماعية' }, tables: ['follows', 'bookmarks', 'comments', 'achievements'] },
  
  // Lookups & Config
  { id: 'lookups', name: { en: 'Lookup Tables', ar: 'جداول البحث' }, tables: ['lookup_departments', 'lookup_governance_roles', 'lookup_risk_categories', 'lookup_specializations', 'lookup_stakeholder_types', 'lookup_strategic_themes', 'lookup_technologies', 'lookup_vision_programs'] },
  { id: 'platform-config', name: { en: 'Platform Config', ar: 'إعدادات المنصة' }, tables: ['platform_configs', 'custom_entries', 'progressive_profiling_prompts', 'demo_requests'] },
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

import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * AI-powered automatic role assignment based on user profile
 * Called during onboarding or profile updates
 */
export const useAutoRoleAssignment = () => {
  const { t } = useLanguage();
  const queryClient = useAppQueryClient();

  const analyzeAndSuggestRoles = (userData) => {
    const suggestions = [];
    const orgType = userData.organization_type;
    const email = userData.email?.toLowerCase() || '';
    const jobTitle = userData.job_title?.toLowerCase() || '';

    // Email domain analysis
    if (email.includes('@moi.gov.sa') || email.includes('@momah.gov.sa')) {
      suggestions.push('Ministry Innovation Lead');
    }
    if (email.includes('.gov.sa')) {
      suggestions.push('Government Agency Lead');
    }
    if (email.includes('.edu.sa')) {
      suggestions.push('Researcher/Academic', 'Research Lead');
    }

    // Organization type mapping
    const orgRoleMap = {
      municipality: ['Municipality Innovation Officer', 'Municipality Director'],
      ministry: ['Ministry Innovation Lead'],
      agency: ['Government Agency Lead'],
      startup: ['Startup/Provider', 'Solution Provider'],
      sme: ['Solution Provider'],
      university: ['Researcher/Academic', 'Research Lead'],
      research_center: ['Research Lead', 'Researcher/Academic']
    };

    if (orgType && orgRoleMap[orgType]) {
      suggestions.push(...orgRoleMap[orgType]);
    }

    // Job title analysis
    if (jobTitle.includes('director') || jobTitle.includes('مدير')) {
      suggestions.push('Municipality Director');
    }
    if (jobTitle.includes('innovation') || jobTitle.includes('ابتكار')) {
      suggestions.push('Municipality Innovation Officer');
    }
    if (jobTitle.includes('research') || jobTitle.includes('بحث')) {
      suggestions.push('Researcher/Academic');
    }
    if (jobTitle.includes('ceo') || jobTitle.includes('founder')) {
      suggestions.push('Startup/Provider');
    }

    // Remove duplicates
    return [...new Set(suggestions)];
  };

  const assignRolesMutation = useMutation({
    mutationFn: async ({ userId, suggestedRoles }) => {
      if (!userId || !suggestedRoles || suggestedRoles.length === 0) return [];

      // 1. Get existing roles for the user to avoid duplicates
      const { data: existingRolesData, error: fetchError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      const existingRoles = existingRolesData.map(r => r.role);
      const newRoles = suggestedRoles.filter(role => !existingRoles.includes(role));

      if (newRoles.length === 0) return [];

      // 2. Insert new roles
      const rolesToInsert = newRoles.map(role => ({
        user_id: userId,
        role: role,
        // Add meta fields if they exist in schema, simpler to just add required ones
        // Assuming user_roles table structure. AuthContext selects role, municipality_id, organization_id.
      }));

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(rolesToInsert);

      if (insertError) throw insertError;

      // 3. Try to update user metadata if applicable (backwards compatibility)
      try {
        await supabase.auth.updateUser({
          data: {
            role_assignment_method: 'auto',
            role_assigned_date: new Date().toISOString()
          }
        });
      } catch (e) {
        console.warn('Failed to update user metadata', e);
      }

      return newRoles;
    },
    onSuccess: (newRoles) => {
      if (newRoles.length > 0) {
        toast.success(t({
          en: `${newRoles.length} new role(s) automatically assigned!`,
          ar: `تم تعيين ${newRoles.length} دور جديد تلقائياً!`
        }));
        queryClient.invalidateQueries({ queryKey: ['user-roles'] });
        queryClient.invalidateQueries({ queryKey: ['user'] }); // Refresh auth context if needed
      }
    },
    onError: (error) => {
      console.error('Auto role assignment failed:', error);
      toast.error(t({ en: 'Failed to assign roles automatically.', ar: 'فشل تعيين الأدوار تلقائياً.' }));
    }
  });

  return {
    analyzeAndSuggestRoles,
    assignRoles: assignRolesMutation.mutate,
    isAssigning: assignRolesMutation.isPending
  };
};

/**
 * Background service that suggests role upgrades based on activity
 */
export const suggestRoleUpgrade = async (userEmail, activityDays = 30) => {
  try {
    const startDate = new Date(Date.now() - activityDays * 24 * 60 * 60 * 1000).toISOString();

    // Fetch user activities from last N days
    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_email', userEmail)
      .gte('created_at', startDate);

    if (error) throw error;

    const suggestions = [];

    // Analyze activity patterns
    const challengeActions = activities.filter(a => a.entity_type === 'Challenge');
    const pilotActions = activities.filter(a => a.entity_type === 'Pilot');
    const rdActions = activities.filter(a => a.entity_type === 'RDProject');
    const approvalActions = activities.filter(a => a.action_type === 'approve');

    // Heavy challenge work → suggest Challenge Lead role
    if (challengeActions.length > 20) {
      suggestions.push({
        role: 'Challenge Lead',
        reason: 'High challenge management activity detected',
        confidence: 0.9
      });
    }

    // Heavy pilot work → suggest Pilot Manager role
    if (pilotActions.length > 15) {
      suggestions.push({
        role: 'Pilot Manager',
        reason: 'Extensive pilot management experience',
        confidence: 0.85
      });
    }

    // Many approvals → suggest elevated approver role
    if (approvalActions.length > 30) {
      suggestions.push({
        role: 'Senior Approver',
        reason: 'Consistent approval workflow participation',
        confidence: 0.8
      });
    }

    // R&D activity → suggest R&D Lead
    if (rdActions.length > 10) {
      suggestions.push({
        role: 'R&D Lead',
        reason: 'Active R&D project involvement',
        confidence: 0.75
      });
    }

    return suggestions.filter(s => s.confidence > 0.7);
  } catch (error) {
    console.error('Role upgrade suggestion failed:', error);
    return [];
  }
};




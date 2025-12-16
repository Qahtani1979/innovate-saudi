import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useLanguage } from '../LanguageContext';
import { Sparkles, Brain } from 'lucide-react';
import { toast } from 'sonner';

/**
 * AI-powered automatic role assignment based on user profile
 * Called during onboarding or profile updates
 */
export const useAutoRoleAssignment = () => {
  const { t } = useLanguage();

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
      // Fetch all roles to get IDs
      const allRoles = await base44.entities.Role.list();
      const roleIds = suggestedRoles
        .map(roleName => allRoles.find(r => r.name === roleName)?.id)
        .filter(Boolean);

      if (roleIds.length > 0) {
        await base44.entities.User.update(userId, {
          assigned_roles: roleIds,
          role_assignment_method: 'auto',
          role_assigned_date: new Date().toISOString()
        });
      }
      return roleIds;
    },
    onSuccess: (roleIds) => {
      if (roleIds.length > 0) {
        toast.success(t({ 
          en: `${roleIds.length} role(s) automatically assigned!`, 
          ar: `تم تعيين ${roleIds.length} دور تلقائياً!` 
        }));
      }
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
    // Fetch user activities from last N days
    const activities = await base44.entities.UserActivity.filter({
      user_email: userEmail,
      created_date: { $gte: new Date(Date.now() - activityDays * 24 * 60 * 60 * 1000).toISOString() }
    });

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
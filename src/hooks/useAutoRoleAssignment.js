/**
 * Hook for auto-role assignment during onboarding
 * Uses unified rbac-manager edge function
 * 
 * Checks auto-approval rules and assigns roles or creates pending requests
 */

import { supabase } from '@/integrations/supabase/client';
import rbacService from '@/services/rbac/rbacService';
import { toast } from 'sonner';

export const useAutoRoleAssignment = () => {
  
  /**
   * Check auto-approval and assign role or create request
   * @param {Object} params - Assignment parameters
   * @param {string} params.userId - User ID
   * @param {string} params.userEmail - User email
   * @param {string} params.personaType - Selected persona (municipality_staff, provider, expert, etc.)
   * @param {string} params.municipalityId - Optional municipality ID
   * @param {string} params.organizationId - Optional organization ID
   * @param {string} params.justification - Optional justification for role request
   * @param {string} params.language - User's preferred language
   * @returns {Promise<{success: boolean, autoApproved: boolean, role: string|null, error: string|null}>}
   */
  const checkAndAssignRole = async ({
    userId,
    userEmail,
    personaType,
    municipalityId = null,
    organizationId = null,
    justification = '',
    language = 'en'
  }) => {
    try {
      console.log(`[AutoRole] Checking auto-approval for ${userEmail} as ${personaType}`);
      
      // Call unified rbac-manager via rbacService
      const result = await rbacService.checkAutoApproval({
        user_id: userId,
        user_email: userEmail,
        persona_type: personaType,
        municipality_id: municipalityId,
        organization_id: organizationId
      });

      console.log('[AutoRole] Check result:', result);

      if (result?.auto_approved && result?.role) {
        // Role was auto-approved and assigned by the edge function
        console.log(`[AutoRole] Auto-approved! Role: ${result.role}`);
        return {
          success: true,
          autoApproved: true,
          role: result.role,
          error: null
        };
      }

      // Not auto-approved - create a pending role request
      console.log(`[AutoRole] Not auto-approved, creating pending request for ${personaType}`);
      
      const { error: requestError } = await supabase
        .from('role_requests')
        .upsert({
          user_id: userId,
          user_email: userEmail,
          requested_role: personaType,
          municipality_id: municipalityId || null,
          organization_id: organizationId || null,
          justification: justification || `Role request for ${personaType}`,
          status: 'pending',
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id,requested_role' });

      if (requestError) {
        console.error('[AutoRole] Request creation error:', requestError);
        // Don't throw - the role request might already exist
        if (!requestError.message.includes('duplicate')) {
          throw requestError;
        }
      }

      // Send notification about the pending request via unified service
      try {
        await rbacService.sendRoleNotification({
          type: 'submitted',
          user_id: userId,
          user_email: userEmail,
          user_name: userEmail?.split('@')[0] || 'User',
          requested_role: personaType,
          justification,
          language
        });
      } catch (notifError) {
        console.warn('[AutoRole] Notification error:', notifError);
      }

      return {
        success: true,
        autoApproved: false,
        role: null,
        pendingRole: personaType,
        error: null
      };
    } catch (error) {
      console.error('[AutoRole] Error:', error);
      return {
        success: false,
        autoApproved: false,
        role: null,
        error: error.message
      };
    }
  };

  /**
   * Directly assign a role (for auto-approved cases like citizen)
   */
  const assignRole = async ({ userId, userEmail, role, municipalityId = null, organizationId = null }) => {
    try {
      const result = await rbacService.assignRole({
        user_id: userId,
        user_email: userEmail,
        role,
        municipality_id: municipalityId,
        organization_id: organizationId
      });

      return { success: true, data: result };
    } catch (error) {
      console.error('[AutoRole] Direct assign error:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    checkAndAssignRole,
    assignRole
  };
};

export default useAutoRoleAssignment;

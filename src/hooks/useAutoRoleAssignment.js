import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for auto-role assignment during onboarding
 * Checks auto-approval rules and assigns roles or creates pending requests
 */
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
      
      // Call the auto-role-assignment edge function to check auto-approval
      const { data: result, error: checkError } = await supabase.functions.invoke('auto-role-assignment', {
        body: {
          user_id: userId,
          user_email: userEmail,
          persona_type: personaType,
          municipality_id: municipalityId,
          organization_id: organizationId,
          action: 'check_auto_approve'
        }
      });

      if (checkError) {
        console.error('[AutoRole] Check error:', checkError);
        throw checkError;
      }

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

      // Send notification about the pending request
      try {
        await supabase.functions.invoke('role-request-notification', {
          body: {
            type: 'submitted',
            user_id: userId,
            user_email: userEmail,
            requested_role: personaType,
            justification,
            language
          }
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
      const { data, error } = await supabase.functions.invoke('auto-role-assignment', {
        body: {
          user_id: userId,
          user_email: userEmail,
          role,
          municipality_id: municipalityId,
          organization_id: organizationId,
          action: 'assign'
        }
      });

      if (error) throw error;
      return { success: true, data };
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

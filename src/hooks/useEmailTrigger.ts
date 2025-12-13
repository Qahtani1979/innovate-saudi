import { supabase } from '@/integrations/supabase/client';

/**
 * Unified Email Trigger Hook
 * 
 * This hook provides a simple interface to trigger emails from anywhere in the codebase.
 * It calls the email-trigger-hub edge function which handles:
 * - Looking up the correct template for the trigger
 * - Extracting variables from entity data
 * - Respecting user notification preferences
 * - Queueing delayed emails
 * 
 * @example
 * ```tsx
 * const { triggerEmail } = useEmailTrigger();
 * 
 * // When a challenge is approved
 * await triggerEmail('challenge.approved', {
 *   entity_type: 'challenge',
 *   entity_id: challenge.id,
 *   entity_data: challenge, // Full challenge object for variable extraction
 * });
 * 
 * // With explicit recipient override
 * await triggerEmail('task.assigned', {
 *   entity_type: 'task',
 *   entity_id: task.id,
 *   entity_data: task,
 *   recipient_email: 'specific@email.com',
 *   variables: { customVar: 'value' }, // Override extracted variables
 * });
 * ```
 */

export interface TriggerEmailOptions {
  entity_type?: string;
  entity_id?: string;
  entity_data?: Record<string, any>;
  recipient_email?: string;
  recipient_user_id?: string;
  additional_recipients?: string[];
  variables?: Record<string, string>;
  language?: 'en' | 'ar';
  skip_preferences?: boolean;
  priority?: number;
  delay_seconds?: number;
  triggered_by?: string;
}

export interface TriggerResult {
  success: boolean;
  trigger?: string;
  template?: string;
  processed?: Array<{ recipient: string; status: string; reason?: string }>;
  errors?: Array<{ recipient: string; error: string }>;
  summary?: {
    total_recipients: number;
    sent: number;
    queued: number;
    skipped: number;
    failed: number;
  };
  error?: string;
  skipped?: boolean;
}

export function useEmailTrigger() {
  /**
   * Trigger an email based on a predefined trigger key
   * 
   * @param trigger - The trigger key (e.g., 'challenge.approved', 'pilot.created')
   * @param options - Additional options for the trigger
   * @returns Promise with the result of the trigger
   */
  const triggerEmail = async (
    trigger: string,
    options: TriggerEmailOptions = {}
  ): Promise<TriggerResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger,
          ...options,
        },
      });

      if (error) {
        console.error(`[useEmailTrigger] Error triggering ${trigger}:`, error);
        return { success: false, error: error.message };
      }

      return data as TriggerResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[useEmailTrigger] Exception triggering ${trigger}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Trigger multiple emails in batch
   * Useful for notifications that need to go to multiple entity changes
   */
  const triggerBatch = async (
    triggers: Array<{ trigger: string; options: TriggerEmailOptions }>
  ): Promise<TriggerResult[]> => {
    return Promise.all(
      triggers.map(({ trigger, options }) => triggerEmail(trigger, options))
    );
  };

  return {
    triggerEmail,
    triggerBatch,
  };
}

/**
 * Available trigger keys and their purposes:
 * 
 * AUTH TRIGGERS:
 * - auth.signup - New user registration
 * - auth.password_reset - Password reset requested
 * - auth.password_changed - Password successfully changed
 * - auth.email_verification - Email verification required
 * - auth.login_new_device - Login from new device detected
 * - auth.account_locked - Account locked due to failed attempts
 * - auth.account_deactivated - Account deactivated
 * - auth.account_suspended - Account suspended by admin
 * 
 * CHALLENGE TRIGGERS:
 * - challenge.submitted - New challenge submitted
 * - challenge.approved - Challenge approved for publishing
 * - challenge.rejected - Challenge rejected
 * - challenge.assigned - Challenge assigned for review
 * - challenge.escalated - Challenge escalated to higher level
 * - challenge.match_found - Solution match found for challenge
 * - challenge.status_changed - Challenge status updated
 * - challenge.needs_info - More information required
 * 
 * PILOT TRIGGERS:
 * - pilot.created - New pilot project created
 * - pilot.status_changed - Pilot status updated
 * - pilot.enrollment_confirmed - Citizen enrolled in pilot
 * - pilot.feedback_request - Feedback requested from participant
 * - pilot.milestone_reached - Pilot milestone achieved
 * - pilot.completed - Pilot completed
 * - pilot.extended - Pilot duration extended
 * 
 * SOLUTION TRIGGERS:
 * - solution.verified - Solution verified/approved
 * - solution.submitted - New solution submitted
 * - solution.published - Solution published to marketplace
 * - solution.interest_received - Interest expressed in solution
 * 
 * CONTRACT TRIGGERS:
 * - contract.created - New contract created
 * - contract.expiring - Contract nearing expiration
 * - contract.signed - Contract signed
 * - contract.pending_signature - Awaiting signature
 * 
 * TASK TRIGGERS:
 * - task.assigned - Task assigned to user
 * - task.due_reminder - Task due soon reminder
 * - task.overdue - Task is overdue
 * - task.completed - Task completed notification
 * 
 * EVALUATION TRIGGERS:
 * - evaluation.assigned - Evaluation assigned
 * - evaluation.completed - Evaluation completed
 * - evaluation.reminder - Evaluation reminder
 * 
 * EVENT TRIGGERS:
 * - event.invitation - Event invitation
 * - event.reminder - Event reminder
 * - event.registration_confirmed - Registration confirmed
 * - event.updated - Event details updated
 * - event.cancelled - Event cancelled
 * 
 * CITIZEN TRIGGERS:
 * - citizen.signup - Citizen registered
 * - citizen.badge_earned - Badge earned
 * - citizen.level_up - Level increased
 * - citizen.points_expiring - Points about to expire
 * - idea.approved - Citizen idea approved
 * - idea.converted - Idea converted to challenge
 * - vote.confirmation - Vote recorded confirmation
 * 
 * PROGRAM TRIGGERS:
 * - program.application_received - Application received
 * - program.application_status - Application status changed
 * - program.deadline_reminder - Application deadline reminder
 * 
 * PROPOSAL TRIGGERS:
 * - proposal.submitted - Proposal submitted
 * - proposal.accepted - Proposal accepted
 * - proposal.rejected - Proposal rejected
 * - proposal.revision_requested - Revision requested
 * 
 * ROLE TRIGGERS:
 * - role.approved - Role request approved
 * - role.rejected - Role request rejected
 * 
 * FINANCE TRIGGERS:
 * - invoice.issued - Invoice issued
 * - payment.received - Payment received
 * - payment.overdue - Payment overdue
 */

export default useEmailTrigger;

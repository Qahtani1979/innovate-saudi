import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * useApprovalRequest Hook
 *
 * Shared utility for creating approval requests from any entity.
 * NOTE: This intentionally does NOT use React hooks.
 * Some environments can hit "dispatcher is null" issues when multiple React copies exist;
 * avoiding hooks here keeps this helper safe and prevents crashes in the strategy wizard.
 */

// Default SLA days by entity type
export const DEFAULT_SLA_DAYS = {
  challenge: 5,
  pilot: 7,
  living_lab: 7,
  sandbox: 7,
  partnership: 10,
  event: 3,
  rd_call: 7,
  policy: 14,
  campaign: 5,
  program: 5,
  strategic_plan: 14,
};

// Default gate names by entity type
export const DEFAULT_GATE_NAMES = {
  challenge: 'submission',
  pilot: 'design_review',
  living_lab: 'setup_review',
  sandbox: 'setup_review',
  partnership: 'initial_review',
  event: 'approval',
  rd_call: 'publication_review',
  policy: 'legal_review',
  campaign: 'content_review',
  program: 'approval',
  strategic_plan: 'plan_approval',
};

function getErrorMessage(err) {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
}

async function resolveRequesterEmail(requesterEmail) {
  if (requesterEmail) return requesterEmail;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email ?? null;
}

/**
 * Create an approval request for a strategy-derived entity
 *
 * @param {Object} params
 * @param {string} params.entityType - Type of entity (challenge, pilot, etc.)
 * @param {string} params.entityId - UUID of the saved entity
 * @param {string} params.entityTitle - Display title for the approval request
 * @param {string} params.requesterEmail - Email of the user creating the entity
 * @param {Object} params.metadata - Additional metadata for the approval
 * @param {number} [params.slaDays] - Optional custom SLA days
 * @param {string} [params.gateName] - Optional custom gate name
 * @param {boolean} [params.isStrategyDerived=true] - Whether this is strategy-derived
 * @param {string[]} [params.strategicPlanIds] - Linked strategic plan IDs
 * @returns {Promise<{success: boolean, approvalId?: string, error?: string}>}
 */
export async function createApprovalRequest({
  entityType,
  entityId,
  entityTitle,
  requesterEmail,
  metadata = {},
  slaDays,
  gateName,
  isStrategyDerived = true,
  strategicPlanIds = [],
}) {
  if (!entityType || !entityId) {
    console.warn('createApprovalRequest: Missing entityType or entityId');
    return { success: false, error: 'Missing required parameters' };
  }

  try {
    const email = await resolveRequesterEmail(requesterEmail);

    if (!email) {
      console.warn('createApprovalRequest: No requester email available');
      return { success: false, error: 'No requester email' };
    }

    // Calculate SLA due date
    const slaToUse = slaDays || DEFAULT_SLA_DAYS[entityType] || 7;
    const slaDueDate = new Date();
    slaDueDate.setDate(slaDueDate.getDate() + slaToUse);

    // Determine gate name
    const gateToUse = gateName || DEFAULT_GATE_NAMES[entityType] || 'submission';

    // Build approval request
    const approvalRequest = {
      entity_type: entityType,
      entity_id: entityId,
      request_type: `${entityType}_approval`,
      requester_email: email,
      approval_status: 'pending',
      sla_due_date: slaDueDate.toISOString(),
      metadata: {
        gate_name: gateToUse,
        title: entityTitle,
        is_strategy_derived: isStrategyDerived,
        strategic_plan_ids: strategicPlanIds,
        source: 'cascade_generator',
        ...metadata,
      },
    };

    const { data, error } = await supabase
      .from('approval_requests')
      .insert(approvalRequest)
      .select()
      .single();

    if (error) {
      console.error('Error creating approval request:', error);
      return { success: false, error: error.message };
    }

    return { success: true, approvalId: data.id };
  } catch (err) {
    console.error('Unexpected error in createApprovalRequest:', err);
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * Create approval request with user notification
 *
 * @param {Object} params - Same as createApprovalRequest
 * @param {Object} options
 * @param {boolean} options.showToast - Whether to show toast notification
 * @param {string} options.successMessage - Custom success message
 */
export async function createApprovalRequestWithNotification(
  params,
  options = { showToast: true },
) {
  const result = await createApprovalRequest(params);

  if (options?.showToast) {
    if (result.success) {
      toast.success(options.successMessage || 'Submitted for approval');
    } else {
      toast.error(`Failed to submit for approval: ${result.error}`);
    }
  }

  return result;
}

/**
 * Batch create approval requests for multiple entities
 *
 * @param {Array<Object>} requests - Array of approval request params
 * @returns {Promise<{success: boolean, results: Array}>}
 */
export async function batchCreateApprovalRequests(requests) {
  const results = await Promise.all((requests || []).map((req) => createApprovalRequest(req)));
  const allSuccess = results.every((r) => r.success);
  return { success: allSuccess, results };
}

/**
 * Check if an approval request already exists for an entity
 *
 * @param {string} entityType
 * @param {string} entityId
 * @returns {Promise<boolean>}
 */
export async function hasExistingApprovalRequest(entityType, entityId) {
  try {
    const { count, error } = await supabase
      .from('approval_requests')
      .select('id', { count: 'exact', head: true })
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .in('approval_status', ['pending', 'in_review']);

    if (error) {
      console.error('Error checking existing approval:', error);
      return false;
    }

    return (count || 0) > 0;
  } catch (err) {
    console.error('Unexpected error in hasExistingApprovalRequest:', err);
    return false;
  }
}

// Update an approval request
export async function updateApprovalRequest(id, data) {
  const { data: updated, error } = await supabase
    .from('approval_requests')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export function useApprovalRequest() {
  return {
    createApprovalRequest,
    createApprovalRequestWithNotification,
    batchCreateApprovalRequests,
    hasExistingApprovalRequest,
    updateApprovalRequest,
    DEFAULT_SLA_DAYS,
    DEFAULT_GATE_NAMES,
  };
}

export function useApprovalMutations() {
  const queryClient = useQueryClient();

  const updateApproval = useMutation({
    mutationFn: async ({ id, data }) => updateApprovalRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
    }
  });

  return {
    updateApproval
  };
}

export default useApprovalRequest;


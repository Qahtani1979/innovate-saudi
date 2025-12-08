import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Approve or reject delegation request
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { delegationId, approved } = await req.json();

    const delegation = await base44.asServiceRole.entities.DelegationRule.filter({ id: delegationId }).then(r => r[0]);
    
    if (!delegation) {
      return Response.json({ error: 'Delegation not found' }, { status: 404 });
    }

    await base44.asServiceRole.entities.DelegationRule.update(delegationId, {
      approval_status: approved ? 'approved' : 'rejected',
      approved_by: user.email,
      approved_date: new Date().toISOString(),
      is_active: approved
    });

    // Send notification
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: delegation.delegator_email,
      subject: `Delegation ${approved ? 'Approved' : 'Rejected'}`,
      body: `Your delegation request to ${delegation.delegatee_email} has been ${approved ? 'approved' : 'rejected'}.`
    });

    return Response.json({ 
      success: true, 
      approved,
      message: `Delegation ${approved ? 'approved' : 'rejected'}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
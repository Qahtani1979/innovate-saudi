import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, pilot_id, phase, amount, comments } = await req.json();

    // Get the pilot
    const pilots = await base44.asServiceRole.entities.Pilot.filter({ id: pilot_id });
    if (!pilots || pilots.length === 0) {
      return Response.json({ error: 'Pilot not found' }, { status: 404 });
    }

    const pilot = pilots[0];

    if (action === 'request') {
      // Request budget approval
      const budgetApprovals = pilot.budget_approvals || [];
      budgetApprovals.push({
        phase,
        amount,
        approved: null,
        requested_by: user.email,
        request_date: new Date().toISOString(),
        status: 'pending'
      });

      await base44.asServiceRole.entities.Pilot.update(pilot_id, {
        budget_approvals: budgetApprovals
      });

      // Send email to budget approver
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'budget.admin@example.com',
        subject: `Budget Approval Request: ${pilot.title_en} - ${phase}`,
        body: `Budget approval requested for pilot.\n\nPilot: ${pilot.title_en}\nPhase: ${phase}\nAmount: ${amount} SAR\nRequested by: ${user.full_name}`
      });

      return Response.json({ success: true, message: 'Budget approval requested' });
    }

    if (action === 'approve' || action === 'reject') {
      const budgetApprovals = pilot.budget_approvals || [];
      const approvalIndex = budgetApprovals.findIndex(a => a.phase === phase && a.status === 'pending');
      
      if (approvalIndex === -1) {
        return Response.json({ error: 'Approval request not found' }, { status: 404 });
      }

      budgetApprovals[approvalIndex] = {
        ...budgetApprovals[approvalIndex],
        approved: action === 'approve',
        approved_by: user.email,
        approval_date: new Date().toISOString(),
        comments,
        status: action === 'approve' ? 'approved' : 'rejected'
      };

      const updates = { budget_approvals: budgetApprovals };
      
      if (action === 'approve') {
        updates.budget_released = (pilot.budget_released || 0) + amount;
      }

      await base44.asServiceRole.entities.Pilot.update(pilot_id, updates);

      // Send email to requester
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: budgetApprovals[approvalIndex].requested_by,
        subject: `Budget ${action === 'approve' ? 'Approved' : 'Rejected'}: ${pilot.title_en}`,
        body: `Budget request ${action === 'approve' ? 'approved' : 'rejected'}.\n\nPilot: ${pilot.title_en}\nPhase: ${phase}\nAmount: ${amount} SAR\n${action === 'approve' ? 'Approved' : 'Rejected'} by: ${user.full_name}\nComments: ${comments || 'None'}`
      });

      return Response.json({ success: true, message: `Budget ${action}d` });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
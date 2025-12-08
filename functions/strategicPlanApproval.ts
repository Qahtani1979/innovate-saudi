import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, plan_id, comments, decision } = await req.json();

    // Get the strategic plan
    const plan = await base44.asServiceRole.entities.StrategicPlan.filter({ id: plan_id });
    if (!plan || plan.length === 0) {
      return Response.json({ error: 'Plan not found' }, { status: 404 });
    }

    const currentPlan = plan[0];

    if (action === 'submit') {
      // Submit for approval
      await base44.asServiceRole.entities.StrategicPlan.update(plan_id, {
        status: 'under_review',
        approval_status: 'pending',
        submitted_date: new Date().toISOString(),
        submitted_by: user.email
      });

      // Send email to reviewers
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'admin@example.com', // Should be fetched from config
        subject: `Strategic Plan Submitted for Review: ${currentPlan.name_en}`,
        body: `A new strategic plan has been submitted for review.\n\nPlan: ${currentPlan.name_en}\nSubmitted by: ${user.full_name}\n\nPlease review and approve.`
      });

      return Response.json({ success: true, message: 'Plan submitted for approval' });
    }

    if (action === 'approve') {
      // Approve the plan
      await base44.asServiceRole.entities.StrategicPlan.update(plan_id, {
        status: 'approved',
        approval_status: 'approved',
        approved_by: user.email,
        approval_date: new Date().toISOString(),
        approval_comments: comments
      });

      // Send email to submitter
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: currentPlan.submitted_by || currentPlan.created_by,
        subject: `Strategic Plan Approved: ${currentPlan.name_en}`,
        body: `Your strategic plan has been approved.\n\nPlan: ${currentPlan.name_en}\nApproved by: ${user.full_name}\nComments: ${comments || 'None'}`
      });

      return Response.json({ success: true, message: 'Plan approved' });
    }

    if (action === 'reject') {
      // Reject the plan
      await base44.asServiceRole.entities.StrategicPlan.update(plan_id, {
        status: 'draft',
        approval_status: 'rejected',
        approved_by: user.email,
        approval_date: new Date().toISOString(),
        approval_comments: comments
      });

      // Send email to submitter
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: currentPlan.submitted_by || currentPlan.created_by,
        subject: `Strategic Plan Rejected: ${currentPlan.name_en}`,
        body: `Your strategic plan has been rejected and requires revision.\n\nPlan: ${currentPlan.name_en}\nRejected by: ${user.full_name}\nComments: ${comments || 'None'}`
      });

      return Response.json({ success: true, message: 'Plan rejected' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
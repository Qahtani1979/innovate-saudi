import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, review_id, review_data, comments, decisions } = await req.json();

    if (action === 'create') {
      // Create new portfolio review
      const challenges = await base44.asServiceRole.entities.Challenge.list();
      const pilots = await base44.asServiceRole.entities.Pilot.list();
      const rdProjects = await base44.asServiceRole.entities.RDProject.list();

      const reviewData = {
        review_period: review_data.period,
        review_quarter: review_data.quarter,
        review_year: review_data.year,
        status: 'pending',
        created_by: user.email,
        created_date: new Date().toISOString(),
        metrics: {
          total_challenges: challenges.length,
          active_pilots: pilots.filter(p => p.stage === 'active').length,
          completed_pilots: pilots.filter(p => p.stage === 'completed').length,
          active_rd: rdProjects.filter(r => r.status === 'active').length,
          budget_utilization: review_data.budget_utilization || 0
        },
        recommendations: review_data.recommendations || []
      };

      // Store in PlatformConfig for portfolio reviews
      await base44.asServiceRole.entities.PlatformConfig.create({
        config_key: `portfolio_review_${review_data.quarter}_${review_data.year}`,
        config_value: reviewData,
        category: 'workflow'
      });

      // Send email to reviewers
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'portfolio.reviewers@example.com',
        subject: `Portfolio Review Required: Q${review_data.quarter} ${review_data.year}`,
        body: `Quarterly portfolio review is ready.\n\nPeriod: Q${review_data.quarter} ${review_data.year}\nInitiated by: ${user.full_name}\n\nPlease review metrics and provide feedback.`
      });

      return Response.json({ success: true, review_id: reviewData.config_key });
    }

    if (action === 'approve') {
      // Approve portfolio review
      const configs = await base44.asServiceRole.entities.PlatformConfig.filter({ config_key: review_id });
      if (!configs || configs.length === 0) {
        return Response.json({ error: 'Review not found' }, { status: 404 });
      }

      const config = configs[0];
      const reviewData = config.config_value;

      reviewData.status = 'approved';
      reviewData.approved_by = user.email;
      reviewData.approval_date = new Date().toISOString();
      reviewData.approval_comments = comments;
      reviewData.decisions = decisions;

      await base44.asServiceRole.entities.PlatformConfig.update(config.id, {
        config_value: reviewData
      });

      // Send email to creator
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: reviewData.created_by,
        subject: `Portfolio Review Approved: ${reviewData.review_period}`,
        body: `Portfolio review approved.\n\nPeriod: ${reviewData.review_period}\nApproved by: ${user.full_name}\nComments: ${comments || 'None'}`
      });

      return Response.json({ success: true, message: 'Review approved' });
    }

    if (action === 'request_revision') {
      // Request revisions
      const configs = await base44.asServiceRole.entities.PlatformConfig.filter({ config_key: review_id });
      if (!configs || configs.length === 0) {
        return Response.json({ error: 'Review not found' }, { status: 404 });
      }

      const config = configs[0];
      const reviewData = config.config_value;

      reviewData.status = 'revision_required';
      reviewData.reviewed_by = user.email;
      reviewData.review_date = new Date().toISOString();
      reviewData.review_comments = comments;

      await base44.asServiceRole.entities.PlatformConfig.update(config.id, {
        config_value: reviewData
      });

      // Send email to creator
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: reviewData.created_by,
        subject: `Portfolio Review - Revision Required: ${reviewData.review_period}`,
        body: `Portfolio review requires revisions.\n\nPeriod: ${reviewData.review_period}\nReviewed by: ${user.full_name}\nComments: ${comments}`
      });

      return Response.json({ success: true, message: 'Revision requested' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
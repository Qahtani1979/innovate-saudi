import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_type, entity_type, entity_id, expert_email, submitter_email } = await req.json();

    if (!event_type || !entity_type || !entity_id) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const entityLabels = {
      'rd_proposal': 'R&D Proposal',
      'program_application': 'Program Application',
      'matchmaker_application': 'Matchmaker Application',
      'citizen_idea': 'Citizen Idea',
      'challenge': 'Challenge',
      'solution': 'Solution',
      'pilot': 'Pilot',
      'scaling_plan': 'Scaling Plan'
    };

    const entityLabel = entityLabels[entity_type] || entity_type;

    // Handle different notification events
    if (event_type === 'expert_assigned') {
      // Notify expert they've been assigned
      if (expert_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: expert_email,
          subject: `New Evaluation Assignment - ${entityLabel}`,
          body: `You have been assigned to evaluate a ${entityLabel} (ID: ${entity_id}).

Please log in to the platform to complete your evaluation.

Thank you for your expertise.`
        });
      }
    } else if (event_type === 'evaluation_submitted') {
      // Notify submitter that their submission has been evaluated
      if (submitter_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: submitter_email,
          subject: `Evaluation Update - ${entityLabel}`,
          body: `Your ${entityLabel} (ID: ${entity_id}) has received a new evaluation.

Log in to view the evaluation details.`
        });
      }
    } else if (event_type === 'consensus_reached') {
      // Get evaluation details
      const allEvaluations = await base44.asServiceRole.entities.ExpertEvaluation.list();
      const evaluations = allEvaluations.filter(
        e => e.entity_type === entity_type && e.entity_id === entity_id && !e.is_deleted
      );

      const avgScore = evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length;
      const recommendation = evaluations[0]?.recommendation;

      // Notify submitter
      if (submitter_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: submitter_email,
          subject: `Evaluation Complete - ${entityLabel}`,
          body: `The evaluation of your ${entityLabel} (ID: ${entity_id}) is complete.

Consensus Recommendation: ${recommendation?.replace(/_/g, ' ')}
Average Score: ${avgScore.toFixed(1)}/100
Number of Evaluators: ${evaluations.length}

Log in to view detailed feedback.`
        });
      }

      // Notify admin
      const adminUsers = await base44.asServiceRole.entities.User.list();
      const admins = adminUsers.filter(u => u.role === 'admin');
      
      for (const admin of admins.slice(0, 3)) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `Consensus Reached - ${entityLabel}`,
          body: `A consensus has been reached for ${entityLabel} (ID: ${entity_id}).

Recommendation: ${recommendation?.replace(/_/g, ' ')}
Score: ${avgScore.toFixed(1)}/100

Please review and take appropriate action.`
        });
      }
    }

    return Response.json({ 
      success: true,
      message: `Notification sent for ${event_type}`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
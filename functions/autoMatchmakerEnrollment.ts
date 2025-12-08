import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { solution_id } = await req.json();

    if (!solution_id) {
      return Response.json({ error: 'solution_id required' }, { status: 400 });
    }

    // Get solution
    const solutions = await base44.asServiceRole.entities.Solution.filter({ id: solution_id });
    const solution = solutions[0];

    if (!solution) {
      return Response.json({ error: 'Solution not found' }, { status: 404 });
    }

    // Check if already verified
    if (solution.workflow_stage !== 'verified') {
      return Response.json({ 
        message: 'Solution not yet verified - enrollment will happen after verification' 
      });
    }

    // Check if provider already has matchmaker application
    const existingApps = await base44.asServiceRole.entities.MatchmakerApplication.filter({
      applicant_email: solution.created_by
    });

    if (existingApps.length > 0) {
      return Response.json({ 
        message: 'Provider already has matchmaker application',
        application_id: existingApps[0].id
      });
    }

    // Get provider organization
    const orgs = await base44.asServiceRole.entities.Organization.filter({
      $or: [
        { id: solution.provider_id },
        { created_by: solution.created_by }
      ]
    });
    const organization = orgs[0];

    // Create matchmaker application
    const matchmakerApp = await base44.asServiceRole.entities.MatchmakerApplication.create({
      applicant_email: solution.created_by,
      organization_id: organization?.id,
      organization_name: solution.provider_name,
      classification: 'provider', // Will be refined by evaluators
      capabilities: solution.features || [],
      sectors: solution.sectors || [],
      solution_portfolio: [solution.id],
      stage: 'auto_enrolled',
      score: 50, // Base score, will be refined
      source: 'solution_approval',
      status: 'pending_classification'
    });

    // Notify provider
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: solution.created_by,
      subject: 'Welcome to Matchmaker - Opportunity Discovery',
      body: `Congratulations! Your solution "${solution.name_en}" has been verified and you've been enrolled in our Matchmaker program.

The Matchmaker program connects you with relevant municipal challenges and opportunities.

Next Steps:
1. Your application will be reviewed and classified
2. You'll be matched to relevant municipal challenges
3. You can then propose pilots and partnerships

View your matchmaker status: [Dashboard Link]

Best regards,
Saudi Innovates Team`
    });

    // Log activity
    await base44.asServiceRole.entities.SystemActivity.create({
      entity_type: 'Solution',
      entity_id: solution.id,
      activity_type: 'auto_enrolled_matchmaker',
      description_en: 'Provider auto-enrolled in Matchmaker program after solution verification'
    });

    return Response.json({
      success: true,
      message: 'Provider auto-enrolled in Matchmaker',
      matchmaker_application_id: matchmakerApp.id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pilot_id } = await req.json();

    if (!pilot_id) {
      return Response.json({ error: 'pilot_id required' }, { status: 400 });
    }

    const pilots = await base44.asServiceRole.entities.Pilot.filter({ id: pilot_id });
    const pilot = pilots[0];

    if (!pilot) {
      return Response.json({ error: 'Pilot not found' }, { status: 404 });
    }

    // Only generate for successfully completed pilots
    if (pilot.stage !== 'completed' && pilot.stage !== 'scaled') {
      return Response.json({ error: 'Pilot not completed' }, { status: 400 });
    }

    // Get related entities
    const solutions = await base44.asServiceRole.entities.Solution.filter({ id: pilot.solution_id });
    const solution = solutions[0];

    const challenges = await base44.asServiceRole.entities.Challenge.filter({ id: pilot.challenge_id });
    const challenge = challenges[0];

    // Generate success story with AI
    const story = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate a compelling success story for this municipal innovation pilot in BOTH English and Arabic:

Challenge: ${challenge?.title_en}
Solution: ${solution?.name_en}
Provider: ${solution?.provider_name}
Municipality: ${pilot.municipality_id}
Duration: ${pilot.duration_weeks} weeks
Impact: ${JSON.stringify(pilot.success_metrics)}
KPIs Achieved: ${JSON.stringify(pilot.kpis)}

Create a professional case study with:
1. Executive Summary (3-4 sentences)
2. Challenge Background
3. Solution Approach
4. Implementation Process
5. Results & Impact
6. Key Learnings
7. Scaling Potential

Make it compelling for other municipalities and solution providers.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          summary_en: { type: 'string' },
          summary_ar: { type: 'string' },
          challenge_background_en: { type: 'string' },
          challenge_background_ar: { type: 'string' },
          solution_approach_en: { type: 'string' },
          solution_approach_ar: { type: 'string' },
          results_en: { type: 'string' },
          results_ar: { type: 'string' },
          key_learnings: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          impact_metrics: { type: 'object' }
        }
      }
    });

    // Create case study
    const caseStudy = await base44.asServiceRole.entities.CaseStudy.create({
      title_en: story.title_en,
      title_ar: story.title_ar,
      summary_en: story.summary_en,
      summary_ar: story.summary_ar,
      challenge_background_en: story.challenge_background_en,
      challenge_background_ar: story.challenge_background_ar,
      solution_approach_en: story.solution_approach_en,
      solution_approach_ar: story.solution_approach_ar,
      results_en: story.results_en,
      results_ar: story.results_ar,
      key_learnings: story.key_learnings,
      pilot_id: pilot.id,
      solution_id: solution?.id,
      challenge_id: challenge?.id,
      municipality_id: pilot.municipality_id,
      provider_name: solution?.provider_name,
      is_published: false,
      auto_generated: true,
      generated_date: new Date().toISOString()
    });

    // Link to pilot
    await base44.asServiceRole.entities.Pilot.update(pilot_id, {
      case_study_id: caseStudy.id
    });

    return Response.json({
      success: true,
      case_study_id: caseStudy.id,
      message: 'Success story generated'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
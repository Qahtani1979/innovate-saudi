import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { strategicPlanId } = await req.json();

    // Fetch strategic plan
    const plan = await base44.asServiceRole.entities.StrategicPlan.get(strategicPlanId);
    
    if (!plan) {
      return Response.json({ error: 'Strategic plan not found' }, { status: 404 });
    }

    // Extract strategic context
    const strategicContext = {
      themes: plan.strategic_themes || [],
      objectives: plan.objectives_en || plan.objectives_ar || '',
      pillars: plan.strategic_pillar_id || '',
      focusAreas: plan.focus_areas || [],
      kpis: plan.kpis || []
    };

    // Use AI to generate program campaign themes
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a strategic innovation program designer. Based on this strategic plan, generate 3-5 innovation program campaign themes.

Strategic Plan Context:
- Themes: ${strategicContext.themes.join(', ')}
- Objectives: ${strategicContext.objectives}
- Focus Areas: ${strategicContext.focusAreas.join(', ')}
- KPIs: ${strategicContext.kpis.map(k => k.name).join(', ')}

For each program theme, provide:
1. Program name (both English and Arabic)
2. Tagline (both languages)
3. Program type (accelerator, incubator, hackathon, challenge, fellowship, training, matchmaker)
4. Target participants (startups, researchers, municipalities, citizens)
5. Expected outcomes (pilots, partnerships, solutions)
6. Strategic alignment explanation
7. Recommended duration (weeks)
8. Focus areas

Return as JSON array.`,
      response_json_schema: {
        type: "object",
        properties: {
          programThemes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name_en: { type: "string" },
                name_ar: { type: "string" },
                tagline_en: { type: "string" },
                tagline_ar: { type: "string" },
                program_type: { type: "string" },
                target_participants: { type: "array", items: { type: "string" } },
                expected_outcomes: { type: "object" },
                strategic_alignment: { type: "string" },
                duration_weeks: { type: "number" },
                focus_areas: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    const generatedThemes = aiResponse.programThemes || [];

    return Response.json({
      success: true,
      strategicPlanId,
      themesGenerated: generatedThemes.length,
      themes: generatedThemes
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
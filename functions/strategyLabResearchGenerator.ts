import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { strategicPlanId } = await req.json();

    const plan = await base44.asServiceRole.entities.StrategicPlan.get(strategicPlanId);
    
    if (!plan) {
      return Response.json({ error: 'Strategic plan not found' }, { status: 404 });
    }

    // AI generates living lab research priorities
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Based on this strategic plan, define research priorities for citizen science living labs.

Strategic Plan:
- Policy Goals: ${plan.policy_goals?.join(', ') || 'N/A'}
- Objectives: ${plan.objectives_en}
- Themes: ${plan.strategic_themes?.join(', ') || 'N/A'}
- Citizen Engagement Priorities: ${plan.citizen_engagement_priorities?.join(', ') || 'N/A'}

For each research theme, provide:
1. Research theme name (EN + AR)
2. Citizen research questions
3. Data collection methods
4. Expected citizen insights
5. Policy impact potential
6. Resource requirements

Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          researchThemes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                theme_name_en: { type: "string" },
                theme_name_ar: { type: "string" },
                research_questions: { type: "array", items: { type: "string" } },
                data_collection_methods: { type: "array", items: { type: "string" } },
                expected_insights: { type: "string" },
                policy_impact_potential: { type: "string" },
                resources_needed: { type: "object" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      strategicPlanId,
      themesGenerated: aiResponse.researchThemes?.length || 0,
      themes: aiResponse.researchThemes || []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
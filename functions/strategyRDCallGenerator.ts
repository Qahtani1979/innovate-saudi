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

    // Use AI to generate R&D call focus areas from strategic gaps
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a research funding strategist. Based on this strategic plan, identify 2-3 R&D call focus areas that address strategic gaps.

Strategic Plan:
- Objectives: ${plan.objectives_en || plan.objectives_ar}
- Strategic Themes: ${plan.strategic_themes?.join(', ') || 'N/A'}
- Focus Areas: ${plan.focus_areas?.join(', ') || 'N/A'}
- Gap Analysis: ${plan.gap_analysis || 'N/A'}

For each R&D call, provide:
1. Title (English and Arabic)
2. Research themes (array)
3. Expected outputs
4. Target TRL range
5. Budget range
6. Strategic alignment explanation
7. Success metrics

Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          rdCalls: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title_en: { type: "string" },
                title_ar: { type: "string" },
                description_en: { type: "string" },
                description_ar: { type: "string" },
                research_themes: { type: "array", items: { type: "string" } },
                expected_outputs: { type: "array", items: { type: "string" } },
                trl_range: { type: "object" },
                budget_range: { type: "object" },
                strategic_alignment: { type: "string" },
                success_metrics: { type: "array" }
              }
            }
          }
        }
      }
    });

    const generatedCalls = aiResponse.rdCalls || [];

    return Response.json({
      success: true,
      strategicPlanId,
      callsGenerated: generatedCalls.length,
      calls: generatedCalls
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
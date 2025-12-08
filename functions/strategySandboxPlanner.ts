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

    // AI generates sandbox infrastructure needs
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Based on this strategic plan, identify which sectors need regulatory sandbox infrastructure for innovation testing.

Strategic Plan:
- Themes: ${plan.strategic_themes?.join(', ') || 'N/A'}
- Objectives: ${plan.objectives_en}
- Innovation Priorities: ${plan.innovation_priorities?.join(', ') || 'N/A'}

For each recommended sandbox, provide:
1. Sector and subsector
2. Sandbox purpose and testing focus
3. Regulatory framework needed
4. Target innovations
5. Success metrics
6. Budget estimate

Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          sandboxes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name_en: { type: "string" },
                name_ar: { type: "string" },
                sector: { type: "string" },
                subsector: { type: "string" },
                testing_focus: { type: "string" },
                regulatory_framework: { type: "array", items: { type: "string" } },
                target_innovations: { type: "array", items: { type: "string" } },
                success_metrics: { type: "array" },
                budget_estimate: { type: "number" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      strategicPlanId,
      sandboxesRecommended: aiResponse.sandboxes?.length || 0,
      sandboxes: aiResponse.sandboxes || []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
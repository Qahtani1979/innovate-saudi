import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { arabic_fields } = await req.json();

    // Build translation prompt
    const prompt = `You are translating Saudi government policy documents from Arabic to formal English.

CRITICAL REQUIREMENTS:
1. Preserve formal policy/regulatory language tone
2. Maintain legal precision and terminology
3. Keep Saudi-specific terms in Arabic with English translation
   Example: "المجلس البلدي" → "Municipal Council (المجلس البلدي)"
4. Preserve structure and formatting
5. Use government document standards

ARABIC POLICY FIELDS TO TRANSLATE:

Title (Arabic):
${arabic_fields.title_ar || 'N/A'}

Policy Recommendation Text (Arabic):
${arabic_fields.recommendation_text_ar || 'N/A'}

Implementation Steps (Arabic):
${JSON.stringify(arabic_fields.implementation_steps || [], null, 2)}

Success Metrics (Arabic):
${JSON.stringify(arabic_fields.success_metrics || [], null, 2)}

Stakeholder Involvement (Arabic):
${arabic_fields.stakeholder_involvement_ar || 'N/A'}

TASK: Translate all fields to formal English suitable for official government documentation.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          recommendation_text_en: { type: 'string' },
          implementation_steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                en: { type: 'string' }
              }
            }
          },
          success_metrics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                metric_en: { type: 'string' }
              }
            }
          },
          stakeholder_involvement_en: { type: 'string' }
        }
      }
    });

    // Merge with Arabic steps/metrics structure
    const implementation_steps = arabic_fields.implementation_steps?.map((step, i) => ({
      ar: step.ar,
      en: result.implementation_steps?.[i]?.en || step.ar
    })) || [];

    const success_metrics = arabic_fields.success_metrics?.map((metric, i) => ({
      metric_ar: metric.metric_ar,
      metric_en: result.success_metrics?.[i]?.metric_en || metric.metric_ar,
      target: metric.target,
      unit: metric.unit
    })) || [];

    return Response.json({
      title_en: result.title_en,
      recommendation_text_en: result.recommendation_text_en,
      implementation_steps,
      success_metrics,
      stakeholder_involvement_en: result.stakeholder_involvement_en,
      translation_metadata: {
        last_translated: new Date().toISOString(),
        translation_version: 1
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
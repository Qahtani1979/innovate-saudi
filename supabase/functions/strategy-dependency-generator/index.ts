import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMPACT_SAUDI_CONTEXT = `MoMAH - Saudi Ministry of Municipalities & Housing. Vision 2030 aligned.
13 regions, 285+ municipalities. Programs: Sakani, Wafi, Ejar.
Key systems: Balady Platform, Sakani Portal, ANSA, Mostadam.
Partners: KACST, SDAIA, MCIT, KAUST, KFUPM, Monsha'at.`;

const DEPENDENCY_CONTEXT = `Strategic Dependencies for Saudi Government Entities:
- Internal: Budget approvals, leadership endorsement, staff training, IT systems
- External: Vendor contracts, partner agreements, regulatory clearances
- Technical: System integrations, data migrations, infrastructure readiness
- Resource: Staff availability, specialized skills, equipment procurement

Common Constraints in Saudi Context:
- Budget: Fiscal year cycles, procurement regulations
- Time: Vision 2030 deadlines, program milestones
- Resource: Saudization requirements, specialized talent
- Regulatory: Compliance with Saudi standards, licensing
- Technical: Legacy system limitations, integration challenges

Key Assumptions to Validate:
- Stakeholder support and engagement levels
- Budget availability and approval timelines
- Technology readiness and adoption rates
- Market conditions and economic factors
- Regulatory stability and policy continuity`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { context, language = 'en' } = await req.json();
    
    const planContext = context?.planData || {};
    const contextData = planContext.step1 || {};
    const visionData = planContext.step2 || {};
    const stakeholders = planContext.step3?.stakeholders || [];
    const risks = planContext.step7?.risks || [];

    const contextSummary = `
PLAN CONTEXT:
- Entity: ${contextData.entity_name_en || contextData.entity_name || 'Municipality/Entity'}
- Type: ${contextData.entity_type || 'municipality'}
- Duration: ${contextData.duration_years || 5} years
- Vision: ${visionData.vision_en || 'Not specified'}
- Strategic Pillars: ${(visionData.strategic_pillars || []).map((p: any) => p.title_en || p.name_en).slice(0, 4).join(', ')}

KEY STAKEHOLDERS (${stakeholders.length} total):
${stakeholders.slice(0, 5).map((s: any) => `- ${s.name_en || s.name}: ${s.type || 'stakeholder'}`).join('\n')}

HIGH-PRIORITY RISKS:
${risks.filter((r: any) => r.risk_score >= 6).slice(0, 3).map((r: any) => `- ${r.title_en}`).join('\n') || 'None identified'}`;

    const prompt = `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${COMPACT_SAUDI_CONTEXT}

${DEPENDENCY_CONTEXT}

Based on the following strategic plan context, identify dependencies, constraints, and key assumptions:

${contextSummary}

Generate:
1. 5-7 DEPENDENCIES: Things that must be in place for strategy success
2. 4-6 CONSTRAINTS: Limitations the strategy must work within
3. 4-6 ASSUMPTIONS: Key beliefs underlying the strategy

For each item provide bilingual content (English and Arabic).
Consider Saudi-specific factors like Vision 2030 alignment, Saudization, digital transformation mandates.`;

    console.log('[strategy-dependency-generator] Generating for:', contextData.entity_name_en || 'entity');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a strategic planning expert. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_dependencies_analysis',
            description: 'Generate dependencies, constraints, and assumptions for strategic plan',
            parameters: {
              type: 'object',
              properties: {
                dependencies: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name_en: { type: 'string', description: 'Dependency name in English' },
                      name_ar: { type: 'string', description: 'Dependency name in Arabic' },
                      type: { type: 'string', enum: ['internal', 'external', 'technical', 'resource'], description: 'Type of dependency' },
                      source: { type: 'string', description: 'Where the dependency originates from (department, system, or entity)' },
                      target: { type: 'string', description: 'What component or initiative depends on this' },
                      criticality: { type: 'string', enum: ['low', 'medium', 'high'], description: 'How critical is this dependency' },
                      status: { type: 'string', enum: ['pending', 'resolved', 'blocked'], description: 'Current status' },
                      notes: { type: 'string', description: 'Additional notes or context' }
                    },
                    required: ['name_en', 'name_ar', 'type', 'source', 'target', 'criticality', 'status', 'notes'],
                    additionalProperties: false
                  }
                },
                constraints: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      description_en: { type: 'string', description: 'Constraint description in English' },
                      description_ar: { type: 'string', description: 'Constraint description in Arabic' },
                      type: { type: 'string', enum: ['budget', 'time', 'resource', 'regulatory', 'technical'], description: 'Type of constraint' },
                      impact: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Impact level of this constraint' },
                      mitigation_en: { type: 'string', description: 'How to mitigate or work around this constraint in English' },
                      mitigation_ar: { type: 'string', description: 'How to mitigate or work around this constraint in Arabic' }
                    },
                    required: ['description_en', 'description_ar', 'type', 'impact', 'mitigation_en', 'mitigation_ar'],
                    additionalProperties: false
                  }
                },
                assumptions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      statement_en: { type: 'string', description: 'Assumption statement in English' },
                      statement_ar: { type: 'string', description: 'Assumption statement in Arabic' },
                      category: { type: 'string', enum: ['operational', 'financial', 'market', 'stakeholder', 'regulatory'], description: 'Category of assumption' },
                      confidence: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Confidence level in this assumption' },
                      validation_method_en: { type: 'string', description: 'Method to validate this assumption in English' },
                      validation_method_ar: { type: 'string', description: 'Method to validate this assumption in Arabic' }
                    },
                    required: ['statement_en', 'statement_ar', 'category', 'confidence', 'validation_method_en', 'validation_method_ar'],
                    additionalProperties: false
                  }
                }
              },
              required: ['dependencies', 'constraints', 'assumptions'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_dependencies_analysis' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[strategy-dependency-generator] AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error('No valid tool call response');
    }

    const generatedData = JSON.parse(toolCall.function.arguments);

    // Add IDs to all items
    const result = {
      dependencies: (generatedData.dependencies || []).map((d: any, i: number) => ({
        ...d,
        id: `dep-${Date.now()}-${i}`,
        source: d.source || '',
        target: d.target || '',
        notes: d.notes || ''
      })),
      constraints: (generatedData.constraints || []).map((c: any, i: number) => ({
        ...c,
        id: `con-${Date.now()}-${i}`,
        mitigation_en: c.mitigation_en || '',
        mitigation_ar: c.mitigation_ar || ''
      })),
      assumptions: (generatedData.assumptions || []).map((a: any, i: number) => ({
        ...a,
        id: `asm-${Date.now()}-${i}`,
        validation_method_en: a.validation_method_en || '',
        validation_method_ar: a.validation_method_ar || ''
      }))
    };

    console.log('[strategy-dependency-generator] Generated:', 
      result.dependencies.length, 'dependencies,',
      result.constraints.length, 'constraints,',
      result.assumptions.length, 'assumptions');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[strategy-dependency-generator] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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

const OBJECTIVE_CONTEXT = `Strategic Objectives Best Practices:
- SMART: Specific, Measurable, Achievable, Relevant, Time-bound
- Align with Vision 2030 goals and national priorities
- Balance across sectors: Municipal Services, Housing, Urban Planning, Environment, Technology
- Include digital transformation and sustainability dimensions
- Consider citizen experience and service quality improvements

Priority Levels:
- high: Critical for Vision 2030 targets, immediate attention needed
- medium: Important for strategic success, standard timeline
- low: Supportive objectives, flexible timeline`;

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
    
    const wizardData = context?.wizardData || context?.planData || {};
    const pillars = wizardData.strategic_pillars || [];
    const swot = wizardData.swot || {};
    const risks = wizardData.risks || [];
    
    // Get sectors from taxonomy with full details
    const sectors = context?.taxonomyData?.sectors || [];
    const sectorCodes = sectors.length > 0 
      ? sectors.map((s: any) => s.code)
      : ['MUNICIPAL_SERVICES', 'HOUSING', 'URBAN_PLANNING', 'ENVIRONMENT', 'TECHNOLOGY', 'INNOVATION'];
    
    // Build sector catalog for richer context
    const sectorCatalog = sectors.length > 0
      ? sectors.map((s: any) => `- ${s.code}: ${s.name_en} (${s.name_ar})`).join('\n')
      : `- MUNICIPAL_SERVICES: Municipal Services (الخدمات البلدية)
- HOUSING: Housing & Real Estate (الإسكان والعقارات)
- URBAN_PLANNING: Urban Planning (التخطيط الحضري)
- ENVIRONMENT: Environment & Sustainability (البيئة والاستدامة)
- TECHNOLOGY: Technology & Digital (التقنية والرقمنة)
- INNOVATION: Innovation & R&D (الابتكار والبحث والتطوير)`;

    const contextSummary = `
PLAN CONTEXT:
- Plan Name: ${wizardData.name_en || 'Strategic Plan'}
- Duration: ${wizardData.duration_years || 5} years (${wizardData.start_year || ''} - ${wizardData.end_year || ''})
- Vision: ${wizardData.vision_en || 'Not specified'}
- Mission: ${wizardData.mission_en || 'Not specified'}

STRATEGIC PILLARS:
${pillars.map((p: any, i: number) => `${i + 1}. ${p.title_en || p.name_en || p.title || ''}`).join('\n') || 'None defined'}

KEY STRENGTHS:
${(swot.strengths || []).slice(0, 3).map((s: any) => `- ${s.factor_en || s.description_en || s}`).join('\n') || 'Not analyzed'}

KEY OPPORTUNITIES:
${(swot.opportunities || []).slice(0, 3).map((o: any) => `- ${o.factor_en || o.description_en || o}`).join('\n') || 'Not analyzed'}

HIGH-PRIORITY RISKS:
${(risks || []).filter((r: any) => (r.risk_score || 0) >= 6).slice(0, 3).map((r: any) => `- ${r.title_en || r.title || ''}`).join('\n') || 'None identified'}

TARGET END YEAR: ${wizardData.end_year || new Date().getFullYear() + 5}`;

    const prompt = `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${COMPACT_SAUDI_CONTEXT}

${OBJECTIVE_CONTEXT}

Based on the following strategic plan context, generate 5-8 strategic objectives:

${contextSummary}

## AVAILABLE SECTORS (use ONLY these codes):
${sectorCatalog}

## SECTOR CODES FOR REFERENCE:
${sectorCodes.join(', ')}

## REQUIREMENTS:
1. Each objective MUST use a sector_code from the list above
2. Ensure balanced coverage across multiple sectors
3. Prioritize sectors most relevant to the plan's vision and pillars
4. Include at least one objective for HOUSING and MUNICIPAL_SERVICES sectors
5. If INNOVATION or TECHNOLOGY sectors exist, include at least one digital transformation objective

Generate objectives that:
1. Are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
2. Align with Vision 2030 and national priorities
3. Cover multiple sectors for balanced strategic coverage
4. Include innovation and digital transformation objectives
5. Address identified risks and leverage opportunities
6. Support the strategic pillars defined

For each objective provide:
- Bilingual name and description (English and Arabic)
- Appropriate sector code from the available list
- Priority level based on strategic importance
- Target year for completion`;
    console.log('[strategy-objective-generator] Generating objectives for:', wizardData.name_en || 'plan');

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
            name: 'generate_strategic_objectives',
            description: 'Generate strategic objectives for the plan',
            parameters: {
              type: 'object',
              properties: {
                objectives: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name_en: { type: 'string', description: 'Objective name in English (concise, action-oriented)' },
                      name_ar: { type: 'string', description: 'Objective name in Arabic' },
                      description_en: { type: 'string', description: 'Detailed description in English explaining the objective scope and expected outcomes' },
                      description_ar: { type: 'string', description: 'Detailed description in Arabic' },
                      sector_code: { type: 'string', description: 'Sector code this objective primarily belongs to' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Priority level' },
                      target_year: { type: 'number', description: 'Target completion year' }
                    },
                    required: ['name_en', 'name_ar', 'description_en', 'description_ar', 'sector_code', 'priority', 'target_year'],
                    additionalProperties: false
                  }
                }
              },
              required: ['objectives'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_strategic_objectives' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[strategy-objective-generator] AI error:', response.status, errorText);
      
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
    const endYear = wizardData.end_year || new Date().getFullYear() + 5;
    
    // Validate sector codes against allowed list
    const validateSectorCode = (code: string) => {
      if (sectorCodes.includes(code)) return code;
      // Try case-insensitive match
      const match = sectorCodes.find((s: string) => s.toLowerCase() === code?.toLowerCase());
      if (match) return match;
      // Default to first available sector
      return sectorCodes[0] || 'MUNICIPAL_SERVICES';
    };

    const result = {
      objectives: (generatedData.objectives || []).map((o: any, i: number) => ({
        id: `obj-${Date.now()}-${i}`,
        name_en: o.name_en || '',
        name_ar: o.name_ar || '',
        description_en: o.description_en || '',
        description_ar: o.description_ar || '',
        sector_code: validateSectorCode(o.sector_code),
        priority: o.priority || 'medium',
        target_year: o.target_year || endYear
      }))
    };

    console.log('[strategy-objective-generator] Generated', result.objectives.length, 'objectives');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[strategy-objective-generator] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

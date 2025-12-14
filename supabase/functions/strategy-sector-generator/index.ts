import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SAUDI_CONTEXT = `Operating within Saudi Arabia's Ministry of Municipal, Rural Affairs and Housing (MoMRAH):
- 13 Administrative Regions across the Kingdom
- Major Saudi Cities: Riyadh, Jeddah, Makkah, Madinah, Dammam, Khobar, Tabuk, Abha, Buraidah, Taif, Najran, Jazan
- Vision 2030 Programs: Quality of Life, Housing (Sakani - 70% ownership), National Transformation, Thriving Cities
- Key Sectors: Transportation, Environment, Urban Planning, Digital Services, Public Safety, Infrastructure, Housing, Smart City, Waste Management, Water Resources
- Stakeholders: Citizens, Municipalities, Private Sector, Academia, Startups, Government Partners`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sector_id, sector_name_en, sector_name_ar, strategic_plan_id, plan_vision, plan_objectives } = await req.json();

    console.log('Generating sector strategy for:', sector_name_en);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert Saudi Arabian municipal innovation strategist within the Ministry of Municipal, Rural Affairs and Housing (MoMRAH), specializing in sector-specific strategy development.

${SAUDI_CONTEXT}

Your role is to generate comprehensive sector strategies for Saudi municipalities that:
1. Align with Vision 2030 goals and MoMRAH's mandate
2. Consider Saudi cultural context and local needs
3. Support the Kingdom's transformation objectives
4. Leverage public-private partnerships
5. Enable smart city and digital transformation initiatives

You must generate:
1. A compelling sector-specific vision statement (in both English and formal Arabic)
2. 3-4 strategic objectives for the sector (with titles in both languages)
3. 4-5 Key Performance Indicators (KPIs) with realistic baselines and ambitious but achievable targets

Guidelines:
- Vision should be aspirational and aligned with Vision 2030
- Objectives should be SMART and culturally appropriate
- KPIs should have realistic baseline and target values for Saudi context
- Consider the sector's unique challenges and opportunities in Saudi Arabia
- Reference relevant national strategies and programs`;

    const userPrompt = `Generate a comprehensive sector strategy for the following:

Sector: ${sector_name_en} (${sector_name_ar})
Strategic Plan ID: ${strategic_plan_id}
${plan_vision ? `Overall Plan Vision: ${plan_vision}` : ''}
${plan_objectives ? `Plan Objectives: ${JSON.stringify(plan_objectives)}` : ''}

Generate a sector strategy with vision, objectives, and KPIs that align with the overall strategic direction.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_sector_strategy',
              description: 'Generate a comprehensive sector strategy with vision, objectives, and KPIs',
              parameters: {
                type: 'object',
                properties: {
                  vision_en: {
                    type: 'string',
                    description: 'Sector vision statement in English'
                  },
                  vision_ar: {
                    type: 'string',
                    description: 'Sector vision statement in Arabic'
                  },
                  objectives: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title_en: { type: 'string', description: 'Objective title in English' },
                        title_ar: { type: 'string', description: 'Objective title in Arabic' },
                        description: { type: 'string', description: 'Detailed description of the objective' },
                        target_value: { type: 'number', description: 'Target value to achieve' },
                        current_value: { type: 'number', description: 'Current baseline value' },
                        unit: { type: 'string', description: 'Unit of measurement (%, count, etc.)' }
                      },
                      required: ['title_en', 'title_ar', 'description', 'target_value', 'current_value', 'unit']
                    },
                    description: 'List of 2-3 strategic objectives'
                  },
                  kpis: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name_en: { type: 'string', description: 'KPI name in English' },
                        name_ar: { type: 'string', description: 'KPI name in Arabic' },
                        baseline: { type: 'number', description: 'Baseline value' },
                        target: { type: 'number', description: 'Target value' },
                        current: { type: 'number', description: 'Current value' },
                        unit: { type: 'string', description: 'Unit of measurement' },
                        frequency: { type: 'string', enum: ['monthly', 'quarterly', 'annually'], description: 'Measurement frequency' }
                      },
                      required: ['name_en', 'name_ar', 'baseline', 'target', 'current', 'unit', 'frequency']
                    },
                    description: 'List of 3-4 KPIs'
                  }
                },
                required: ['vision_en', 'vision_ar', 'objectives', 'kpis']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_sector_strategy' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', JSON.stringify(data).slice(0, 500));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_sector_strategy') {
      throw new Error('Invalid response from AI');
    }

    const sectorStrategy = JSON.parse(toolCall.function.arguments);

    // Add IDs to objectives and KPIs
    const now = Date.now();
    sectorStrategy.objectives = sectorStrategy.objectives.map((obj: any, index: number) => ({
      ...obj,
      id: `obj-${now}-${index + 1}`
    }));
    sectorStrategy.kpis = sectorStrategy.kpis.map((kpi: any, index: number) => ({
      ...kpi,
      id: `kpi-${now}-${index + 1}`
    }));

    console.log('Generated sector strategy:', sectorStrategy);

    return new Response(JSON.stringify({ 
      success: true, 
      sector_strategy: sectorStrategy 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in strategy-sector-generator:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

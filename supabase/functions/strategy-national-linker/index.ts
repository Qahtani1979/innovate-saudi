import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { COMPACT_SAUDI_CONTEXT } from "../_shared/saudiContext.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objectives, strategic_plan_context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating national strategy alignments for objectives:', objectives?.length);

    const systemPrompt = `You are an expert in Saudi Arabian national strategies, Vision 2030, and the Ministry of Municipalities and Housing (MoMAH) mandate.

${COMPACT_SAUDI_CONTEXT}

Your task is to analyze strategic objectives and suggest precise alignments with:

1. **Vision 2030 Goals**:
   - V1: Vibrant Society (culture, entertainment, sports, heritage, quality of life)
   - V2: Thriving Economy (SMEs, employment, investment, tourism, privatization)
   - V3: Ambitious Nation (government effectiveness, fiscal sustainability, strategic partnerships)

2. **Vision 2030 Realization Programs**:
   - Quality of Life Program (QoL)
   - Housing Program (Sakani, 70% ownership target)
   - National Transformation Program (NTP)
   - Fiscal Balance Program
   - Public Investment Fund (PIF) initiatives

3. **UN Sustainable Development Goals (SDGs)**:
   - SDG 9: Industry, Innovation & Infrastructure
   - SDG 11: Sustainable Cities and Communities
   - SDG 12: Responsible Consumption and Production
   - SDG 13: Climate Action
   - SDG 17: Partnerships for the Goals

4. **MoMAH National Innovation Priorities**:
   - NIS-1: Digital Government & E-Services (Baladi platform)
   - NIS-2: Smart Cities & Urban Innovation
   - NIS-3: Innovation Ecosystem & Startups
   - NIS-4: Public Service Excellence & Citizen Satisfaction
   - NIS-5: R&D Investment & University Partnerships
   - NIS-6: Sustainable Infrastructure & Green Building

Return precise alignments based on the objective's content and strategic intent within the Saudi municipal context.`;

    const userPrompt = `Analyze these strategic objectives and suggest national strategy alignments:

Objectives:
${objectives?.map((obj: any, i: number) => `${i + 1}. ${obj.title_en || obj.objective_title}`).join('\n')}

Strategic Plan Context: ${strategic_plan_context || 'Municipal Innovation Strategy'}

For each objective, identify the most relevant alignments with Vision 2030 goals, SDGs, and national priorities.`;

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
              name: 'suggest_alignments',
              description: 'Suggest national strategy alignments for each objective',
              parameters: {
                type: 'object',
                properties: {
                  alignments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        objective_index: { type: 'number', description: '0-based index of the objective' },
                        vision_2030: { 
                          type: 'array', 
                          items: { type: 'string', enum: ['v2030-1', 'v2030-2', 'v2030-3'] },
                          description: 'Vision 2030 goal IDs'
                        },
                        sdg: { 
                          type: 'array', 
                          items: { type: 'string', enum: ['sdg-9', 'sdg-11', 'sdg-13', 'sdg-17'] },
                          description: 'SDG goal IDs'
                        },
                        national_priorities: { 
                          type: 'array', 
                          items: { type: 'string', enum: ['np-1', 'np-2', 'np-3', 'np-4', 'np-5'] },
                          description: 'National priority IDs'
                        },
                        rationale: { type: 'string', description: 'Brief explanation of alignment' }
                      },
                      required: ['objective_index', 'vision_2030', 'sdg', 'national_priorities']
                    }
                  }
                },
                required: ['alignments']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_alignments' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Alignments generated:', result.alignments?.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in strategy-national-linker:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
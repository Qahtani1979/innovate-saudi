import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SAUDI_CONTEXT = `Operating within Saudi Arabia's Ministry of Municipalities and Housing (MoMAH):
- 13 Regions: Riyadh, Makkah, Madinah, Eastern Province, Asir, Tabuk, Hail, Northern Borders, Jazan, Najran, Al-Baha, Al-Jouf, Qassim
- Major Cities: Riyadh, Jeddah, Makkah Al-Mukarramah, Madinah Al-Munawwarah, Dammam, Khobar, Tabuk, Abha, Buraidah, Taif
- 285+ municipalities and 17 Amanats
- Vision 2030: Quality of Life Program, Housing Program (70% ownership), National Transformation, Smart Cities
- Focus: Municipal services, urban planning, housing (Sakani), infrastructure, environment, citizen services, innovation
- INNOVATION PRIORITY: AI/ML, IoT, Blockchain, Digital Twins, Drones, 5G/6G, Autonomous Systems, Robotics
- Emerging Tech: GovTech, PropTech, CleanTech, Smart City platforms, predictive analytics
- R&D Ecosystem: Innovation labs, PoC programs, KAUST/KACST partnerships, startup collaboration`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objectives, strategic_plan, start_year, end_year } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating timeline milestones for objectives:', objectives?.length);

    const systemPrompt = `You are an expert INNOVATION strategist specializing in Saudi Arabian municipal TECHNOLOGY transformation and government innovation projects within the Ministry of Municipalities and Housing (MoMAH).

${SAUDI_CONTEXT}

Your task is to generate realistic implementation timelines with milestones for strategic objectives with INNOVATION & EMERGING TECHNOLOGY focus. Consider:
1. Saudi government project timelines and procurement processes
2. Fiscal year alignment (Saudi fiscal year)
3. Logical sequencing and dependencies between milestones
4. Key deliverables including TECHNOLOGY POCs, PILOTS, and DIGITAL SOLUTIONS
5. Resource requirements considering local capacity and TECH PARTNERSHIPS
6. Risk factors, buffer time, and Ramadan/Hajj considerations
7. **Innovation lifecycle phases**: Ideation → PoC → Pilot → Scale → Citywide deployment
8. **Technology adoption milestones**: Vendor selection, integration, testing, training, go-live
9. **R&D partnerships**: University collaboration, startup engagement, tech scouting activities

Generate milestones that are SMART (Specific, Measurable, Achievable, Relevant, Time-bound), INNOVATION-FOCUSED, and aligned with MoMAH priorities and emerging technology adoption.`;

    const userPrompt = `Generate a strategic implementation timeline for these objectives:

Strategic Plan: ${strategic_plan?.title_en || 'Municipal Innovation Strategy'}
Vision: ${strategic_plan?.vision_en || 'Transform municipal services through innovation'}
Timeline: ${start_year || 2024} to ${end_year || 2025}

Objectives:
${objectives?.map((obj: any, i: number) => `${i + 1}. ${obj.title_en || obj.objective_title}`).join('\n')}

For each objective, generate 2-3 key milestones with realistic dates, dependencies, deliverables, and resource requirements.`;

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
              name: 'generate_milestones',
              description: 'Generate timeline milestones for strategic objectives',
              parameters: {
                type: 'object',
                properties: {
                  milestones: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        objective_index: { type: 'number', description: '0-based index of the related objective' },
                        title_en: { type: 'string', description: 'Milestone title in English' },
                        title_ar: { type: 'string', description: 'Milestone title in Arabic' },
                        start_date: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
                        end_date: { type: 'string', description: 'End date in YYYY-MM-DD format' },
                        deliverables: { 
                          type: 'array', 
                          items: { type: 'string' },
                          description: 'Key deliverables for this milestone'
                        },
                        resources_required: { 
                          type: 'array', 
                          items: { type: 'string' },
                          description: 'Resources needed (team roles, tools, budget items)'
                        },
                        dependency_index: { 
                          type: 'number', 
                          description: 'Index of milestone this depends on (-1 if none)' 
                        },
                        priority: { 
                          type: 'string', 
                          enum: ['high', 'medium', 'low'],
                          description: 'Priority level'
                        }
                      },
                      required: ['objective_index', 'title_en', 'title_ar', 'start_date', 'end_date', 'deliverables']
                    }
                  }
                },
                required: ['milestones']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_milestones' } }
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
    
    // Add IDs and default status to milestones
    const milestonesWithIds = result.milestones.map((m: any, index: number) => ({
      ...m,
      id: `milestone-ai-${Date.now()}-${index}`,
      status: 'planned',
      progress_percentage: 0,
      dependencies: m.dependency_index >= 0 ? [`milestone-ai-${Date.now()}-${m.dependency_index}`] : [],
      resources_required: m.resources_required || [],
      owner: ''
    }));

    console.log('Milestones generated:', milestonesWithIds.length);

    return new Response(JSON.stringify({ milestones: milestonesWithIds }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in strategy-timeline-generator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
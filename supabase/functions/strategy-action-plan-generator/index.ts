import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SAUDI_CONTEXT = `Operating within Saudi Arabia's Ministry of Municipal, Rural Affairs and Housing (MoMRAH):
- 13 Regions, 285+ municipalities across the Kingdom
- Major cities: Riyadh, Jeddah, Makkah, Madinah, Dammam, Eastern Province cities
- Vision 2030: Quality of Life, Housing (Sakani), National Transformation, Smart Cities
- Currency: Saudi Riyal (SAR)
- Stakeholders: Citizens, Amanats, Municipalities, Private Sector, Academia, Startups`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action_plan_id, objective_title, objective_description, strategic_plan_id, plan_context } = await req.json();

    console.log('Generating action items for objective:', objective_title);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert project manager and strategic planner within Saudi Arabia's Ministry of Municipal, Rural Affairs and Housing (MoMRAH), specializing in municipal innovation initiatives.

${SAUDI_CONTEXT}

Your role is to generate detailed, actionable action items that will help achieve strategic objectives aligned with Vision 2030 and MoMRAH's mandate.

For each action item, you must provide:
1. Clear, action-oriented title (in both English and formal Arabic)
2. Detailed description of what needs to be done
3. Realistic budget estimate (in SAR - Saudi Riyals)
4. Suggested status (always 'pending' for new items)
5. List of key deliverables
6. Timeline consideration (accounting for Saudi fiscal year, Ramadan, Hajj seasons)

Guidelines:
- Actions should be specific and measurable
- Budget estimates should be realistic for Saudi municipal context (government contracting rates)
- Deliverables should be tangible outputs aligned with government documentation standards
- Consider dependencies between actions and government approval processes
- Include both quick wins and longer-term initiatives
- Ensure actions cover planning, stakeholder engagement, implementation, and monitoring phases
- Align with Baladi platform and e-government initiatives where applicable`;

    const userPrompt = `Generate 4-5 detailed action items for the following objective:

Objective: ${objective_title}
${objective_description ? `Description: ${objective_description}` : ''}
Strategic Plan ID: ${strategic_plan_id}
${plan_context ? `Context: ${plan_context}` : ''}

Generate comprehensive action items that will help achieve this objective, including stakeholder analysis, implementation framework, pilot programs, and scaling activities.`;

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
              name: 'generate_action_items',
              description: 'Generate detailed action items for a strategic objective',
              parameters: {
                type: 'object',
                properties: {
                  actions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title_en: { type: 'string', description: 'Action title in English' },
                        title_ar: { type: 'string', description: 'Action title in Arabic' },
                        description: { type: 'string', description: 'Detailed description of the action' },
                        budget: { type: 'number', description: 'Budget estimate in SAR' },
                        deliverables: { 
                          type: 'array', 
                          items: { type: 'string' },
                          description: 'List of tangible deliverables'
                        },
                        priority: { 
                          type: 'string', 
                          enum: ['high', 'medium', 'low'],
                          description: 'Priority level'
                        },
                        estimated_duration_weeks: {
                          type: 'number',
                          description: 'Estimated duration in weeks'
                        }
                      },
                      required: ['title_en', 'title_ar', 'description', 'budget', 'deliverables', 'priority', 'estimated_duration_weeks']
                    },
                    description: 'List of 4-5 action items'
                  },
                  total_budget: {
                    type: 'number',
                    description: 'Total budget for all actions'
                  }
                },
                required: ['actions', 'total_budget']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_action_items' } }
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
    if (!toolCall || toolCall.function.name !== 'generate_action_items') {
      throw new Error('Invalid response from AI');
    }

    const actionPlan = JSON.parse(toolCall.function.arguments);

    // Add IDs and default values to actions
    const now = Date.now();
    actionPlan.actions = actionPlan.actions.map((action: any, index: number) => ({
      ...action,
      id: `action-${now}-${index + 1}`,
      owner: '',
      start_date: '',
      end_date: '',
      status: 'pending',
      progress: 0
    }));

    console.log('Generated action plan:', actionPlan);

    return new Response(JSON.stringify({ 
      success: true, 
      action_plan: actionPlan 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in strategy-action-plan-generator:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

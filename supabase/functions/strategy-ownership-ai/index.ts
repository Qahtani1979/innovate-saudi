import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objectives, available_users, strategic_plan_context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating RACI assignments for objectives:', objectives?.length);
    console.log('Available users:', available_users?.length);

    const systemPrompt = `You are an expert in organizational management and RACI matrix design for government and municipal innovation projects.

RACI stands for:
- Responsible (R): The person who does the work to complete the task
- Accountable (A): The person ultimately answerable for the task's completion (only one per task)
- Consulted (C): People whose opinions are sought; two-way communication
- Informed (I): People kept up-to-date on progress; one-way communication

Your task is to analyze strategic objectives and suggest optimal RACI assignments based on:
1. The nature of each objective (technical, strategic, operational, etc.)
2. Available team members and their roles
3. Best practices for innovation project governance
4. Avoiding conflicts of interest (same person shouldn't be R and A ideally)`;

    const userPrompt = `Suggest RACI assignments for these strategic objectives:

Context: ${strategic_plan_context || 'Municipal Innovation Strategy'}

Objectives:
${objectives?.map((obj: any, i: number) => `${i + 1}. ${obj.title_en || obj.objective_title}`).join('\n')}

Available Team Members:
${available_users?.map((u: any) => `- ${u.name} (${u.role}) - ${u.email}`).join('\n')}

For each objective, suggest the most appropriate person for each RACI role based on their job title and the objective's requirements.`;

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
              name: 'suggest_raci_assignments',
              description: 'Suggest RACI matrix assignments for each objective',
              parameters: {
                type: 'object',
                properties: {
                  assignments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        objective_index: { type: 'number', description: '0-based index of the objective' },
                        responsible: { type: 'string', description: 'Email of the Responsible person' },
                        accountable: { type: 'string', description: 'Email of the Accountable person' },
                        consulted: { 
                          type: 'array', 
                          items: { type: 'string' },
                          description: 'Emails of Consulted people'
                        },
                        informed: { 
                          type: 'array', 
                          items: { type: 'string' },
                          description: 'Emails of Informed people'
                        },
                        rationale: { type: 'string', description: 'Brief explanation of assignment logic' }
                      },
                      required: ['objective_index', 'responsible', 'accountable', 'consulted', 'informed']
                    }
                  }
                },
                required: ['assignments']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_raci_assignments' } }
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
    console.log('RACI assignments generated:', result.assignments?.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in strategy-ownership-ai:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

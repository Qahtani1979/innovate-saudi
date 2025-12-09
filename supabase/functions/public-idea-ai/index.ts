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
    const { idea, municipality } = await req.json();

    if (!idea || idea.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: 'Idea description must be at least 20 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are a municipal innovation analyst helping citizens submit ideas for city improvement.

Analyze this citizen's idea and generate a structured submission:

CITIZEN'S IDEA:
${idea}

${municipality ? `MUNICIPALITY: ${municipality}` : ''}

Generate the following in BOTH English and Arabic:

1. title_en: A clear, concise title for the idea (max 100 characters)
2. title_ar: Arabic translation of the title
3. description_en: A well-structured description (150-250 words) that:
   - Clearly explains what the idea is
   - Describes the problem it solves
   - Explains the expected benefits
   - Keeps the language professional but accessible
4. description_ar: Arabic translation of the description
5. category: Best matching category from: transport, infrastructure, environment, digital_services, parks, waste, safety, health, education, other
6. tags: 5-8 relevant keywords/tags for searchability
7. impact_score: Estimated impact score (0-100) based on potential benefit to citizens
8. feasibility_score: Estimated feasibility score (0-100) based on implementation complexity
9. ai_summary: A brief 1-2 sentence summary of the AI's assessment of this idea

Be encouraging and constructive. Focus on the positive potential while being realistic about feasibility.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful municipal innovation analyst. Always respond with valid JSON only, no markdown or code blocks.' 
          },
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_idea",
              description: "Analyze and structure a citizen's idea submission",
              parameters: {
                type: "object",
                properties: {
                  title_en: { type: "string", description: "English title for the idea" },
                  title_ar: { type: "string", description: "Arabic title for the idea" },
                  description_en: { type: "string", description: "English description of the idea" },
                  description_ar: { type: "string", description: "Arabic description of the idea" },
                  category: { 
                    type: "string", 
                    enum: ["transport", "infrastructure", "environment", "digital_services", "parks", "waste", "safety", "health", "education", "other"]
                  },
                  tags: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Relevant keywords/tags"
                  },
                  impact_score: { type: "number", description: "Impact score 0-100" },
                  feasibility_score: { type: "number", description: "Feasibility score 0-100" },
                  ai_summary: { type: "string", description: "Brief AI assessment summary" }
                },
                required: ["title_en", "title_ar", "description_en", "description_ar", "category", "tags", "impact_score", "feasibility_score", "ai_summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_idea" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    
    // Extract the tool call result
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'analyze_idea') {
      throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in public-idea-ai function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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
    const { context, language, stepNumber, stepName, itemsCount } = await req.json();
    
    console.log(`Analyzing step ${stepNumber}: ${stepName} with ${itemsCount} items`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build a focused prompt based on step
    const stepPrompts: Record<number, string> = {
      11: `Analyze the KPIs and metrics for this strategic plan. Evaluate:
- SMART compliance (Specific, Measurable, Achievable, Relevant, Time-bound)
- Coverage of all objectives
- Balance between leading and lagging indicators
- Data collection feasibility
- Target setting realism`,
      
      12: `Analyze the Action Plans and initiatives. Evaluate:
- Coverage of all strategic objectives
- Resource allocation balance
- Timeline feasibility
- Dependencies and sequencing
- Risk mitigation integration
- Innovation potential`,
      
      14: `Analyze the Timeline and implementation phases. Evaluate:
- Phase sequencing logic
- Milestone distribution
- Resource loading balance
- Critical path identification
- Buffer time adequacy
- Dependency management`,
      
      16: `Analyze the Communication Plan. Evaluate:
- Stakeholder coverage
- Channel appropriateness
- Message consistency
- Frequency adequacy
- Feedback mechanisms
- Crisis communication readiness`,
      
      17: `Analyze the Change Management approach. Evaluate:
- Stakeholder impact assessment
- Training adequacy
- Resistance mitigation
- Success metrics for change
- Leadership alignment
- Sustainability measures`
    };

    const stepPrompt = stepPrompts[stepNumber] || `Analyze this step of the strategic plan and provide assessment.`;

    const systemPrompt = `You are a strategic planning expert analyzing ${stepName} for a Saudi Arabian government strategic plan.
Provide analysis in ${language === 'ar' ? 'Arabic' : 'English'}.
Be specific, actionable, and aligned with Saudi Vision 2030 goals.
Focus on practical improvements and gaps.`;

    const userPrompt = `${stepPrompt}

STRATEGIC CONTEXT:
${JSON.stringify(context, null, 2)}

Provide a comprehensive analysis in JSON format:
{
  "overallScore": <0-100 score>,
  "summary": "<2-3 sentence overall assessment>",
  "scores": {
    "completeness": <0-100>,
    "quality": <0-100>,
    "alignment": <0-100>,
    "feasibility": <0-100>
  },
  "gaps": [
    {
      "title": "<gap title>",
      "description": "<detailed description>",
      "priority": "critical|high|medium|low",
      "impact": "<impact if not addressed>"
    }
  ],
  "recommendations": [
    {
      "title": "<recommendation title>",
      "description": "<what to do and why>",
      "action": "<specific next step>",
      "priority": "critical|high|medium|low"
    }
  ],
  "alignment": {
    "objectives": {
      "score": <0-100>,
      "notes": "<how well items align with objectives>"
    },
    "vision": {
      "score": <0-100>,
      "notes": "<alignment with vision and mission>"
    },
    "risks": {
      "score": <0-100>,
      "notes": "<how well risks are addressed>"
    }
  }
}`;

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
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content);
      // Return a default structure
      analysis = {
        overallScore: 60,
        summary: content.substring(0, 200),
        scores: { completeness: 60, quality: 60, alignment: 60, feasibility: 60 },
        gaps: [],
        recommendations: [{ title: 'Review needed', description: content.substring(0, 300), priority: 'medium' }],
        alignment: {}
      };
    }

    console.log('Analysis complete for step', stepNumber);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in analyze-step:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

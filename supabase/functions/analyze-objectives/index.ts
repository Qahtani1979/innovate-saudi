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
    const { context, language, objectivesCount, sectorsCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isArabic = language === 'ar';

    // Build comprehensive prompt with all context
    const systemPrompt = isArabic 
      ? `أنت خبير في التخطيط الاستراتيجي متخصص في تحليل الأهداف الاستراتيجية. قم بتحليل الأهداف المقدمة في سياق جميع معلومات التخطيط الاستراتيجي من الخطوات 1-8. قدم تحليلاً شاملاً مع توصيات قابلة للتنفيذ. الرد يجب أن يكون بالعربية.`
      : `You are a strategic planning expert specialized in analyzing strategic objectives. Analyze the provided objectives in the context of all strategic planning information from Steps 1-8. Provide a comprehensive analysis with actionable recommendations. Respond in English.`;

    const analysisPrompt = `
Analyze the following strategic objectives with full context from the strategic planning process.

## PLAN CONTEXT (Step 1)
- Plan Name: ${context.planContext?.name || 'Not specified'}
- Description: ${context.planContext?.description || 'Not specified'}
- Timeline: ${context.planContext?.startYear || '?'} - ${context.planContext?.endYear || '?'}
- Entity Type: ${context.planContext?.entityType || 'Not specified'}
- Scope: ${context.planContext?.scope || 'Not specified'}

## VISION & MISSION (Step 2)
- Vision (EN): ${context.vision?.vision_en || 'Not specified'}
- Vision (AR): ${context.vision?.vision_ar || 'Not specified'}
- Mission (EN): ${context.vision?.mission_en || 'Not specified'}
- Mission (AR): ${context.vision?.mission_ar || 'Not specified'}
- Core Values: ${JSON.stringify(context.vision?.coreValues || [])}
- Strategic Pillars: ${JSON.stringify(context.vision?.pillars || [])}

## STAKEHOLDERS (Step 3)
${JSON.stringify(context.stakeholders || [], null, 2)}

## PESTEL ANALYSIS (Step 4)
${JSON.stringify(context.pestel || {}, null, 2)}

## SWOT ANALYSIS (Step 5)
${JSON.stringify(context.swot || {}, null, 2)}

## SCENARIOS (Step 6)
${JSON.stringify(context.scenarios || {}, null, 2)}

## RISKS (Step 7)
${JSON.stringify(context.risks || [], null, 2)}

## DEPENDENCIES & CONSTRAINTS (Step 8)
- Dependencies: ${JSON.stringify(context.dependencies || [])}
- Constraints: ${JSON.stringify(context.constraints || [])}
- Assumptions: ${JSON.stringify(context.assumptions || [])}

## CURRENT OBJECTIVES (Step 9 - TO ANALYZE)
${JSON.stringify(context.objectives || [], null, 2)}

## AVAILABLE SECTORS
${JSON.stringify(context.availableSectors || [], null, 2)}

## STRATEGIC THEMES
${JSON.stringify(context.strategicThemes || [], null, 2)}

---

Provide a comprehensive analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "summary": "<brief summary of the objectives quality and completeness>",
  "scores": {
    "completeness": <number 0-100>,
    "alignment": <number 0-100>,
    "measurability": <number 0-100>,
    "sector_coverage": <number 0-100>
  },
  "gaps": [
    {
      "title": "<gap title>",
      "description": "<detailed description>",
      "priority": "critical|high|medium|low",
      "impact": "<potential impact if not addressed>"
    }
  ],
  "recommendations": [
    {
      "title": "<recommendation title>",
      "description": "<detailed description>",
      "action": "<specific action to take>",
      "autoApply": false
    }
  ],
  "alignment": {
    "visionAlignment": {
      "score": <number 0-100>,
      "notes": "<how well objectives align with vision/mission>"
    },
    "swotAlignment": {
      "score": <number 0-100>,
      "notes": "<how objectives address SWOT findings>"
    },
    "riskMitigation": {
      "score": <number 0-100>,
      "notes": "<how objectives help mitigate identified risks>"
    }
  },
  "sectorAnalysis": [
    {
      "name": "<sector name>",
      "code": "<sector code>",
      "objectivesCount": <number>,
      "suggestion": "<improvement suggestion if needed>"
    }
  ]
}

Analyze thoroughly considering:
1. Do objectives align with the vision and mission?
2. Do objectives address key SWOT findings (leverage strengths, address weaknesses, capture opportunities, mitigate threats)?
3. Do objectives help mitigate identified risks?
4. Are all relevant sectors covered?
5. Are objectives SMART (Specific, Measurable, Achievable, Relevant, Time-bound)?
6. Do objectives consider stakeholder expectations?
7. Are objectives realistic given dependencies and constraints?
8. Is there good balance between priorities?
9. Are objectives bilingual and complete?

Provide actionable, specific recommendations.
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Parse JSON from response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a basic analysis structure if parsing fails
      analysis = {
        overallScore: 50,
        summary: content.substring(0, 500),
        scores: { completeness: 50, alignment: 50, measurability: 50, sector_coverage: 50 },
        gaps: [],
        recommendations: [{ 
          title: isArabic ? "مراجعة الأهداف" : "Review Objectives",
          description: content.substring(0, 300),
          action: isArabic ? "راجع التحليل أعلاه" : "Review the analysis above",
          autoApply: false
        }],
        alignment: {
          visionAlignment: { score: 50, notes: "" },
          swotAlignment: { score: 50, notes: "" },
          riskMitigation: { score: 50, notes: "" }
        },
        sectorAnalysis: []
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-objectives:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  SAUDI_MOMAH_CONTEXT, 
  COMPACT_SAUDI_CONTEXT,
  HOUSING_CONTEXT,
  INNOVATION_EMPHASIS,
  HOUSING_ECOSYSTEM_CONTEXT,
  MOMAH_HOUSING_SOLUTIONS_CONTEXT
} from "../_shared/saudiContext.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, language = 'en', taxonomy } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build taxonomy context
    const taxonomyContext = taxonomy ? `
### Available Taxonomy Data:
- Strategic Themes: ${taxonomy.strategicThemes?.map((t: any) => t.name_en).join(', ') || 'Quality of Life, Smart Cities, Sustainability, Innovation, Digital Transformation'}
- Vision 2030 Programs: ${taxonomy.visionPrograms?.map((p: any) => p.name_en).join(', ') || 'Quality of Life, Housing, National Transformation'}
- Sectors: ${taxonomy.sectors?.map((s: any) => s.name_en).join(', ') || 'Municipal Services, Housing, Urban Planning, Infrastructure'}
- Technologies: ${taxonomy.technologies?.map((t: any) => t.name_en).join(', ') || 'AI/ML, IoT, Digital Twins, Smart Cities'}
` : '';

    const systemPrompt = `You are an expert strategic planning consultant specializing in Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You help define core values and strategic pillars that align with Vision 2030, housing mandates, and municipal excellence.

${COMPACT_SAUDI_CONTEXT}

${HOUSING_CONTEXT}

${INNOVATION_EMPHASIS}

${taxonomyContext}

### YOUR TASK:
Generate core values and strategic pillars based on the provided strategic plan context. These should:
1. Reflect MoMAH's mandate for municipal excellence and housing transformation
2. Align with Vision 2030 goals and Saudi cultural values
3. Support innovation, digital transformation, and citizen-centricity
4. Be specific enough to guide decision-making yet broad enough to encompass strategic objectives

### OUTPUT REQUIREMENTS:
- Generate 4-6 core values with bilingual names and descriptions
- Generate 4-6 strategic pillars that organize the plan's focus areas
- Each value/pillar must have English and Arabic versions
- Values should be actionable principles, not generic statements
- Pillars should be thematic groupings for objectives

CRITICAL: Respond ONLY with valid JSON, no markdown or explanation.`;

    const userPrompt = `Generate core values and strategic pillars for this strategic plan:

PLAN NAME: ${context.name_en || 'Strategic Plan'}
PLAN NAME (AR): ${context.name_ar || ''}
DESCRIPTION: ${context.description_en || ''}
VISION: ${context.vision_en || ''}
MISSION: ${context.mission_en || ''}
SECTOR FOCUS: ${context.sector || 'General Municipal Services'}
ENTITY TYPE: ${context.entity_type || 'Municipality'}
INNOVATION FOCUS: ${context.innovation_focus || 'Smart City Technologies'}

${context.existing_values?.length ? `EXISTING VALUES TO CONSIDER: ${JSON.stringify(context.existing_values)}` : ''}
${context.existing_pillars?.length ? `EXISTING PILLARS TO CONSIDER: ${JSON.stringify(context.existing_pillars)}` : ''}

Generate JSON with this exact structure:
{
  "core_values": [
    {
      "id": "unique_id",
      "name_en": "Value Name in English",
      "name_ar": "اسم القيمة بالعربية",
      "description_en": "Description explaining this value and how it guides behavior",
      "description_ar": "وصف يشرح هذه القيمة وكيف توجه السلوك"
    }
  ],
  "strategic_pillars": [
    {
      "id": "unique_id",
      "name_en": "Pillar Name in English",
      "name_ar": "اسم الركيزة بالعربية",
      "description_en": "Description of what this pillar encompasses",
      "description_ar": "وصف ما تشمله هذه الركيزة",
      "icon": "Target"
    }
  ],
  "values_rationale": "Brief explanation of why these values were selected",
  "pillars_rationale": "Brief explanation of how these pillars support the vision"
}`;

    console.log('Calling Lovable AI for vision/values generation...');

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let result;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid JSON response from AI");
    }

    // Ensure IDs are present
    if (result.core_values) {
      result.core_values = result.core_values.map((v: any, i: number) => ({
        ...v,
        id: v.id || `value_${Date.now()}_${i}`
      }));
    }
    if (result.strategic_pillars) {
      result.strategic_pillars = result.strategic_pillars.map((p: any, i: number) => ({
        ...p,
        id: p.id || `pillar_${Date.now()}_${i}`,
        icon: p.icon || 'Target'
      }));
    }

    console.log('Successfully generated core values and strategic pillars');

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in strategy-vision-generator:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  COMPACT_SAUDI_CONTEXT, 
  HOUSING_CONTEXT, 
  INNOVATION_EMPHASIS,
  MUNICIPAL_OPERATIONS_CONTEXT,
  AMANAT_GOVERNANCE_CONTEXT
} from "../_shared/saudiContext.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      context, 
      language = 'en',
      taxonomy_data = {}
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build taxonomy context string
    const taxonomyContext = buildTaxonomyContext(taxonomy_data, language);

    const systemPrompt = `You are a senior strategic planning expert specializing in Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${COMPACT_SAUDI_CONTEXT}

${HOUSING_CONTEXT}

${INNOVATION_EMPHASIS}

## GOVERNANCE STRUCTURE
${AMANAT_GOVERNANCE_CONTEXT.substring(0, 1500)}

## AVAILABLE TAXONOMY DATA
${taxonomyContext}

YOUR TASK: Generate strategic context elements (vision, mission, themes) based on the user's input, aligned with Saudi Vision 2030, MoMAH mandates, and innovation priorities.

OUTPUT LANGUAGE: ${language === 'ar' ? 'Arabic (primary) with English translations' : 'English (primary) with Arabic translations'}`;

    const userPrompt = buildUserPrompt(context, language);

    console.log("[strategy-context-generator] Generating context for:", context.planName);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_strategic_context",
            description: "Generate vision, mission, themes, and strategic context for a MoMAH strategic plan",
            parameters: {
              type: "object",
              properties: {
                vision_en: {
                  type: "string",
                  description: "Aspirational vision statement in English (2-3 sentences)"
                },
                vision_ar: {
                  type: "string",
                  description: "Vision statement in Arabic"
                },
                mission_en: {
                  type: "string",
                  description: "Mission statement in English describing how the vision will be achieved"
                },
                mission_ar: {
                  type: "string",
                  description: "Mission statement in Arabic"
                },
                suggested_themes: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 strategic theme codes from taxonomy (e.g., DIGITAL_TRANSFORMATION, HOUSING_ACCESS)"
                },
                suggested_technologies: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 technology codes from taxonomy (e.g., AI_ML, IOT, DIGITAL_TWIN)"
                },
                suggested_vision_programs: {
                  type: "array",
                  items: { type: "string" },
                  description: "2-4 Vision 2030 program codes (e.g., QUALITY_OF_LIFE, HOUSING_PROGRAM)"
                },
                key_challenges_en: {
                  type: "string",
                  description: "Summary of key challenges based on sectors and context (English)"
                },
                key_challenges_ar: {
                  type: "string",
                  description: "Key challenges summary in Arabic"
                },
                core_values: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name_en: { type: "string" },
                      name_ar: { type: "string" },
                      description_en: { type: "string" }
                    },
                    required: ["name_en", "name_ar"]
                  },
                  description: "3-5 core organizational values aligned with MoMAH"
                },
                innovation_focus: {
                  type: "string",
                  description: "Brief innovation and R&D focus statement (English)"
                },
                strategic_rationale: {
                  type: "string",
                  description: "Brief rationale for the suggested strategic direction (English)"
                }
              },
              required: ["vision_en", "vision_ar", "mission_en", "mission_ar", "suggested_themes"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_strategic_context" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[strategy-context-generator] API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract tool call result
    let result = null;
    if (data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      try {
        result = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      } catch (e) {
        console.error("[strategy-context-generator] Failed to parse tool response:", e);
      }
    }

    // Fallback if tool call didn't work
    if (!result) {
      result = generateFallbackContext(context, language);
    }

    console.log("[strategy-context-generator] Generated context successfully");

    return new Response(JSON.stringify({
      success: true,
      data: result,
      model: "gemini-2.5-flash"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[strategy-context-generator] Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      data: generateFallbackContext({}, 'en')
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

function buildTaxonomyContext(taxonomy: any, language: string): string {
  const lines: string[] = [];
  
  if (taxonomy.sectors?.length) {
    const sectorNames = taxonomy.sectors
      .slice(0, 15)
      .map((s: any) => language === 'ar' ? s.name_ar : s.name_en)
      .join(', ');
    lines.push(`SECTORS: ${sectorNames}`);
  }
  
  if (taxonomy.strategicThemes?.length) {
    const themeInfo = taxonomy.strategicThemes
      .slice(0, 10)
      .map((t: any) => `${t.code}: ${language === 'ar' ? t.name_ar : t.name_en}`)
      .join('; ');
    lines.push(`THEMES: ${themeInfo}`);
  }
  
  if (taxonomy.technologies?.length) {
    const techInfo = taxonomy.technologies
      .slice(0, 12)
      .map((t: any) => `${t.code}: ${language === 'ar' ? t.name_ar : t.name_en}`)
      .join('; ');
    lines.push(`TECHNOLOGIES: ${techInfo}`);
  }
  
  if (taxonomy.visionPrograms?.length) {
    const progInfo = taxonomy.visionPrograms
      .slice(0, 8)
      .map((p: any) => `${p.code}: ${language === 'ar' ? p.name_ar : p.name_en}`)
      .join('; ');
    lines.push(`VISION 2030 PROGRAMS: ${progInfo}`);
  }
  
  if (taxonomy.regions?.length) {
    const regionNames = taxonomy.regions
      .filter((r: any) => r.code !== 'NATIONAL')
      .slice(0, 13)
      .map((r: any) => language === 'ar' ? r.name_ar : r.name_en)
      .join(', ');
    lines.push(`REGIONS: ${regionNames}`);
  }
  
  return lines.join('\n') || 'No taxonomy data provided';
}

function buildUserPrompt(context: any, language: string): string {
  const parts: string[] = [];
  
  parts.push(`PLAN TITLE: ${context.planName || 'New Strategic Plan'}`);
  if (context.planNameAr) parts.push(`TITLE (AR): ${context.planNameAr}`);
  
  if (context.sectors?.length) {
    parts.push(`TARGET SECTORS: ${context.sectors.join(', ')}`);
  }
  
  if (context.regions?.length) {
    parts.push(`TARGET REGIONS: ${context.regions.join(', ')}`);
  }
  
  parts.push(`DURATION: ${context.startYear || 2025} - ${context.endYear || 2030}`);
  
  if (context.budgetRange) {
    parts.push(`BUDGET RANGE: ${context.budgetRange}`);
  }
  
  if (context.stakeholders?.length) {
    const stakeholderNames = context.stakeholders
      .slice(0, 10)
      .map((s: any) => typeof s === 'object' ? (s.name_en || s.name_ar) : s)
      .join(', ');
    parts.push(`KEY STAKEHOLDERS: ${stakeholderNames}`);
  }
  
  if (context.keyChallenges) {
    parts.push(`CHALLENGES NOTED: ${context.keyChallenges.substring(0, 500)}`);
  }
  
  if (context.availableResources) {
    parts.push(`RESOURCES: ${context.availableResources.substring(0, 300)}`);
  }
  
  parts.push(`\nGenerate a comprehensive strategic context with vision, mission, recommended themes, technologies, and core values aligned with MoMAH's mandate and Saudi Vision 2030.`);
  
  return parts.join('\n');
}

function generateFallbackContext(context: any, language: string): any {
  const planName = context.planName || 'Strategic Plan';
  
  return {
    vision_en: `To transform municipal and housing services in Saudi Arabia through innovation, technology, and citizen-centric solutions, creating sustainable, livable cities aligned with Vision 2030.`,
    vision_ar: `تحويل الخدمات البلدية والإسكانية في المملكة العربية السعودية من خلال الابتكار والتقنية والحلول المتمحورة حول المواطن، لخلق مدن مستدامة وصالحة للعيش تتماشى مع رؤية 2030.`,
    mission_en: `To deliver efficient, technology-enabled municipal and housing services that enhance quality of life, promote innovation, and drive sustainable urban development across the Kingdom.`,
    mission_ar: `تقديم خدمات بلدية وإسكانية فعالة ومدعومة بالتقنية تعزز جودة الحياة وتشجع الابتكار وتدفع التنمية الحضرية المستدامة في جميع أنحاء المملكة.`,
    suggested_themes: ['DIGITAL_TRANSFORMATION', 'HOUSING_ACCESS', 'URBAN_DEVELOPMENT', 'CITIZEN_EXPERIENCE'],
    suggested_technologies: ['AI_ML', 'IOT', 'DIGITAL_TWIN', 'GOVTECH'],
    suggested_vision_programs: ['QUALITY_OF_LIFE', 'HOUSING_PROGRAM', 'NTP'],
    key_challenges_en: `Key challenges include accelerating digital transformation, improving housing affordability and access, enhancing municipal service delivery, and building innovation capacity across municipalities.`,
    key_challenges_ar: `تشمل التحديات الرئيسية تسريع التحول الرقمي، وتحسين القدرة على تحمل تكاليف الإسكان والوصول إليه، وتعزيز تقديم الخدمات البلدية، وبناء القدرات الابتكارية عبر البلديات.`,
    core_values: [
      { name_en: 'Innovation', name_ar: 'الابتكار', description_en: 'Embracing new ideas and technologies' },
      { name_en: 'Excellence', name_ar: 'التميز', description_en: 'Striving for highest quality in service delivery' },
      { name_en: 'Citizen-Centric', name_ar: 'التمحور حول المواطن', description_en: 'Putting citizens at the heart of all decisions' },
      { name_en: 'Sustainability', name_ar: 'الاستدامة', description_en: 'Building for the future' }
    ],
    innovation_focus: 'Focus on AI/ML, IoT-enabled smart city solutions, digital twins for urban planning, and PropTech innovations for housing.',
    strategic_rationale: 'This strategic direction aligns with Saudi Vision 2030 goals while addressing critical municipal and housing sector challenges through innovation and technology adoption.'
  };
}

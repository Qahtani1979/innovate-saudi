import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  COMPACT_SAUDI_CONTEXT,
  INNOVATION_EMPHASIS,
  AMANAT_GOVERNANCE_CONTEXT,
  MUNICIPAL_INVESTMENT_CONTEXT
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

    // Build taxonomy context for stakeholder types
    const stakeholderTypesContext = taxonomy?.stakeholderTypes?.length > 0
      ? `Available Stakeholder Types: ${taxonomy.stakeholderTypes.map((t: any) => `${t.code} (${t.name_en})`).join(', ')}`
      : `Standard Types: GOVERNMENT, PRIVATE_SECTOR, ACADEMIC, CITIZEN, NGO, INTERNATIONAL, TECHNOLOGY, INNOVATION`;

    const systemPrompt = `You are an expert strategic planning consultant specializing in stakeholder analysis for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You identify and analyze stakeholders using the Power/Interest matrix methodology.

${COMPACT_SAUDI_CONTEXT}

${AMANAT_GOVERNANCE_CONTEXT}

${MUNICIPAL_INVESTMENT_CONTEXT}

${INNOVATION_EMPHASIS}

### STAKEHOLDER TYPES:
${stakeholderTypesContext}

### YOUR TASK:
Generate a comprehensive stakeholder analysis for the strategic plan. Consider:
1. Government entities (ministries, agencies, Amanats, municipalities)
2. Private sector partners (developers, technology vendors, contractors)
3. Innovation ecosystem (KACST, SDAIA, universities, startups, incubators)
4. Citizens and community groups
5. International partners and organizations
6. Financial institutions and investors

### STAKEHOLDER MATRIX GUIDANCE:
- **Manage Closely** (High Power, High Interest): Key decision-makers who must be actively engaged
- **Keep Satisfied** (High Power, Low Interest): Important but need minimal engagement unless issues arise
- **Keep Informed** (Low Power, High Interest): Supportive stakeholders who want updates
- **Monitor** (Low Power, Low Interest): Minimal attention required

### OUTPUT REQUIREMENTS:
- Generate 14-18 stakeholders with balanced distribution across quadrants
- Include innovation/R&D stakeholders (KACST, SDAIA, universities, tech partners)
- Provide bilingual content (English and Arabic)
- Each stakeholder must have engagement strategy and influence approach

CRITICAL: Respond ONLY with valid JSON, no markdown or explanation.`;

    const wizardData = context.wizardData || {};
    
    const userPrompt = `Generate stakeholder analysis for this strategic plan:

PLAN NAME: ${context.planName || 'Strategic Plan'}
PLAN NAME (AR): ${context.planNameAr || ''}
VISION: ${context.vision || wizardData.vision_en || ''}
MISSION: ${context.mission || wizardData.mission_en || ''}
DESCRIPTION: ${context.description || wizardData.description_en || ''}

STRATEGIC FOCUS:
- Target Sectors: ${(context.sectors || wizardData.target_sectors || []).join(', ') || 'General Municipal Services'}
- Strategic Themes: ${(context.themes || wizardData.strategic_themes || []).join(', ') || 'Digital Transformation, Innovation'}
- Focus Technologies: ${(context.technologies || wizardData.focus_technologies || []).join(', ') || 'AI/ML, IoT, Smart Cities'}
- Vision 2030 Programs: ${(context.vision2030Programs || wizardData.vision_2030_programs || []).join(', ') || 'Quality of Life, Housing'}
- Target Regions: ${(context.regions || wizardData.target_regions || []).join(', ') || 'Kingdom-wide'}

TIMELINE & BUDGET:
- Duration: ${context.startYear || wizardData.start_year || 2025} - ${context.endYear || wizardData.end_year || 2030}
- Budget Range: ${context.budgetRange || wizardData.budget_range || 'To be determined'}

STRATEGIC PILLARS:
${(wizardData.strategic_pillars || []).map((p: any, i: number) => `${i + 1}. ${p.name_en || p.name_ar}`).join('\n') || 'Not yet defined'}

KEY CHALLENGES:
${wizardData.key_challenges_en || context.keyChallenges || 'General municipal challenges'}

QUICK STAKEHOLDERS (from Step 1 - expand these):
${(wizardData.quick_stakeholders || []).map((s: any) => `- ${s.name_en || s}${s.name_ar ? ` (${s.name_ar})` : ''}`).join('\n') || 'None specified'}

Generate JSON with this exact structure:
{
  "stakeholders": [
    {
      "name_en": "Stakeholder Name in English",
      "name_ar": "اسم صاحب المصلحة بالعربية",
      "type": "GOVERNMENT|PRIVATE_SECTOR|ACADEMIC|CITIZEN|NGO|INTERNATIONAL|TECHNOLOGY|INNOVATION",
      "power": "low|medium|high",
      "interest": "low|medium|high",
      "engagement_level": "inform|consult|involve|collaborate|empower",
      "influence_strategy_en": "Strategy to engage this stakeholder (2-3 sentences)",
      "influence_strategy_ar": "استراتيجية للتعامل مع صاحب المصلحة (2-3 جمل)",
      "contact_person_en": "Role/Department to contact",
      "contact_person_ar": "الدور/الإدارة للتواصل",
      "notes_en": "Additional context or considerations",
      "notes_ar": "سياق إضافي أو اعتبارات"
    }
  ],
  "stakeholder_engagement_plan_en": "Overall engagement approach summary (3-4 sentences)",
  "stakeholder_engagement_plan_ar": "ملخص نهج المشاركة الشامل (3-4 جمل)",
  "matrix_insights": {
    "manage_closely_count": 0,
    "keep_satisfied_count": 0,
    "keep_informed_count": 0,
    "monitor_count": 0,
    "key_insight": "Brief insight about stakeholder landscape"
  }
}

DISTRIBUTION REQUIREMENTS:
- Manage Closely (High Power, High Interest): 4-5 stakeholders
- Keep Satisfied (High Power, Low Interest): 3-4 stakeholders
- Keep Informed (Low Power, High Interest): 4-5 stakeholders  
- Monitor (Low Power, Low Interest): 2-3 stakeholders

MANDATORY STAKEHOLDER CATEGORIES (include at least one from each):
1. MoMAH entities (ministry, deputyships, Amanats)
2. Sister ministries (MOF, MCIT, MHRSD, SDAIA)
3. Innovation partners (KACST, KAUST, KFUPM, tech vendors)
4. Private sector (developers, contractors, technology providers)
5. Citizens and community representatives
6. Financial/Investment entities (REDF, PIF, banks)`;

    console.log('Calling Lovable AI for stakeholder generation...');

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

    // Ensure IDs and required fields are present
    if (result.stakeholders) {
      result.stakeholders = result.stakeholders.map((s: any, i: number) => ({
        ...s,
        id: s.id || `stakeholder_${Date.now()}_${i}`,
        type: s.type || 'GOVERNMENT',
        power: s.power || 'medium',
        interest: s.interest || 'medium',
        engagement_level: s.engagement_level || 'consult'
      }));
    }

    console.log(`Successfully generated ${result.stakeholders?.length || 0} stakeholders`);

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in strategy-stakeholder-generator:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

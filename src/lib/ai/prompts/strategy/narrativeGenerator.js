/**
 * Strategic Narrative Generator Prompt
 * Used by: StrategicNarrativeGenerator.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildNarrativeGeneratorPrompt = (plan, pilots, challenges) => {
  const activePilots = pilots.filter(p => p.status === 'active').length;
  const resolvedChallenges = challenges.filter(c => c.status === 'resolved').length;
  const themes = plan?.strategic_themes?.map(t => t.name_en).join(', ') || 'Innovation, Digital Transformation, Sustainability';

  return `${SAUDI_CONTEXT.COMPACT}

You are creating a strategic narrative for Saudi Arabia's Ministry of Municipalities and Housing innovation plan.

## PLAN DETAILS
- Plan Name: ${plan?.name_en || 'Innovation Strategy'}
- Vision: ${plan?.vision_en || 'Advancing municipal innovation'}
- Strategic Themes: ${themes}
- Active Pilots: ${activePilots}
- Resolved Challenges: ${resolvedChallenges}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## NARRATIVE STRUCTURE
Create a compelling 2-page strategic narrative with these sections:

1. **Vision Section** - Inspiring opening that captures the strategic vision
2. **Context Section** - Current state and why this matters for Saudi municipalities
3. **Journey Section** - What has been accomplished and ongoing initiatives
4. **Impact Section** - Data-driven achievements and measurable outcomes
5. **Future Section** - The road ahead and upcoming priorities

Make it:
- Compelling and inspiring
- Data-driven where possible
- Aligned with Vision 2030
- Suitable for executive audiences
- Bilingual (provide both English and Arabic content)`;
};

export const narrativeGeneratorSchema = {
  type: "object",
  required: ["title_en", "title_ar", "vision_section", "context_section"],
  properties: {
    title_en: { type: "string" },
    title_ar: { type: "string" },
    vision_section: { type: "string", minLength: 100 },
    context_section: { type: "string", minLength: 100 },
    journey_section: { type: "string", minLength: 100 },
    impact_section: { type: "string", minLength: 100 },
    future_section: { type: "string", minLength: 100 }
  }
};

export const NARRATIVE_GENERATOR_SYSTEM_PROMPT = `You are a strategic communications specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You create compelling strategic narratives that communicate innovation progress and vision to executive stakeholders.`;

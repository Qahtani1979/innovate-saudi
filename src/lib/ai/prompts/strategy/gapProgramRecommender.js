/**
 * Strategic Gap Program Recommender Prompt
 * Used by: StrategicGapProgramRecommender.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildGapProgramRecommenderPrompt = (gaps, programs, strategicPlans) => {
  const gapsList = gaps.map(g => `- ${g.title.en}: ${g.description.en}`).join('\n');
  const planNames = strategicPlans.map(p => p.name_en || p.title_en).join(', ');

  return `${SAUDI_CONTEXT.COMPACT}

You are recommending innovation programs to address strategic gaps for Saudi Arabia's Ministry of Municipalities and Housing.

## IDENTIFIED STRATEGIC GAPS
${gapsList}

## CONTEXT
- Existing Programs: ${programs.length}
- Strategic Plans: ${planNames}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## RECOMMENDATION REQUIREMENTS
For each gap, recommend a specific program with:
1. Program name (English and Arabic)
2. Program type: capacity_building, innovation_challenge, mentorship, accelerator, or training
3. Key objectives (3 specific objectives)
4. Expected outcomes (3 measurable outcomes)
5. Priority level: P0 (critical), P1 (high), P2 (medium)
6. Estimated duration in months

Ensure recommendations:
- Are actionable and specific
- Align with Vision 2030 priorities
- Address the root cause of each gap
- Consider Saudi municipal context`;
};

export const gapProgramRecommenderSchema = {
  type: 'object',
  required: ['recommendations'],
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['program_name_en', 'program_name_ar', 'program_type', 'priority'],
        properties: {
          gap_type: { type: 'string' },
          program_name_en: { type: 'string' },
          program_name_ar: { type: 'string' },
          program_type: { type: 'string', enum: ['capacity_building', 'innovation_challenge', 'mentorship', 'accelerator', 'training'] },
          objectives: { type: 'array', items: { type: 'string' } },
          outcomes: { type: 'array', items: { type: 'string' } },
          priority: { type: 'string', enum: ['P0', 'P1', 'P2'] },
          duration_months: { type: 'number', minimum: 1, maximum: 36 }
        }
      }
    }
  }
};

export const GAP_PROGRAM_RECOMMENDER_SYSTEM_PROMPT = `You are a strategic program design specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You analyze strategic gaps and recommend tailored innovation programs to address them, ensuring alignment with Vision 2030 and municipal development priorities.`;

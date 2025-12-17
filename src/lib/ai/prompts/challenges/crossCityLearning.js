/**
 * Cross-City Learning Prompt
 * Used by: CrossCityLearning.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildCrossCityLearningPrompt = (currentChallenge, resolvedChallenges) => {
  const resolvedList = resolvedChallenges
    .map(c => `- ${c.title_en} (${c.municipality_id || 'Unknown'}): ${c.resolution_summary || 'Resolved'}`)
    .join('\n');

  return `${SAUDI_CONTEXT.COMPACT}

You are helping a municipality learn from successful solutions implemented by other Saudi cities.

## CURRENT CHALLENGE

**Title:** ${currentChallenge.title_en}
${currentChallenge.title_ar ? `**العنوان:** ${currentChallenge.title_ar}` : ''}
**Description:** ${currentChallenge.description_en || 'Not provided'}
**Sector:** ${currentChallenge.sector || 'General'}
**Municipality:** ${currentChallenge.municipality_id || 'Not specified'}

## RESOLVED CHALLENGES FROM OTHER CITIES

${resolvedList}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS

Find the **3 most similar** resolved challenges and for each provide:

1. **Similarity Analysis:** Why this challenge is relevant
2. **Resolution Approach:** How it was solved (methods, technologies, partnerships)
3. **Results Achieved:** Quantifiable outcomes and improvements
4. **Key Lessons:** 3-5 actionable insights applicable to current challenge

Consider:
- Geographic and demographic similarities
- Resource and budget constraints
- Stakeholder dynamics
- Timeline and implementation complexity`;
};

export const crossCityLearningSchema = {
  type: 'object',
  required: ['similar_cases'],
  properties: {
    similar_cases: {
      type: 'array',
      items: {
        type: 'object',
        required: ['challenge_title', 'municipality', 'similarity_reason', 'resolution_approach', 'results_achieved', 'lessons_learned'],
        properties: {
          challenge_title: { 
            type: 'string',
            description: 'Title of the similar resolved challenge'
          },
          municipality: { 
            type: 'string',
            description: 'Municipality that resolved this challenge'
          },
          similarity_reason: { 
            type: 'string',
            description: 'Why this challenge is similar to the current one'
          },
          resolution_approach: { 
            type: 'string',
            description: 'How the challenge was resolved'
          },
          results_achieved: { 
            type: 'string',
            description: 'Outcomes and improvements achieved'
          },
          lessons_learned: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Key lessons applicable to current challenge'
          }
        }
      }
    }
  }
};

export const CROSS_CITY_LEARNING_SYSTEM_PROMPT = `You are a knowledge transfer specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You help municipalities learn from each other's successes by identifying relevant precedents and extracting actionable insights.`;

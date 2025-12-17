/**
 * Automated Matching Pipeline Prompt
 * Used by: AutomatedMatchingPipeline.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildAutomatedMatchingPrompt = (challenges, solutions) => {
  const challengeSample = challenges.slice(0, 10).map(c => 
    `- ${c.code}: ${c.title_en} (${c.sector})`
  ).join('\n');
  
  const solutionSample = solutions.slice(0, 10).map(s => 
    `- ${s.name_en}: ${s.sectors?.join(', ')}, TRL ${s.trl}`
  ).join('\n');

  return `${SAUDI_CONTEXT.COMPACT}

You are performing automated matching between challenges and solutions for Saudi Arabia's municipal innovation ecosystem.

## MATCHING TASK
Match ${challenges.length} approved challenges with ${solutions.length} available solutions.

## CHALLENGES (sample)
${challengeSample}

## SOLUTIONS (sample)
${solutionSample}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## MATCHING CRITERIA
For each challenge, identify top 3 solution matches based on:
1. Sector alignment
2. Technical capability match
3. TRL appropriateness
4. Implementation feasibility

## OUTPUT REQUIREMENTS
Provide summary statistics:
- Total matches generated
- High confidence matches (>80% score)
- Matches created in system
- Notifications to be sent`;
};

export const automatedMatchingSchema = {
  type: "object",
  required: ["total_matches", "high_confidence"],
  properties: {
    total_matches: { type: "number" },
    high_confidence: { type: "number" },
    matches_created: { type: "number" },
    notifications_sent: { type: "number" },
    match_details: {
      type: "array",
      items: {
        type: "object",
        properties: {
          challenge_code: { type: "string" },
          solution_name: { type: "string" },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
          reason_en: { type: "string" },
          reason_ar: { type: "string" }
        }
      }
    }
  }
};

export const AUTOMATED_MATCHING_SYSTEM_PROMPT = `You are an intelligent matching specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) innovation ecosystem. You analyze challenges and solutions to create optimal matches based on sector alignment, technical requirements, and implementation feasibility.`;

/**
 * MII Improvement Planner Prompt
 * Used by: MIIImprovementPlanner.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildMIIImprovementPrompt = (currentScore, targetImprovement = 10, timeframeMonths = 12) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are creating an MII (Municipal Innovation Index) improvement plan for a Saudi municipality.

## IMPROVEMENT TARGETS

**Current Score:** ${currentScore}
**Target Improvement:** +${targetImprovement} points
**Timeframe:** ${timeframeMonths} months

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## PLANNING REQUIREMENTS

Recommend:

1. **Quick Wins (3-5 items):**
   - Low effort, high impact actions
   - Can be implemented within 1-2 months
   - Immediate score improvements

2. **Strategic Initiatives (3-5 items):**
   - High effort, high impact projects
   - 6-12 month implementation
   - Sustainable long-term improvements

3. **Timeline:**
   - Phased implementation approach
   - Key milestones and checkpoints

Consider MoMAH evaluation criteria:
- Innovation ecosystem maturity
- Citizen engagement levels
- Digital transformation progress
- Partnership effectiveness
- Solution deployment rates`;
};

export const miiImprovementSchema = {
  type: 'object',
  required: ['quick_wins', 'strategic', 'timeline'],
  properties: {
    quick_wins: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Low-effort, high-impact quick wins'
    },
    strategic: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Strategic initiatives for long-term improvement'
    },
    timeline: { 
      type: 'string',
      description: 'Implementation timeline and milestones'
    }
  }
};

export const MII_IMPROVEMENT_SYSTEM_PROMPT = `You are an innovation improvement strategist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You create actionable improvement plans to help municipalities increase their Municipal Innovation Index (MII) scores.`;

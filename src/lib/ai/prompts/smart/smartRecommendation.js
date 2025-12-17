/**
 * Smart Recommendation Prompt
 * Used by: SmartRecommendation.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildSmartRecommendationPrompt = (context) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are providing smart, contextual recommendations for Saudi municipal innovation platform users.

## CONTEXT

### Current Page
${context?.page || 'Home'}

### Entity Type
${context?.entityType || 'N/A'}

### User Role
${context?.userRole || 'user'}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## RECOMMENDATION REQUIREMENTS
Generate 2-3 actionable recommendations based on the context:

Examples:
- "Create R&D Call" if on gap analysis
- "Launch Pilot" if viewing successful challenge
- "Budget allocation will miss target" if on budget tool

Each recommendation should:
- Be specific and actionable
- Relate to the current context
- Include a clear action
- Have priority level (high/medium/low)`;
};

export const smartRecommendationSchema = {
  type: 'object',
  required: ['recommendations'],
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'description', 'action', 'priority'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          action: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] }
        }
      }
    }
  }
};

export const SMART_RECOMMENDATION_SYSTEM_PROMPT = `You are a proactive assistant for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) innovation platform. You provide contextual, actionable recommendations to help users navigate and optimize their innovation workflows.`;

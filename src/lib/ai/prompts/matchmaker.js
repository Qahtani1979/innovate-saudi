/**
 * Matchmaker Success Prediction Prompt Module
 * AI-driven matching between providers and challenges
 * @module prompts/matchmaker
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Match success predictor prompt template
 * @param {Object} provider - Provider profile data
 * @param {Object} challenge - Challenge data
 * @returns {Object} Prompt configuration
 */
export const MATCH_SUCCESS_PREDICTOR_PROMPT_TEMPLATE = ({ provider, challenge }) => ({
    system: `You are an AI Matchmaking Expert for Saudi Arabia's National Innovation Platform.
${SAUDI_CONTEXT.VISION_2030}

Your role is to predict the success probability of matches between Solution Providers and Challenges, considering:
- Technical capability alignment
- Sector expertise and experience
- Track record and credibility
- Budget and resource alignment
- Team capacity and availability`,

    prompt: `Analyze this provider-challenge match and predict success probability:

PROVIDER PROFILE:
- Name: ${provider?.name || 'Unknown'}
- Expertise: ${provider?.expertise?.join(', ') || 'General'}
- Completed Projects: ${provider?.completed_projects || 0}
- Rating: ${provider?.rating || 'N/A'}
- Sector Experience: ${provider?.sector_experience?.join(', ') || 'Not specified'}

CHALLENGE DETAILS:
- Title: ${challenge?.title || 'Unknown'}
- Description: ${challenge?.description || 'N/A'}
- Sector: ${challenge?.sector || 'General'}
- Budget Range: ${challenge?.budget_range || 'Not specified'}
- Required Expertise: ${challenge?.required_expertise?.join(', ') || 'Not specified'}

ANALYSIS REQUIRED:
1. Calculate overall success probability (0-100%)
2. Score key dimensions: Capability Fit, Sector Expertise, Track Record, Budget Alignment, Team Capacity
3. Identify specific risk factors
4. Provide clear recommendation

Output valid JSON.`,

    schema: {
        type: "object",
        properties: {
            success_probability: {
                type: "integer",
                minimum: 0,
                maximum: 100,
                description: "Overall match success probability"
            },
            dimension_scores: {
                type: "object",
                properties: {
                    capability_fit: { type: "integer", minimum: 0, maximum: 100 },
                    sector_expertise: { type: "integer", minimum: 0, maximum: 100 },
                    track_record: { type: "integer", minimum: 0, maximum: 100 },
                    budget_alignment: { type: "integer", minimum: 0, maximum: 100 },
                    team_capacity: { type: "integer", minimum: 0, maximum: 100 }
                },
                required: ["capability_fit", "sector_expertise", "track_record", "budget_alignment", "team_capacity"]
            },
            risk_factors: {
                type: "array",
                items: { type: "string" },
                description: "Identified risks that may affect success"
            },
            recommendation: {
                type: "string",
                enum: ["Strongly Proceed", "Proceed", "Proceed with Caution", "Explore Alternatives", "Do Not Proceed"],
                description: "Final recommendation based on analysis"
            }
        },
        required: ["success_probability", "dimension_scores", "risk_factors", "recommendation"]
    }
});

export default {
    MATCH_SUCCESS_PREDICTOR_PROMPT_TEMPLATE
};

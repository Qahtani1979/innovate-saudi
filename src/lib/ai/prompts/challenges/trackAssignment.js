/**
 * Track Assignment Prompts
 * For recommending treatment tracks for challenges
 * @module prompts/challenges/trackAssignment
 */

export const TRACK_ASSIGNMENT_SYSTEM_PROMPT = `You are a municipal challenge analyst for Saudi Arabia's innovation platform.
Recommend the most suitable treatment track for challenges based on their characteristics.
Consider severity, impact, and feasibility when making recommendations.`;

export const buildTrackAssignmentPrompt = ({ challenge }) => {
  return `Analyze this municipal challenge and recommend the best treatment track:
Title: ${challenge.title_en || 'Untitled'}
Description: ${challenge.description_en || 'No description'}
Severity Score: ${challenge.severity_score || 'N/A'}
Impact Score: ${challenge.impact_score || 'N/A'}

Tracks available:
- pilot: Test solution through controlled pilot project
- r_and_d: Requires research & development
- program: Suitable for program/event format (hackathon, accelerator)
- procurement: Standard procurement solution
- policy: Requires policy/regulatory change
- none: No specific track

Return JSON with: recommended_track, confidence (0-100), reasoning (array of strings)`;
};

export const TRACK_ASSIGNMENT_SCHEMA = {
  type: 'object',
  properties: {
    recommended_track: { 
      type: 'string', 
      enum: ['pilot', 'r_and_d', 'program', 'procurement', 'policy', 'none'] 
    },
    confidence: { type: 'number', description: 'Confidence score 0-100' },
    reasoning: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'List of reasons for the recommendation'
    }
  },
  required: ['recommended_track', 'confidence', 'reasoning']
};

export default {
  system: TRACK_ASSIGNMENT_SYSTEM_PROMPT,
  buildPrompt: buildTrackAssignmentPrompt,
  schema: TRACK_ASSIGNMENT_SCHEMA
};

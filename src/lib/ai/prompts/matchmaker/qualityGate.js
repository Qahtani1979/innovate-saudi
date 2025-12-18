/**
 * Match Quality Gate Prompts
 * For analyzing Matchmaker application quality
 * @module prompts/matchmaker/qualityGate
 */

export const QUALITY_GATE_SYSTEM_PROMPT = `You are a match quality analyst for Saudi Arabia's Matchmaker program.
Evaluate provider-challenge matches for sector alignment, capability fit, and strategic priority.
Provide actionable concerns and opportunities.`;

export const buildQualityGatePrompt = ({ application, matchedChallenges = [] }) => {
  return `Analyze match quality for this Matchmaker application:

APPLICATION:
- Organization: ${application.organization_name_en || 'Unknown'}
- Sectors: ${application.sectors?.join(', ') || 'Not specified'}
- Total Score: ${application.evaluation_score?.total_score || 'N/A'}
- Classification: ${application.classification || 'Unclassified'}

MATCHED CHALLENGES (${matchedChallenges.length}):
${matchedChallenges.map(c => `- ${c.code}: ${c.title_en} (${c.sector})`).join('\n') || 'None'}

Evaluate match quality on:
1. Sector alignment (0-100)
2. Capability fit (0-100)
3. Geographic suitability (0-100)
4. Strategic priority (0-100)
5. Overall match quality (0-100)

Also provide:
- recommendation (approve / review_required / reject)
- concerns (array of strings)
- opportunities (array of strings)`;
};

export const QUALITY_GATE_SCHEMA = {
  type: 'object',
  properties: {
    sector_alignment: { type: 'number', description: 'Sector alignment score 0-100' },
    capability_fit: { type: 'number', description: 'Capability fit score 0-100' },
    geographic_suitability: { type: 'number', description: 'Geographic suitability score 0-100' },
    strategic_priority: { type: 'number', description: 'Strategic priority score 0-100' },
    overall_quality: { type: 'number', description: 'Overall quality score 0-100' },
    recommendation: { type: 'string', enum: ['approve', 'review_required', 'reject'] },
    concerns: { type: 'array', items: { type: 'string' }, description: 'List of concerns' },
    opportunities: { type: 'array', items: { type: 'string' }, description: 'List of opportunities' }
  },
  required: ['sector_alignment', 'capability_fit', 'geographic_suitability', 'strategic_priority', 'overall_quality', 'recommendation']
};

export default {
  system: QUALITY_GATE_SYSTEM_PROMPT,
  buildPrompt: buildQualityGatePrompt,
  schema: QUALITY_GATE_SCHEMA
};

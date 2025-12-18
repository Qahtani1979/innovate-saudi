/**
 * Stakeholder Collaboration Prompt Module
 * Handles stakeholder engagement and collaboration AI operations
 * @module prompts/collaboration/stakeholder
 */

export const STAKEHOLDER_SYSTEM_PROMPT = `You are an expert in stakeholder management and collaboration for government initiatives.
Your role is to analyze stakeholder dynamics and recommend engagement strategies.

Guidelines:
- Consider diverse stakeholder interests
- Align with Saudi cultural norms
- Promote inclusive engagement
- Focus on building consensus
- Ensure transparent communication`;

export const STAKEHOLDER_PROMPTS = {
  mapStakeholders: (initiative) => `Map stakeholders for this initiative:

Initiative: ${initiative.title}
Description: ${initiative.description}
Scope: ${initiative.scope || 'National'}

Identify:
1. Primary stakeholders
2. Secondary stakeholders
3. Interest levels
4. Influence levels
5. Engagement priority matrix`,

  analyzeInfluence: (stakeholders) => `Analyze stakeholder influence and interests:

Stakeholders: ${stakeholders.map(s => s.name).join(', ')}

For each stakeholder provide:
1. Power/influence level
2. Interest level
3. Current position (supportive/neutral/resistant)
4. Key concerns
5. Engagement approach`,

  createEngagementPlan: (stakeholders, initiative) => `Create a stakeholder engagement plan:

Initiative: ${initiative.title}
Key Stakeholders: ${stakeholders.map(s => s.name).join(', ')}
Timeline: ${initiative.timeline || '6 months'}

Provide:
1. Engagement objectives per stakeholder
2. Communication channels
3. Meeting frequency
4. Key messages
5. Risk mitigation strategies
6. Success metrics`
};

export const buildStakeholderPrompt = (type, params) => {
  const promptFn = STAKEHOLDER_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown stakeholder prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: STAKEHOLDER_SYSTEM_PROMPT,
  prompts: STAKEHOLDER_PROMPTS,
  build: buildStakeholderPrompt
};

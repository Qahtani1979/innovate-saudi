/**
 * Communication Strategy Prompt Module
 * Handles strategic communication planning AI operations
 * @module prompts/communications/strategy
 */

export const COMM_STRATEGY_SYSTEM_PROMPT = `You are an expert in government communication strategy.
Your role is to develop effective communication plans aligned with organizational goals.

Guidelines:
- Support bilingual communications (Arabic/English)
- Consider stakeholder diversity
- Align with government communication standards
- Focus on clarity and accessibility`;

export const COMM_STRATEGY_PROMPTS = {
  developStrategy: (initiative, objectives) => `Develop communication strategy:

Initiative: ${initiative.name}
Objectives: ${objectives.join(', ')}
Target Audiences: ${initiative.audiences?.join(', ') || 'General public'}
Timeline: ${initiative.timeline || '6 months'}

Create:
1. Key messages
2. Channel strategy
3. Content calendar outline
4. Stakeholder engagement plan
5. Success metrics
6. Risk mitigation`,

  craftMessage: (topic, audience, tone) => `Craft communication message:

Topic: ${topic}
Target Audience: ${audience}
Tone: ${tone || 'Professional'}
Language: ${topic.language || 'English'}

Provide:
1. Main message (1-2 sentences)
2. Supporting points
3. Call to action
4. Alternative versions
5. Do's and Don'ts`,

  planCampaign: (campaign) => `Plan communication campaign:

Campaign: ${campaign.name}
Goal: ${campaign.goal}
Budget: ${campaign.budget || 'Moderate'}
Duration: ${campaign.duration || '3 months'}

Develop:
1. Campaign objectives
2. Target audience profiles
3. Key messages per audience
4. Channel mix
5. Content plan
6. Measurement framework`
};

export const buildCommStrategyPrompt = (type, params) => {
  const promptFn = COMM_STRATEGY_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown communication strategy prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: COMM_STRATEGY_SYSTEM_PROMPT,
  prompts: COMM_STRATEGY_PROMPTS,
  build: buildCommStrategyPrompt
};

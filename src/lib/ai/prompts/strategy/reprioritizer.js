/**
 * Strategy Reprioritizer Prompts
 * @module strategy/reprioritizer
 */

export const REPRIORITIZER_SYSTEM_PROMPT = 'You are a strategic planning expert. Analyze objectives and suggest optimal priority ordering based on strategic importance, resource availability, quick win potential, and stakeholder demand.';

export const buildReprioritizerPrompt = (items) => `Analyze these strategic objectives and suggest the optimal priority order:

${items.map((item, i) => `${i + 1}. ${item.name}
   - Strategic Importance: ${item.strategicImportance}/10
   - Resource Availability: ${item.resourceAvailability}/10  
   - Quick Win Potential: ${item.quickWinPotential}/10
   - Stakeholder Demand: ${item.stakeholderDemand}/10
   - Current Score: ${item.score}/100`).join('\n\n')}

Provide:
1. Suggested priority order (list of objective names in recommended order)
2. Reasoning for the top 3 priorities
3. Any objectives that should be deprioritized and why`;

export const REPRIORITIZER_SCHEMA = {
  type: 'object',
  properties: {
    suggested_order: { type: 'array', items: { type: 'string' } },
    top_3_reasoning: { type: 'array', items: { type: 'string' } },
    deprioritize: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          name: { type: 'string' }, 
          reason: { type: 'string' } 
        } 
      } 
    }
  },
  required: ['suggested_order', 'top_3_reasoning']
};

export const REPRIORITIZER_PROMPTS = {
  systemPrompt: REPRIORITIZER_SYSTEM_PROMPT,
  buildPrompt: buildReprioritizerPrompt,
  schema: REPRIORITIZER_SCHEMA
};

export default REPRIORITIZER_PROMPTS;

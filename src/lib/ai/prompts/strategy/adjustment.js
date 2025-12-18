/**
 * Strategy Adjustment AI Prompts
 * @module strategy/adjustment
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

// Justification Generation
export const ADJUSTMENT_JUSTIFICATION_SYSTEM_PROMPT = getSystemPrompt('strategy_adjustment', `
You are a strategic planning expert. Help draft professional justifications for strategy adjustments.
Focus on clear reasoning, expected benefits, and risk mitigation.
`);

export function buildAdjustmentJustificationPrompt({ elementType, elementName, changeType, currentValue, newValue }) {
  return `Draft a professional justification for this strategy adjustment:

Element Type: ${elementType || 'Not specified'}
Element: ${elementName || 'Not specified'}
Change Type: ${changeType || 'Not specified'}
Current Value: ${currentValue || 'Not specified'}
New Value: ${newValue || 'Not specified'}

Provide a well-structured justification (2-3 paragraphs) that:
1. Explains why this change is necessary
2. Describes expected benefits
3. Addresses potential risks`;
}

export const ADJUSTMENT_JUSTIFICATION_SCHEMA = {
  type: 'object',
  properties: {
    justification: { type: 'string' }
  },
  required: ['justification']
};

// Impact Analysis
export const ADJUSTMENT_IMPACT_SYSTEM_PROMPT = getSystemPrompt('strategy_impact', `
You are a strategic planning expert. Analyze the potential impact of strategy adjustments.
Consider organizational, financial, and timeline implications.
`);

export function buildAdjustmentImpactPrompt({ elementType, elementName, changeType, currentValue, newValue, justification }) {
  return `Analyze the impact of this strategy adjustment:

Element Type: ${elementType || 'Not specified'}
Element: ${elementName || 'Not specified'}
Change Type: ${changeType || 'Not specified'}
Current Value: ${currentValue}
New Value: ${newValue}
Justification: ${justification}

Provide:
1. Affected entities (list of areas/teams impacted)
2. Budget impact estimate
3. Timeline impact
4. Risk assessment
5. Recommended impact level (low/medium/high)`;
}

export const ADJUSTMENT_IMPACT_SCHEMA = {
  type: 'object',
  properties: {
    affected_entities: { type: 'array', items: { type: 'string' } },
    budget_impact: { type: 'string' },
    timeline_impact: { type: 'string' },
    risks: { type: 'array', items: { type: 'string' } },
    recommended_level: { type: 'string', enum: ['low', 'medium', 'high'] }
  },
  required: ['affected_entities', 'budget_impact', 'timeline_impact', 'recommended_level']
};

export const ADJUSTMENT_PROMPTS = {
  justification: {
    systemPrompt: ADJUSTMENT_JUSTIFICATION_SYSTEM_PROMPT,
    buildPrompt: buildAdjustmentJustificationPrompt,
    schema: ADJUSTMENT_JUSTIFICATION_SCHEMA
  },
  impact: {
    systemPrompt: ADJUSTMENT_IMPACT_SYSTEM_PROMPT,
    buildPrompt: buildAdjustmentImpactPrompt,
    schema: ADJUSTMENT_IMPACT_SCHEMA
  }
};

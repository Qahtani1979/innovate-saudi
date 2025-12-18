/**
 * Strategy Adjustment Wizard Prompts
 * @module strategy/adjustmentWizard
 */

// Justification prompts
export const ADJUSTMENT_JUSTIFICATION_SYSTEM_PROMPT = 'You are a strategic planning expert. Help draft a professional justification for a strategy adjustment.';

export const buildAdjustmentJustificationPrompt = (adjustmentData) => `Draft a professional justification for this strategy adjustment:

Element Type: ${adjustmentData.elementType}
Element: ${adjustmentData.elementName || 'Not specified'}
Change Type: ${adjustmentData.changeType}
Current Value: ${adjustmentData.currentValue || 'Not specified'}
New Value: ${adjustmentData.newValue || 'Not specified'}

Provide a well-structured justification (2-3 paragraphs) that:
1. Explains why this change is necessary
2. Describes expected benefits
3. Addresses potential risks`;

export const ADJUSTMENT_JUSTIFICATION_SCHEMA = {
  type: 'object',
  properties: {
    justification: { type: 'string' }
  },
  required: ['justification']
};

// Impact Analysis prompts
export const ADJUSTMENT_IMPACT_SYSTEM_PROMPT = 'You are a strategic planning expert. Analyze the potential impact of a strategy adjustment.';

export const buildAdjustmentImpactPrompt = (adjustmentData) => `Analyze the impact of this strategy adjustment:

Element Type: ${adjustmentData.elementType}
Element: ${adjustmentData.elementName || 'Not specified'}
Change Type: ${adjustmentData.changeType}
Current Value: ${adjustmentData.currentValue}
New Value: ${adjustmentData.newValue}
Justification: ${adjustmentData.justification}

Provide:
1. Affected entities (list of areas/teams impacted)
2. Budget impact estimate
3. Timeline impact
4. Risk assessment
5. Recommended impact level (low/medium/high)`;

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

export const ADJUSTMENT_WIZARD_PROMPTS = {
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

export default ADJUSTMENT_WIZARD_PROMPTS;

/**
 * Strategy Preplanning Prompts
 * AI prompts for SWOT, Risk, Environmental, Stakeholder, and Input analysis
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

// ==================== SWOT Analysis ====================

export const SWOT_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('swot_analysis', `
You are a strategic planning expert. Generate a comprehensive SWOT analysis based on the provided context.

ANALYSIS GUIDELINES:
1. Provide balanced coverage across all four categories
2. Prioritize items by strategic importance
3. Include bilingual content (English and Arabic)
4. Focus on actionable, specific items
`);

export function buildSWOTAnalysisPrompt(contextInput) {
  return `Context: ${contextInput}

Analyze this context and provide a SWOT analysis with 3-5 items per category. For each item, provide:
- text_en: English description
- text_ar: Arabic description
- priority: high, medium, or low
- description: brief explanation`;
}

export const SWOT_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    strengths: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text_en: { type: 'string' },
          text_ar: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          description: { type: 'string' }
        },
        required: ['text_en', 'priority']
      }
    },
    weaknesses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text_en: { type: 'string' },
          text_ar: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          description: { type: 'string' }
        },
        required: ['text_en', 'priority']
      }
    },
    opportunities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text_en: { type: 'string' },
          text_ar: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          description: { type: 'string' }
        },
        required: ['text_en', 'priority']
      }
    },
    threats: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text_en: { type: 'string' },
          text_ar: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          description: { type: 'string' }
        },
        required: ['text_en', 'priority']
      }
    }
  },
  required: ['strengths', 'weaknesses', 'opportunities', 'threats']
};

// ==================== Risk Assessment ====================

export const RISK_ASSESSMENT_SYSTEM_PROMPT = getSystemPrompt('risk_assessment', `
You are a risk management expert. Identify potential risks for strategic initiatives.

ASSESSMENT CRITERIA:
1. Cover all risk categories (strategic, operational, financial, etc.)
2. Provide probability and impact scores
3. Include mitigation strategies
4. Consider Saudi Arabian context
`);

export function buildRiskAssessmentPrompt(contextInput) {
  return `Context: ${contextInput}

Identify 5-8 key risks for this initiative. For each, provide:
- name_en: Risk name in English
- name_ar: Risk name in Arabic
- description: Brief description
- category: One of strategic, operational, financial, compliance, reputational, technology, political, environmental
- probability: Probability score 1-5
- impact: Impact score 1-5
- mitigation_strategy: How to mitigate`;
}

export const RISK_ASSESSMENT_SCHEMA = {
  type: 'object',
  properties: {
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string', enum: ['strategic', 'operational', 'financial', 'compliance', 'reputational', 'technology', 'political', 'environmental'] },
          probability: { type: 'number', minimum: 1, maximum: 5 },
          impact: { type: 'number', minimum: 1, maximum: 5 },
          mitigation_strategy: { type: 'string' }
        },
        required: ['name_en', 'category', 'probability', 'impact']
      }
    }
  },
  required: ['risks']
};

// ==================== Environmental Scan (PESTLE) ====================

export const ENVIRONMENTAL_SCAN_SYSTEM_PROMPT = getSystemPrompt('environmental_scan', `
You are a strategic planning expert. Generate a comprehensive PESTLE analysis.

ANALYSIS CATEGORIES:
1. Political - Government policies, regulations, stability
2. Economic - Market conditions, inflation, employment
3. Social - Demographics, culture, lifestyle trends
4. Technological - Innovation, digital transformation
5. Legal - Laws, compliance requirements
6. Environmental - Climate, sustainability, resources
`);

export function buildEnvironmentalScanPrompt() {
  return `Generate environmental factors for a PESTLE analysis for a municipal strategic plan. Provide 1-2 factors for EACH of the 6 categories (political, economic, social, technological, legal, environmental). Total should be 6-12 factors covering all categories.

For each factor provide:
- category: one of "political", "economic", "social", "technological", "legal", "environmental"
- title_en: English title
- title_ar: Arabic title  
- description_en: English description
- description_ar: Arabic description
- impact_type: "opportunity" or "threat"
- impact_level: "high", "medium", or "low"
- trend: "increasing", "stable", or "decreasing"`;
}

export const ENVIRONMENTAL_SCAN_SCHEMA = {
  type: 'object',
  properties: {
    factors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['political', 'economic', 'social', 'technological', 'legal', 'environmental'] },
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          impact_type: { type: 'string', enum: ['opportunity', 'threat'] },
          impact_level: { type: 'string', enum: ['high', 'medium', 'low'] },
          trend: { type: 'string', enum: ['increasing', 'stable', 'decreasing'] }
        },
        required: ['category', 'title_en', 'impact_type', 'impact_level']
      }
    }
  },
  required: ['factors']
};

// ==================== Stakeholder Analysis ====================

export const STAKEHOLDER_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('stakeholder_analysis', `
You are a stakeholder analysis expert. Identify and assess key stakeholders.

ASSESSMENT DIMENSIONS:
1. Power - Ability to influence decisions
2. Interest - Level of concern in outcomes
3. Type - Government, private, academic, NGO, citizen, international
4. Expectations - What they want from the initiative
`);

export function buildStakeholderAnalysisPrompt(contextInput) {
  return `Context: ${contextInput}

Identify 5-8 key stakeholders for this initiative. For each, provide:
- name_en: Stakeholder name in English
- name_ar: Stakeholder name in Arabic
- type: One of government, private, academic, ngo, citizen, international
- power: Power level 0-100
- interest: Interest level 0-100
- influence: Brief description of their influence
- expectations: What they expect from this initiative`;
}

export const STAKEHOLDER_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    stakeholders: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          type: { type: 'string', enum: ['government', 'private', 'academic', 'ngo', 'citizen', 'international'] },
          power: { type: 'number', minimum: 0, maximum: 100 },
          interest: { type: 'number', minimum: 0, maximum: 100 },
          influence: { type: 'string' },
          expectations: { type: 'string' }
        },
        required: ['name_en', 'type', 'power', 'interest']
      }
    }
  },
  required: ['stakeholders']
};

// ==================== Strategy Input Collector ====================

export const STRATEGY_INPUT_SYSTEM_PROMPT = getSystemPrompt('strategy_input', `
You are a strategic planning expert. Analyze strategy inputs and extract meaningful themes.

ANALYSIS FOCUS:
1. Identify primary themes
2. Assess sentiment
3. Extract actionable insights
4. Categorize by source type
`);

export function buildStrategyInputPrompt(inputTexts) {
  return `Analyze these strategy inputs and extract key themes for each:

${inputTexts || 'No inputs to analyze yet. Generate sample strategic inputs for a municipal innovation strategy.'}

For each input or for new generated inputs, provide:
- source_type: one of "municipality", "department", "citizen", "expert", "stakeholder"
- source_name: Name of the source
- input_text: The strategic input text
- theme: Primary theme
- sentiment: "positive", "neutral", or "negative"
- ai_extracted_themes: Array of extracted themes`;
}

export const STRATEGY_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    inputs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source_type: { type: 'string', enum: ['municipality', 'department', 'citizen', 'expert', 'stakeholder'] },
          source_name: { type: 'string' },
          input_text: { type: 'string' },
          theme: { type: 'string' },
          sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
          ai_extracted_themes: { type: 'array', items: { type: 'string' } }
        },
        required: ['source_type', 'source_name', 'input_text', 'theme', 'sentiment', 'ai_extracted_themes']
      }
    }
  },
  required: ['inputs']
};

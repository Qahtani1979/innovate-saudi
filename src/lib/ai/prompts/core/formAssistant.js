/**
 * AI Form Assistant Prompt
 * Used by: AIFormAssistant.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildFormAssistantPrompt = (conversationHistory, entityType, userLanguage, municipalityMapping, challengeContext) => {
  return `${SAUDI_CONTEXT.COMPACT}

You are an AI assistant for Saudi National Municipal Innovation Platform. Extract COMPLETE structured data from the conversation.

## CONVERSATION HISTORY
${conversationHistory}

## CRITICAL RULES
1. Respond conversationally in ${userLanguage === 'ar' ? 'Arabic' : 'English'}.
2. Extract ALL fields using Saudi municipal context knowledge.
3. Use ENGLISH enum values for sector/type fields (safety, transport, etc).
4. Generate both AR and EN text content.
5. After 2 user messages, mark has_enough_data=true.

## ENTITY TYPE: ${entityType}

## FIELD EXTRACTION GUIDE
Challenge: Extract ALL fields including municipality_id, sector, sub_sector, tracks, theme, challenge_type, category, title_en, title_ar, tagline_en, tagline_ar, description_en, description_ar, problem_statement_en/ar, current_situation_en/ar, desired_outcome_en/ar, root_cause_en/ar, severity_score (0-100), impact_score (0-100), affected_population, kpis, stakeholders, keywords, budget_estimate, timeline_estimate.

Solution: Extract ALL fields including name_en, name_ar, description_en/ar, tagline_en/ar, provider_name, maturity_level, trl (1-9), features, value_proposition, sectors, categories, matched_challenge_codes.

${municipalityMapping}
${challengeContext}

${LANGUAGE_REQUIREMENTS.BILINGUAL}`;
};

export const formAssistantSchema = {
  type: 'object',
  required: ['response', 'has_enough_data', 'extracted_data'],
  properties: {
    response: { type: 'string' },
    has_enough_data: { type: 'boolean' },
    extracted_data: {
      type: 'object',
      properties: {
        title_en: { type: 'string' },
        title_ar: { type: 'string' },
        tagline_en: { type: 'string' },
        tagline_ar: { type: 'string' },
        description_en: { type: 'string' },
        description_ar: { type: 'string' },
        problem_statement_en: { type: 'string' },
        problem_statement_ar: { type: 'string' },
        current_situation_en: { type: 'string' },
        current_situation_ar: { type: 'string' },
        desired_outcome_en: { type: 'string' },
        desired_outcome_ar: { type: 'string' },
        root_cause_en: { type: 'string' },
        root_cause_ar: { type: 'string' },
        root_causes: { type: 'array', items: { type: 'string' } },
        theme: { type: 'string' },
        sector: { type: 'string', enum: ['urban_design', 'transport', 'environment', 'digital_services', 'health', 'education', 'safety', 'economic_development', 'social_services', 'other'] },
        sub_sector: { type: 'string' },
        challenge_type: { type: 'string', enum: ['service_quality', 'infrastructure', 'efficiency', 'innovation', 'safety', 'environmental', 'digital_transformation', 'other'] },
        category: { type: 'string' },
        municipality_id: { type: 'string' },
        city_id: { type: 'string' },
        region_id: { type: 'string' },
        priority: { type: 'string', enum: ['tier_1', 'tier_2', 'tier_3', 'tier_4'] },
        severity_score: { type: 'number', minimum: 0, maximum: 100 },
        impact_score: { type: 'number', minimum: 0, maximum: 100 },
        affected_population: { 
          type: 'object',
          properties: {
            size: { type: 'number' },
            demographics: { type: 'string' },
            location: { type: 'string' }
          }
        },
        affected_population_size: { type: 'number' },
        kpis: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              name: { type: 'string' },
              baseline: { type: 'string' },
              target: { type: 'string' }
            }
          }
        },
        stakeholders: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string' },
              involvement: { type: 'string' }
            }
          }
        },
        keywords: { type: 'array', items: { type: 'string' } },
        budget_estimate: { type: 'number' },
        timeline_estimate: { type: 'string' },
        matched_challenge_codes: { type: 'array', items: { type: 'string' } }
      }
    },
    next_questions: { type: 'array', items: { type: 'string' } }
  }
};

export const FORM_ASSISTANT_SYSTEM_PROMPT = `You are an AI assistant for Saudi Arabia's National Municipal Innovation Platform. You help users submit challenges, solutions, and other entities by having natural conversations and extracting structured data. Always provide bilingual content (English and Arabic) and use formal Arabic (فصحى) for government documents.`;

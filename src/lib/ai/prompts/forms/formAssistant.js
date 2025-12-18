/**
 * Form Assistant Prompts
 * Conversational AI for form filling
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const FORM_ASSISTANT_SYSTEM_PROMPT = getSystemPrompt('form_assistant', `
You are an AI assistant for Saudi National Municipal Innovation Platform.
Extract COMPLETE structured data from user conversations.
Respond conversationally while gathering form information.
`);

/**
 * Build form assistant prompt
 */
export function buildFormAssistantPrompt(conversationHistory, entityType, userLanguage, municipalityMapping = '', challengeContext = '') {
  return `You are an AI assistant for Saudi National Municipal Innovation Platform. Extract COMPLETE structured data from the conversation.

CONVERSATION:
${conversationHistory}

CRITICAL RULES:
1. Respond conversationally in ${userLanguage === 'ar' ? 'Arabic' : 'English'}.
2. Extract ALL fields using Saudi municipal context knowledge.
3. Use ENGLISH enum values for sector/type fields (safety, transport, etc).
4. Generate both AR and EN text content.
5. After 2 user messages, mark has_enough_data=true.

ENTITY TYPE: ${entityType}

FIELD EXTRACTION GUIDE BY TYPE:

Challenge: Extract ALL fields: municipality_id, city_id, region_id, sector, sub_sector, service_id, affected_services (array), ministry_service, responsible_agency, department, challenge_owner, challenge_owner_email, source, strategic_goal, tracks (array: pilot/r_and_d/program/procurement/policy), theme, challenge_type, category, title_en, title_ar, tagline_en, tagline_ar, description_en, description_ar, problem_statement_en, problem_statement_ar, current_situation_en, current_situation_ar, desired_outcome_en, desired_outcome_ar, root_cause_en, root_cause_ar, root_causes (array), severity_score (0-100), impact_score (0-100), affected_population (object: size, demographics, location), affected_population_size (number), kpis (array of {name, baseline, target}), stakeholders (array of {name, role, involvement}), data_evidence (array of {type, source, value, date, url}), constraints (array of {type, description}), keywords (array), budget_estimate (number), timeline_estimate (string), coordinates (object: {latitude, longitude}), related_questions_count. NOTE: Do NOT extract workflow fields (status, entry_date, processing_date, reviewer, review_date, submission_date, approval_date).

Solution: Extract ALL fields: name_en, name_ar, description_en, description_ar, tagline_en, tagline_ar, provider_name, provider_type, maturity_level, trl (1-9), features (array), value_proposition, use_cases (array), technical_specifications, integration_requirements (array), pricing_model, pricing_details, deployment_options (array), implementation_timeline, support_services (array), certifications (array), compliance_certifications (array), awards (array), deployments (array), case_studies (array), partnerships (array), contact_name, contact_email, contact_phone, website, demo_url, demo_video_url, documentation_url, api_documentation_url, sectors (array), categories (array), matched_challenge_codes (array).

${municipalityMapping}
${challengeContext}

JSON response format:
{
  "response": "Your conversational response here",
  "has_enough_data": false,
  "extracted_data": {
    "title_en": "extracted or null",
    "title_ar": "extracted or null",
    "description_en": "extracted or null",
    "description_ar": "extracted or null",
    "sector": "extracted or null",
    "root_cause_en": "extracted or null",
    "severity_score": 0-100 or null,
    "impact_score": 0-100 or null,
    "affected_population": {"size": number or null, "demographics": "string or null"},
    "keywords": ["array of keywords"],
    "challenge_type": "service_quality/infrastructure/efficiency/innovation/safety/environmental/digital_transformation/other or null"
  },
  "next_questions": ["What should I ask next?"]
}`;
}

export const FORM_ASSISTANT_SCHEMA = {
  type: 'object',
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
        service_id: { type: 'string' },
        affected_services: { type: 'array', items: { type: 'string' } },
        ministry_service: { type: 'string' },
        responsible_agency: { type: 'string' },
        department: { type: 'string' },
        challenge_owner: { type: 'string' },
        challenge_owner_email: { type: 'string' },
        source: { type: 'string' },
        strategic_goal: { type: 'string' },
        priority: { type: 'string', enum: ['tier_1', 'tier_2', 'tier_3', 'tier_4'] },
        track: { type: 'string', enum: ['pilot', 'r_and_d', 'program', 'procurement', 'policy', 'none'] },
        severity_score: { type: 'number' },
        impact_score: { type: 'number' },
        overall_score: { type: 'number' },
        affected_population: { 
          type: 'object',
          properties: {
            size: { type: 'number' },
            demographics: { type: 'string' },
            location: { type: 'string' }
          }
        },
        affected_population_size: { type: 'number' },
        coordinates: {
          type: 'object',
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' }
          }
        },
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
        data_evidence: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              source: { type: 'string' },
              value: { type: 'string' },
              date: { type: 'string' },
              url: { type: 'string' }
            }
          }
        },
        constraints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        keywords: { type: 'array', items: { type: 'string' } },
        budget_estimate: { type: 'number' },
        timeline_estimate: { type: 'string' },
        matched_challenge_codes: { type: 'array', items: { type: 'string' } }
      },
      required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'sector']
    },
    next_questions: { type: 'array', items: { type: 'string' } }
  }
};

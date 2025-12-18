/**
 * Email Template Editor Prompts
 * AI-powered email template generation and analysis
 * @module communications/templateEditor
 * @version 2.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TEMPLATE_EDITOR_SYSTEM_PROMPT = getSystemPrompt('template_editor', `
You are an email template specialist for Saudi government communications.
Your role is to generate professional, bilingual email templates for municipal innovation programs.
Follow Saudi government communication standards and formal Arabic conventions.
`);

/**
 * Build template generation prompt
 * @param {Object} params - Template context data
 * @returns {string} Formatted prompt
 */
export function buildTemplateGeneratePrompt({ templateName, templateKey, categoryLabel }) {
  return `Generate a COMPLETE professional bilingual email template for: "${templateName || templateKey}"
Category: ${categoryLabel}

This is for a Saudi municipal innovation platform (الابتكار السعودي). Generate ALL fields:

REQUIREMENTS:
1. Professional yet warm tone appropriate for government/municipal communication
2. Both English and Arabic versions (use formal Arabic فصحى)
3. Use HTML formatting: <p>, <strong>, <ul>, <li>, <br> tags
4. Include ALL necessary template variables wrapped in {{variableName}} format
5. CTA (Call-to-Action) should be action-oriented and clear
6. Arabic name should be a proper translation of the English name

COMMON VARIABLES TO USE (pick relevant ones):
- {{userName}} - recipient's name
- {{userEmail}} - recipient's email
- {{entityTitle}} - title of challenge/solution/pilot/etc
- {{organizationName}} - organization name
- {{municipalityName}} - municipality name
- {{actionUrl}} - link to take action
- {{dashboardUrl}} - link to dashboard
- {{deadline}} - deadline date
- {{status}} - current status
- {{score}} - evaluation score
- {{roleName}} - role name
- {{rejectionReason}} - reason for rejection if applicable

Generate a complete, production-ready email template.`;
}

export const TEMPLATE_GENERATE_SCHEMA = {
  type: 'object',
  properties: {
    name_en: { type: 'string', description: 'English display name for the template' },
    name_ar: { type: 'string', description: 'Arabic display name for the template' },
    subject_en: { type: 'string', description: 'English email subject line' },
    subject_ar: { type: 'string', description: 'Arabic email subject line' },
    body_en: { type: 'string', description: 'Full English email body with HTML formatting' },
    body_ar: { type: 'string', description: 'Full Arabic email body with HTML formatting' },
    header_title_en: { type: 'string', description: 'English header/banner title' },
    header_title_ar: { type: 'string', description: 'Arabic header/banner title' },
    cta_text_en: { type: 'string', description: 'English call-to-action button text' },
    cta_text_ar: { type: 'string', description: 'Arabic call-to-action button text' },
    cta_url_variable: { type: 'string', description: 'Variable name for CTA URL like actionUrl or dashboardUrl' },
    variables: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'List of all variable names used in the template (without curly braces)'
    }
  },
  required: ['name_en', 'name_ar', 'subject_en', 'subject_ar', 'body_en', 'body_ar', 'header_title_en', 'header_title_ar', 'cta_text_en', 'cta_text_ar', 'variables']
};

/**
 * Build template analysis prompt
 * @param {Object} params - Analysis context data
 * @returns {string} Formatted prompt
 */
export function buildTemplateAnalysisPrompt({ templateCount, templateSummary, categoryCounts }) {
  return `Analyze this email template database for a Saudi municipal innovation platform (bilingual EN/AR).

TEMPLATES (${templateCount} total):
${JSON.stringify(templateSummary, null, 2)}

CATEGORY DISTRIBUTION:
${JSON.stringify(categoryCounts, null, 2)}

Provide a comprehensive analysis covering:
1. Overall health assessment (score 1-100)
2. Coverage gaps (missing templates for common workflows)
3. Consistency issues (templates missing Arabic, headers, CTAs)
4. Category balance (over/under represented categories)
5. Specific recommendations for improvement
6. Best practices compliance
7. Suggested new templates to add`;
}

export const TEMPLATE_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    overall_score: { type: 'number' },
    health_summary: { type: 'string' },
    coverage_gaps: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          gap: { type: 'string' },
          priority: { type: 'string' },
          suggested_template: { type: 'string' }
        }
      }
    },
    consistency_issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          issue: { type: 'string' },
          affected_templates: { type: 'array', items: { type: 'string' } },
          fix: { type: 'string' }
        }
      }
    },
    category_analysis: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          status: { type: 'string' },
          recommendation: { type: 'string' }
        }
      }
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    },
    suggested_templates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          template_key: { type: 'string' },
          category: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' }
        }
      }
    }
  }
};

// Legacy exports for backwards compatibility
export const TEMPLATE_EDITOR_SCHEMA = TEMPLATE_GENERATE_SCHEMA;
export function buildTemplateEditorPrompt(params) {
  return buildTemplateGeneratePrompt(params);
}

export const TEMPLATE_EDITOR_PROMPTS = {
  systemPrompt: TEMPLATE_EDITOR_SYSTEM_PROMPT,
  buildPrompt: buildTemplateEditorPrompt,
  schema: TEMPLATE_EDITOR_SCHEMA,
  buildGeneratePrompt: buildTemplateGeneratePrompt,
  generateSchema: TEMPLATE_GENERATE_SCHEMA,
  buildAnalysisPrompt: buildTemplateAnalysisPrompt,
  analysisSchema: TEMPLATE_ANALYSIS_SCHEMA
};

/**
 * Email Template AI Prompts
 * Centralized prompts for email template generation and analysis
 * @module communications/emailTemplates
 */

import { getSystemPrompt } from '@/lib/saudiContext';

// Template variables reference
const TEMPLATE_VARIABLES = [
  '{{userName}}', '{{userEmail}}', '{{entityTitle}}', '{{organizationName}}',
  '{{municipalityName}}', '{{actionUrl}}', '{{dashboardUrl}}', '{{deadline}}',
  '{{status}}', '{{score}}', '{{roleName}}', '{{rejectionReason}}'
];

/**
 * System prompt for email template AI operations
 */
export const EMAIL_TEMPLATE_SYSTEM_PROMPT = getSystemPrompt('communications_email_template');

/**
 * Build prompt for generating email template content
 * @param {Object} template - Template data
 * @param {string} categoryLabel - Category label
 * @returns {string} Formatted prompt
 */
export const buildEmailGenerationPrompt = (template, categoryLabel) => `Generate a COMPLETE professional bilingual email template for: "${template.name_en || template.template_key}"
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
${TEMPLATE_VARIABLES.map(v => `- ${v}`).join('\n')}

Generate a complete, production-ready email template.`;

/**
 * JSON schema for email template generation
 */
export const EMAIL_GENERATION_SCHEMA = {
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
 * Build prompt for analyzing email template database
 * @param {Array} templates - List of templates
 * @param {Array} categoryCounts - Category distribution
 * @returns {string} Formatted prompt
 */
export const buildEmailAnalysisPrompt = (templates, categoryCounts) => {
  const templateSummary = templates.map(t => ({
    key: t.template_key,
    category: t.category,
    name: t.name_en,
    hasArabic: !!t.body_ar,
    hasHeader: t.use_header,
    hasFooter: t.use_footer,
    hasCTA: !!t.cta_text_en,
    variableCount: t.variables?.length || 0,
    isActive: t.is_active,
    isSystem: t.is_system,
    isCritical: t.is_critical
  }));

  return `Analyze this email template database for a Saudi municipal innovation platform (bilingual EN/AR).

TEMPLATES (${templates.length} total):
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
};

/**
 * JSON schema for email template analysis
 */
export const EMAIL_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    health_score: { type: 'number', minimum: 0, maximum: 100 },
    summary: { type: 'string' },
    coverage_gaps: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          category: { type: 'string' },
          missing_template: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] }
        }
      }
    },
    consistency_issues: {
      type: 'array',
      items: { type: 'string' }
    },
    category_analysis: {
      type: 'object',
      properties: {
        overrepresented: { type: 'array', items: { type: 'string' } },
        underrepresented: { type: 'array', items: { type: 'string' } }
      }
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' }
    },
    suggested_templates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          template_key: { type: 'string' },
          category: { type: 'string' },
          purpose: { type: 'string' }
        }
      }
    }
  }
};

/**
 * Email template prompts namespace
 */
export const EMAIL_TEMPLATE_PROMPTS = {
  systemPrompt: EMAIL_TEMPLATE_SYSTEM_PROMPT,
  buildGenerationPrompt: buildEmailGenerationPrompt,
  generationSchema: EMAIL_GENERATION_SCHEMA,
  buildAnalysisPrompt: buildEmailAnalysisPrompt,
  analysisSchema: EMAIL_ANALYSIS_SCHEMA,
  templateVariables: TEMPLATE_VARIABLES
};

export default EMAIL_TEMPLATE_PROMPTS;

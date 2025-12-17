/**
 * Campaign AI Helpers Prompts
 * AI-powered content generation for email campaigns
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * System prompt for campaign content generation
 */
export const CAMPAIGN_CONTENT_SYSTEM_PROMPT = `You are an expert email copywriter for a government innovation platform. 
Generate compelling email content that is:
- Clear and concise
- Action-oriented with clear CTAs
- Appropriate for the specified tone
- Engaging and professional
- Culturally appropriate for Saudi Arabia

Return your response in this exact JSON format:
{
  "subject_en": "English subject line",
  "subject_ar": "Arabic subject line",
  "body_en": "Full English email body in HTML format",
  "body_ar": "Full Arabic email body in HTML format"
}`;

/**
 * System prompt for translation
 */
export const CAMPAIGN_TRANSLATION_SYSTEM_PROMPT = `You are a professional translator specializing in government and innovation communications.
Translate the text accurately while:
- Maintaining the original tone and style
- Using appropriate formal language
- Preserving any HTML formatting
- Being culturally appropriate for Saudi Arabia

Return ONLY the translated text, no explanations.`;

/**
 * System prompt for content improvement
 */
export const CAMPAIGN_IMPROVEMENT_SYSTEM_PROMPT = `You are an expert email copywriter.
Improve the given email text according to the instruction.
Preserve any HTML formatting.
Return ONLY the improved text, no explanations.`;

/**
 * System prompt for subject line generation
 */
export const CAMPAIGN_SUBJECT_SYSTEM_PROMPT = `You are an email marketing expert specializing in subject lines that get opened.
Generate 5 compelling subject line variations.

Return your response as a JSON array:
["Subject 1", "Subject 2", "Subject 3", "Subject 4", "Subject 5"]`;

/**
 * Build campaign content generation prompt
 * @param {Object} params - Generation parameters
 * @returns {string} Formatted prompt
 */
export function buildCampaignContentPrompt({ campaignType, tone, topic, keyPoints }) {
  return `Generate a ${campaignType} email with a ${tone} tone.

Topic: ${topic}
${keyPoints ? `Key Points to Include:\n${keyPoints}` : ''}

The email should:
1. Have an attention-grabbing subject line
2. Include a compelling opening
3. Clearly communicate the main message
4. Have a clear call-to-action
5. Include proper HTML formatting with paragraphs

Generate both English and Arabic versions.`;
}

/**
 * Build translation prompt
 * @param {Object} params - Translation parameters
 * @returns {string} Formatted prompt
 */
export function buildCampaignTranslationPrompt({ text, targetLanguage }) {
  return `Translate the following text to ${targetLanguage}:\n\n${text}`;
}

/**
 * Build improvement prompt
 * @param {Object} params - Improvement parameters
 * @returns {string} Formatted prompt
 */
export function buildCampaignImprovementPrompt({ text, improvementType }) {
  const improvementInstructions = {
    clarity: 'Make it clearer and easier to understand',
    concise: 'Make it more concise without losing meaning',
    engaging: 'Make it more engaging and compelling',
    formal: 'Make it more formal and professional',
    friendly: 'Make it warmer and more friendly',
    persuasive: 'Make it more persuasive with stronger CTAs'
  };

  return `${improvementInstructions[improvementType]}:\n\n${text}`;
}

/**
 * Build subject lines generation prompt
 * @param {Object} params - Generation parameters
 * @returns {string} Formatted prompt
 */
export function buildSubjectLinesPrompt({ context, language }) {
  return `Generate 5 email subject line variations for:
${context}

Requirements:
- Under 60 characters each
- Mix of styles: curiosity, benefit-driven, urgency, personalization
- Appropriate for government/innovation platform
- Generate in ${language === 'ar' ? 'Arabic' : 'English'}`;
}

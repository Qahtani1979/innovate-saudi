/**
 * Researcher Profile Enhancer Prompts
 * AI-powered suggestions for improving researcher profiles
 * @version 1.0.0
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const RESEARCHER_PROFILE_ENHANCER_SYSTEM_PROMPT = getSystemPrompt('researcher_profile_enhancer', `
You are an academic profile optimization specialist for Saudi Arabia's municipal innovation ecosystem.
Your role is to analyze researcher profiles and suggest improvements for better visibility and matching.
Focus on research areas relevant to municipal challenges, Vision 2030 alignment, and collaboration potential.
`);

/**
 * Build researcher profile enhancement prompt
 * @param {Object} profile - Researcher profile data
 * @param {Array} challenges - Active municipal challenges
 * @returns {string} Formatted prompt
 */
export function buildResearcherProfileEnhancerPrompt(profile, challenges = []) {
  return `Analyze this researcher profile and suggest enhancements:

CURRENT PROFILE:
Name: ${profile.name_en || profile.full_name_en || 'Unknown'}
Institution: ${profile.institution || 'Not specified'}
Department: ${profile.department || 'Not specified'}
Title: ${profile.title_en || profile.academic_title || 'Not specified'}
Research Areas: ${profile.research_areas?.join(', ') || 'None listed'}
Expertise Keywords: ${profile.expertise_keywords?.join(', ') || 'None'}
Bio: ${profile.bio_en || 'No bio provided'}
H-Index: ${profile.h_index || 'Unknown'}
Citation Count: ${profile.citation_count || 'Unknown'}
ORCID: ${profile.orcid_id || 'Not linked'}
Google Scholar: ${profile.google_scholar_url ? 'Linked' : 'Not linked'}

ACTIVE MUNICIPAL CHALLENGES (for context):
${challenges.slice(0, 10).map(c => `- ${c.title_en}: ${c.sector || 'General'}`).join('\n') || 'No active challenges'}

Provide:
1. Profile completeness score (0-100)
2. Missing critical fields
3. Suggested research area additions based on challenges
4. Recommended expertise keywords for better matching
5. Bio improvement suggestions
6. Collaboration opportunities based on profile strengths`;
}

export const RESEARCHER_PROFILE_ENHANCER_SCHEMA = {
  type: "object",
  properties: {
    completeness_score: { type: "number", description: "Profile completeness 0-100" },
    missing_fields: {
      type: "array",
      items: { type: "string" },
      description: "Critical missing profile fields"
    },
    suggested_research_areas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area_en: { type: "string" },
          area_ar: { type: "string" },
          relevance_reason: { type: "string" }
        }
      }
    },
    suggested_keywords: {
      type: "array",
      items: { type: "string" }
    },
    bio_suggestions: {
      type: "object",
      properties: {
        current_issues: { type: "array", items: { type: "string" } },
        improvement_tips: { type: "array", items: { type: "string" } },
        sample_bio_en: { type: "string" },
        sample_bio_ar: { type: "string" }
      }
    },
    collaboration_opportunities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          opportunity_type: { type: "string" },
          description_en: { type: "string" },
          description_ar: { type: "string" },
          potential_impact: { type: "string" }
        }
      }
    }
  },
  required: ["completeness_score", "missing_fields", "suggested_research_areas"]
};

export const RESEARCHER_PROFILE_ENHANCER_PROMPTS = {
  systemPrompt: RESEARCHER_PROFILE_ENHANCER_SYSTEM_PROMPT,
  buildPrompt: buildResearcherProfileEnhancerPrompt,
  schema: RESEARCHER_PROFILE_ENHANCER_SCHEMA
};

export default RESEARCHER_PROFILE_ENHANCER_PROMPTS;

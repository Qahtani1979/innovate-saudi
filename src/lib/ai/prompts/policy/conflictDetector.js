/**
 * Policy Conflict Detection Prompts
 * @module policy/conflictDetector
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const POLICY_CONFLICT_SYSTEM_PROMPT = getSystemPrompt('policy_analysis');

export const buildPolicyConflictPrompt = (policy, activePolicies) => `You are a Saudi legal and policy expert. Analyze this policy for conflicts with existing policies.

POLICY TO ANALYZE (ARABIC):
Title: ${policy.title_ar}
Recommendation: ${policy.recommendation_text_ar}
Regulatory Framework: ${policy.regulatory_framework}

EXISTING ACTIVE POLICIES (${activePolicies.length}):
${activePolicies.slice(0, 10).map((p, i) => `
${i+1}. ${p.title_ar || p.title_en}
   Framework: ${p.regulatory_framework || 'N/A'}
   Type: ${p.policy_type || 'N/A'}
   Recommendation: ${(p.recommendation_text_ar || p.recommendation_text_en || '').substring(0, 200)}...
`).join('\n')}

Identify:
1. Direct conflicts (contradictory regulations)
2. Overlaps (same regulatory space)
3. Dependencies (requires other policy first)
4. Gaps (missing prerequisite policies)

Return structured analysis in Arabic:`;

export const POLICY_CONFLICT_SCHEMA = {
  type: 'object',
  properties: {
    has_conflicts: { type: 'boolean' },
    direct_conflicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          policy_title: { type: 'string' },
          conflict_type: { type: 'string' },
          description: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] }
        }
      }
    },
    overlaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          policy_title: { type: 'string' },
          overlap_area: { type: 'string' }
        }
      }
    },
    dependencies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          policy_needed: { type: 'string' },
          reason: { type: 'string' }
        }
      }
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

export const POLICY_CONFLICT_PROMPTS = {
  systemPrompt: POLICY_CONFLICT_SYSTEM_PROMPT,
  buildPrompt: buildPolicyConflictPrompt,
  schema: POLICY_CONFLICT_SCHEMA
};

export default POLICY_CONFLICT_PROMPTS;

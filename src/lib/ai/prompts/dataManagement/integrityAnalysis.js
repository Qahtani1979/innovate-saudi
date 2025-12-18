/**
 * Data Integrity Analysis Prompts
 * @module dataManagement/integrityAnalysis
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const INTEGRITY_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('data_management');

export const buildIntegrityAnalysisPrompt = ({
  regions,
  cities,
  orphanedCities,
  orphanedOrgs,
  qualityIssues,
  calculateDataScore
}) => `You are a data integrity expert for Saudi Municipal Innovation Platform. Analyze ALL data issues and provide comprehensive fix recommendations.

Available Regions: ${regions.map(r => `${r.id}: ${r.name_en}`).join(', ')}
Available Cities: ${cities.map(c => `${c.id}: ${c.name_en} (region: ${c.region_id})`).join(', ')}

ORPHANED RECORDS:

Orphaned Cities (${orphanedCities.length}):
${orphanedCities.map(c => `- ${c.name_en} (id: ${c.id}, invalid region_id: ${c.region_id})`).join('\n') || 'None'}

Orphaned Organizations (${orphanedOrgs.length}):
${orphanedOrgs.map(o => `- ${o.name_en} (id: ${o.id}, invalid region_id: ${o.region_id || 'none'}, invalid city_id: ${o.city_id || 'none'})`).join('\n') || 'None'}

DATA QUALITY ISSUES:

${qualityIssues.map(issue => {
  if (issue.type === 'duplicate_organizations') {
    return `Duplicate Organizations (${issue.count} pairs):\n${issue.items.map(pair => `- "${pair[0].name_en}" (${pair[0].id}, score: ${calculateDataScore?.(pair[0]) || 'N/A'}%) vs "${pair[1].name_en}" (${pair[1].id}, score: ${calculateDataScore?.(pair[1]) || 'N/A'}%)`).join('\n')}`;
  }
  if (issue.type === 'duplicate_cities') {
    return `Duplicate Cities (${issue.count} pairs):\n${issue.items.map(pair => `- "${pair[0].name_en}" (${pair[0].id}) vs "${pair[1].name_en}" (${pair[1].id})`).join('\n')}`;
  }
  return '';
}).join('\n\n')}

Provide specific fixes with actions (DELETE, REASSIGN, FIX_PARTNERSHIP, ENRICH_DATA, VERIFY, etc).`;

export const INTEGRITY_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    city_fixes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          city_id: { type: 'string' },
          city_name: { type: 'string' },
          action: { type: 'string' },
          target_region_id: { type: 'string' },
          target_region_name: { type: 'string' },
          estimated_population: { type: 'number' },
          duplicate_of_id: { type: 'string' },
          reason: { type: 'string' }
        }
      }
    },
    org_fixes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          org_id: { type: 'string' },
          org_name: { type: 'string' },
          issue_type: { type: 'string' },
          action: { type: 'string' },
          target_region_id: { type: 'string' },
          target_city_id: { type: 'string' },
          reason: { type: 'string' }
        }
      }
    },
    summary: { type: 'string' },
    total_issues: { type: 'number' },
    critical_count: { type: 'number' }
  }
};

export const INTEGRITY_ANALYSIS_PROMPTS = {
  systemPrompt: INTEGRITY_ANALYSIS_SYSTEM_PROMPT,
  buildPrompt: buildIntegrityAnalysisPrompt,
  schema: INTEGRITY_ANALYSIS_SCHEMA
};

export default INTEGRITY_ANALYSIS_PROMPTS;

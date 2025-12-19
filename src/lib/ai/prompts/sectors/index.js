/**
 * Sectors & Taxonomy AI Prompts
 * Centralized exports for sector-related AI functionality
 * @module prompts/sectors
 */

import { getSystemPrompt } from '@/lib/saudiContext';

// Re-export from taxonomy prompts
export { 
  buildTaxonomyGeneratorPrompt, 
  taxonomyGeneratorSchema, 
  TAXONOMY_GENERATOR_SYSTEM_PROMPT 
} from '../taxonomy/taxonomyGenerator';

export { 
  buildTaxonomyGapPrompt, 
  taxonomyGapSchema, 
  TAXONOMY_GAP_SYSTEM_PROMPT 
} from '../taxonomy/taxonomyGap';

export { 
  buildSectorBenchmarkPrompt, 
  SECTOR_BENCHMARK_SCHEMA, 
  SECTOR_BENCHMARK_SYSTEM_PROMPT 
} from '../taxonomy/sectorBenchmark';

export {
  TAXONOMY_SUGGESTIONS_PROMPT_TEMPLATE,
  TAXONOMY_SUGGESTIONS_RESPONSE_SCHEMA,
  TAXONOMY_SUGGESTIONS_SYSTEM_PROMPT
} from '../taxonomy/suggestions';

export {
  buildTaxonomyPrompt,
  TAXONOMY_SCHEMA,
  TAXONOMY_SYSTEM_PROMPT
} from '../taxonomy/generator';

/**
 * System prompt for sector analysis
 */
export const SECTOR_ANALYSIS_SYSTEM_PROMPT = getSystemPrompt('sector_analysis', `
You are a sector analysis specialist for Saudi Arabia's municipal innovation platform.
Analyze sector performance, identify opportunities, and provide strategic recommendations.
Focus on Vision 2030 alignment and innovation potential.
`);

/**
 * Build sector analysis prompt
 */
export function buildSectorAnalysisPrompt({ sector, challenges, pilots, solutions }) {
  return `Analyze this sector's innovation landscape:

## Sector: ${sector.name_en} (${sector.name_ar || 'N/A'})

### Current Activity
- Active Challenges: ${challenges?.length || 0}
- Active Pilots: ${pilots?.length || 0}
- Available Solutions: ${solutions?.length || 0}

### Analysis Requirements
1. Innovation Maturity Assessment
2. Key Opportunity Areas
3. Gaps and Missing Capabilities
4. Recommendations for Growth
5. Vision 2030 Alignment Score

Provide bilingual insights where applicable.`;
}

/**
 * Sector analysis response schema
 */
export const SECTOR_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    maturity_assessment: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['emerging', 'developing', 'established', 'advanced', 'leading'] },
        score: { type: 'number', minimum: 0, maximum: 100 },
        rationale_en: { type: 'string' },
        rationale_ar: { type: 'string' }
      }
    },
    opportunity_areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          area_en: { type: 'string' },
          area_ar: { type: 'string' },
          potential: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          description: { type: 'string' }
        }
      }
    },
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gap_en: { type: 'string' },
          gap_ar: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          recommendation: { type: 'string' }
        }
      }
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          description: { type: 'string' },
          expected_impact: { type: 'string' }
        }
      }
    },
    vision_2030_alignment: {
      type: 'object',
      properties: {
        score: { type: 'number', minimum: 0, maximum: 100 },
        aligned_programs: { type: 'array', items: { type: 'string' } },
        improvement_areas: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  required: ['maturity_assessment', 'opportunity_areas', 'recommendations']
};

/**
 * Sector comparison prompt
 */
export function buildSectorComparisonPrompt({ sectors, metrics }) {
  const sectorList = sectors.map(s => `- ${s.name_en}: ${s.challenges || 0} challenges, ${s.pilots || 0} pilots`).join('\n');
  
  return `Compare these sectors for municipal innovation performance:

## Sectors
${sectorList}

## Comparison Metrics
${metrics?.join(', ') || 'Innovation activity, growth rate, impact score'}

Provide:
1. Ranking by overall performance
2. Strengths of each sector
3. Cross-sector collaboration opportunities
4. Resource allocation recommendations`;
}

/**
 * Export all prompts
 */
export const SECTOR_PROMPTS = {
  analysis: {
    systemPrompt: SECTOR_ANALYSIS_SYSTEM_PROMPT,
    buildPrompt: buildSectorAnalysisPrompt,
    schema: SECTOR_ANALYSIS_SCHEMA
  },
  comparison: {
    buildPrompt: buildSectorComparisonPrompt
  }
};

export default SECTOR_PROMPTS;

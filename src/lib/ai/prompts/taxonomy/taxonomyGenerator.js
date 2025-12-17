/**
 * AI Taxonomy Generator Prompt
 * Used by: AITaxonomyGenerator.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildTaxonomyGeneratorPrompt = (sectors, challenges, solutions) => {
  const sectorList = sectors.map(s => s.name_en).join(', ');
  const challengeKeywords = [...new Set(challenges.flatMap(c => c.keywords || []))].slice(0, 20).join(', ');
  const solutionCategories = [...new Set(solutions.flatMap(s => s.categories || []))].slice(0, 20).join(', ');

  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing the platform taxonomy to suggest improvements for Saudi municipal innovation.

## CURRENT TAXONOMY

**Sectors (${sectors.length}):** ${sectorList}
**Total Challenges:** ${challenges.length}
**Total Solutions:** ${solutions.length}

**Challenge Themes:** ${challengeKeywords || 'None extracted'}
**Solution Categories:** ${solutionCategories || 'None extracted'}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS

Provide:
1. **Missing Sectors:** Sectors that should exist based on challenge/solution patterns
2. **Suggested Subsectors:** Breakdown for each existing sector
3. **Missing Services:** Municipal services not in current catalog
4. **Taxonomy Gaps:** Areas with many challenges but no clear sector
5. **Consolidation Opportunities:** Overlapping sectors/services to merge

Align suggestions with Vision 2030 priorities and MoMAH objectives.`;
};

export const taxonomyGeneratorSchema = {
  type: 'object',
  required: ['missing_sectors', 'suggested_subsectors', 'missing_services', 'taxonomy_gaps', 'consolidation_opportunities'],
  properties: {
    missing_sectors: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name_en', 'name_ar', 'code', 'rationale'],
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          code: { type: 'string' },
          rationale: { type: 'string' }
        }
      }
    },
    suggested_subsectors: {
      type: 'array',
      items: {
        type: 'object',
        required: ['sector_name', 'subsector_name_en', 'subsector_name_ar', 'rationale'],
        properties: {
          sector_name: { type: 'string' },
          subsector_name_en: { type: 'string' },
          subsector_name_ar: { type: 'string' },
          rationale: { type: 'string' }
        }
      }
    },
    missing_services: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name_en', 'name_ar', 'sector', 'rationale'],
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          sector: { type: 'string' },
          rationale: { type: 'string' }
        }
      }
    },
    taxonomy_gaps: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'List of identified taxonomy gaps'
    },
    consolidation_opportunities: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'Opportunities to merge or consolidate sectors/services'
    }
  }
};

export const TAXONOMY_GENERATOR_SYSTEM_PROMPT = `You are a taxonomy specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You analyze municipal service taxonomies to ensure comprehensive coverage aligned with Vision 2030 objectives.`;

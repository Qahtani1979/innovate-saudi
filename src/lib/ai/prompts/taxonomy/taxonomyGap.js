/**
 * Taxonomy Gap Detector Prompt
 * Used by: TaxonomyGapDetector.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildTaxonomyGapPrompt = (sectors, subsectors, services) => {
  const taxonomyData = sectors.map(sector => ({
    sector: sector.name_en,
    subsector_count: subsectors.filter(ss => ss.sector_id === sector.id).length,
    service_count: subsectors
      .filter(ss => ss.sector_id === sector.id)
      .reduce((sum, ss) => sum + services.filter(srv => srv.subsector_id === ss.id).length, 0)
  }));

  const sectorsWithoutSubsectors = sectors
    .filter(s => !subsectors.some(ss => ss.sector_id === s.id))
    .map(s => s.name_en)
    .join(', ');

  const subsectorsWithoutServices = subsectors
    .filter(ss => !services.some(srv => srv.subsector_id === ss.id))
    .length;

  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing taxonomy completeness for the Saudi municipal innovation platform.

## CURRENT TAXONOMY STRUCTURE

${JSON.stringify(taxonomyData, null, 2)}

**Sectors with no subsectors:** ${sectorsWithoutSubsectors || 'None'}
**Subsectors with no services:** ${subsectorsWithoutServices}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## GAP ANALYSIS REQUIREMENTS

Identify:
1. **Missing Subsectors:** Sectors needing more breakdown
2. **Missing Services:** Subsectors without mapped services
3. **Structural Gaps:** Taxonomy imbalances or missing areas with severity levels

For each gap, provide bilingual names and specific recommendations.`;
};

export const taxonomyGapSchema = {
  type: 'object',
  required: ['missing_subsectors', 'missing_services', 'structural_gaps'],
  properties: {
    missing_subsectors: {
      type: 'array',
      items: {
        type: 'object',
        required: ['sector_en', 'sector_ar', 'suggested_subsectors'],
        properties: {
          sector_en: { type: 'string' },
          sector_ar: { type: 'string' },
          suggested_subsectors: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    missing_services: {
      type: 'array',
      items: {
        type: 'object',
        required: ['subsector_en', 'subsector_ar', 'suggested_services'],
        properties: {
          subsector_en: { type: 'string' },
          subsector_ar: { type: 'string' },
          suggested_services: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    structural_gaps: {
      type: 'array',
      items: {
        type: 'object',
        required: ['gap_en', 'gap_ar', 'severity', 'recommendation_en', 'recommendation_ar'],
        properties: {
          gap_en: { type: 'string' },
          gap_ar: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          recommendation_en: { type: 'string' },
          recommendation_ar: { type: 'string' }
        }
      }
    }
  }
};

export const TAXONOMY_GAP_SYSTEM_PROMPT = `You are a taxonomy analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You identify gaps in municipal service taxonomies and provide actionable recommendations for improvement.`;

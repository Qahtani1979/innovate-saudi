/**
 * Geographic Clustering Prompt
 * Used by: GeographicClustering.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildGeographicClusteringPrompt = (entities, entityType) => {
  const entitiesWithGeo = entities.filter(e => e.coordinates || e.municipality_id);
  const entityList = entitiesWithGeo.slice(0, 30).map(e => `
  Title: ${e.title_en || e.name_en}
  Municipality: ${e.municipality_id}
  Sector: ${e.sector || e.sectors?.join(',')}
  Coordinates: ${e.coordinates ? `${e.coordinates.latitude},${e.coordinates.longitude}` : 'N/A'}
`).join('\n');

  return `${SAUDI_CONTEXT.COMPACT}

You are analyzing geographic patterns in Saudi municipal innovation data.

## GEOGRAPHIC DATA

### Entity Type
${entityType}

### Entities with Geographic Data (${entitiesWithGeo.length})
${entityList}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS
Identify:
1. Geographic clusters (areas with high concentration)
2. Regional patterns (common themes by region)
3. Underserved areas (municipalities with few initiatives)
4. Cross-city opportunities (similar ${entityType}s that could collaborate)
5. Geographic gaps (areas needing attention)

Focus on:
- Saudi Arabia's 13 regions
- Municipal development priorities
- Vision 2030 geographic focus areas
- Urban-rural development balance`;
};

export const geographicClusteringSchema = {
  type: 'object',
  required: ['clusters'],
  properties: {
    clusters: {
      type: 'array',
      items: {
        type: 'object',
        required: ['region', 'entity_count'],
        properties: {
          region: { type: 'string' },
          municipality_count: { type: 'number' },
          entity_count: { type: 'number' },
          common_themes: { type: 'array', items: { type: 'string' } },
          priority_level: { type: 'string' }
        }
      }
    },
    regional_patterns: { type: 'array', items: { type: 'string' } },
    underserved_areas: { type: 'array', items: { type: 'string' } },
    collaboration_opportunities: { 
      type: 'array', 
      items: {
        type: 'object',
        properties: {
          municipalities: { type: 'array', items: { type: 'string' } },
          theme: { type: 'string' },
          potential: { type: 'string' }
        }
      }
    },
    geographic_gaps: { type: 'array', items: { type: 'string' } }
  }
};

export const GEOGRAPHIC_CLUSTERING_SYSTEM_PROMPT = `You are a geographic intelligence analyst for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You analyze spatial patterns in municipal innovation data to identify clusters, underserved areas, and collaboration opportunities across Saudi Arabia's regions.`;
